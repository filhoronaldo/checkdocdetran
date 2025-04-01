import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Service, ChecklistItem as ChecklistItemType, ChecklistGroup } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Layout from "@/components/Layout";
import ChecklistItem from "@/components/ChecklistItem";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Pencil, RotateCcw, Trash2, Share } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { initialServices } from "@/data/services";
import { useAuth } from "@/contexts/AuthContext";
import supabase, { getAuthToken } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AnimatedTransition from "@/components/AnimatedTransition";

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [services, setServices] = useLocalStorage<Service[]>("services", initialServices);
  const [service, setService] = useState<Service | null>(null);
  const [allCompleted, setAllCompleted] = useState(false);
  const { isAuthenticated } = useAuth();

  // Calculate progress for each section and overall
  const calculateProgress = (checklist: ChecklistGroup) => {
    // Get only required items (non-optional)
    const requiredItems = checklist.items.filter(item => !item.isOptional);
    
    // If no required items, return 100% (all done)
    if (requiredItems.length === 0) return 100;
    
    // Count completed required items
    const completedRequiredItems = requiredItems.filter(item => item.isCompleted).length;
    
    // Calculate percentage
    return (completedRequiredItems / requiredItems.length) * 100;
  };

  // Check if a section is completed
  const isSectionCompleted = (checklist: ChecklistGroup) => {
    // If it's an alternative section, check if any item is completed
    if (checklist.isAlternative) {
      return checklist.items.some(item => item.isCompleted);
    } 
    
    // Otherwise, all required items must be completed
    const requiredItems = checklist.items.filter(item => !item.isOptional);
    return requiredItems.length > 0 && 
           requiredItems.every(item => item.isCompleted);
  };

  useEffect(() => {
    const foundService = services.find(s => s.id === id);
    if (foundService) {
      setService(foundService);
      
      // Only count required items and non-optional sections
      const requiredSections = foundService.checklists.filter(checklist => !checklist.isOptional);
      
      // Check if all required sections are completed
      const allSectionsCompleted = requiredSections.every(section => {
        if (section.isAlternative) {
          // For alternative sections, any completed item completes the section
          return section.items.some(item => item.isCompleted);
        } else {
          // For regular sections, all required items must be completed
          const requiredItems = section.items.filter(item => !item.isOptional);
          return requiredItems.length > 0 && 
                 requiredItems.every(item => item.isCompleted);
        }
      });
      
      setAllCompleted(allSectionsCompleted);
    }
  }, [id, services]);

  useEffect(() => {
    return () => {
      if (service) {
        const updatedService = {
          ...service,
          checklists: service.checklists.map(checklist => ({
            ...checklist,
            items: checklist.items.map(item => ({
              ...item,
              isCompleted: false
            }))
          }))
        };
        
        setServices(prevServices => 
          prevServices.map(s => s.id === service.id ? updatedService : s)
        );
      }
    };
  }, []);

  const handleToggleItem = (checklistGroupId: string, itemId: string) => {
    if (!service) return;
    
    const updatedService = {
      ...service,
      checklists: service.checklists.map(checklist => {
        if (checklist.id === checklistGroupId) {
          return {
            ...checklist,
            items: checklist.items.map(item => {
              if (item.id === itemId) {
                return { ...item, isCompleted: !item.isCompleted };
              }
              return item;
            })
          };
        }
        return checklist;
      })
    };
    
    setService(updatedService);
    
    setServices(prevServices => 
      prevServices.map(s => s.id === service.id ? updatedService : s)
    );
    
    // Recalculate all completed status
    const requiredSections = updatedService.checklists.filter(checklist => !checklist.isOptional);
    
    // Check if all required sections are completed
    const allSectionsCompleted = requiredSections.every(section => {
      if (section.isAlternative) {
        // For alternative sections, any completed item completes the section
        return section.items.some(item => item.isCompleted);
      } else {
        // For regular sections, all required items must be completed
        const requiredItems = section.items.filter(item => !item.isOptional);
        return requiredItems.length > 0 && 
               requiredItems.every(item => item.isCompleted);
      }
    });
    
    setAllCompleted(allSectionsCompleted);
  };
  
  const resetAllItems = () => {
    if (!service) return;
    
    const updatedService = {
      ...service,
      checklists: service.checklists.map(checklist => ({
        ...checklist,
        items: checklist.items.map(item => ({
          ...item,
          isCompleted: false
        }))
      }))
    };
    
    setService(updatedService);
    
    const updatedServices = services.map(s => 
      s.id === service.id ? updatedService : s
    );
    setServices(updatedServices);
    setAllCompleted(false);
    
    toast.success("Checklist reiniciado com sucesso!");
  };
  
  const deleteService = async () => {
    if (!service) return;
    
    try {
      // Get auth token for authentication
      const token = await getAuthToken();
      
      if (!token) {
        toast.error("Erro de autenticação. Faça login novamente.");
        return;
      }
      
      // First delete all checklist items associated with this service
      for (const checklist of service.checklists) {
        // Delete all items in this checklist
        const { error: itemsError } = await supabase
          .from('ckdt_checklist_items')
          .delete()
          .eq('checklist_id', checklist.id);
          
        if (itemsError) {
          console.error('Error deleting checklist items:', itemsError);
          toast.error(`Erro ao excluir itens do checklist: ${itemsError.message}`);
          return;
        }
        
        // Then delete the checklist itself
        const { error: checklistError } = await supabase
          .from('ckdt_checklists')
          .delete()
          .eq('id', checklist.id);
          
        if (checklistError) {
          console.error('Error deleting checklist:', checklistError);
          toast.error(`Erro ao excluir checklist: ${checklistError.message}`);
          return;
        }
      }
      
      // Finally delete the service
      const { error: serviceError } = await supabase
        .from('ckdt_services')
        .delete()
        .eq('id', service.id);
        
      if (serviceError) {
        console.error('Error deleting service:', serviceError);
        toast.error(`Erro ao excluir serviço: ${serviceError.message}`);
        return;
      }
      
      // Also update local storage
      const updatedServices = services.filter(s => s.id !== service.id);
      setServices(updatedServices);
      
      toast.success("Serviço removido com sucesso!");
      navigate("/");
    } catch (error) {
      console.error('Error in delete operation:', error);
      toast.error("Ocorreu um erro ao remover o serviço");
    }
  };
  
  const handleShare = () => {
    if (!service) return;
    
    try {
      const serviceUrl = window.location.href;
      navigator.clipboard.writeText(serviceUrl)
        .then(() => {
          toast.success("Link copiado para a área de transferência!");
        })
        .catch(() => {
          toast.error("Falha ao copiar o link!");
        });
    } catch (error) {
      toast.error("Seu navegador não suporta esta funcionalidade!");
    }
  };
  
  if (!service) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold">Serviço não encontrado</h2>
          <p className="text-muted-foreground mt-2">
            O serviço que você está procurando não existe ou foi removido.
          </p>
          <Button className="mt-4" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a lista
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Calculate overall progress
  const requiredSections = service.checklists.filter(checklist => !checklist.isOptional);
  
  // Count how many required sections are completed
  const completedRequiredSections = requiredSections.filter(section => {
    if (section.isAlternative) {
      // For alternative sections, any completed item completes the section
      return section.items.some(item => item.isCompleted);
    } else {
      // For regular sections, all required items must be completed
      const requiredItems = section.items.filter(item => !item.isOptional);
      return requiredItems.length > 0 && 
             requiredItems.every(item => item.isCompleted);
    }
  }).length;
  
  const progressPercentage = requiredSections.length > 0 
    ? (completedRequiredSections / requiredSections.length) * 100 
    : 0;
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <AnimatedTransition animation="slide-down">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold line-clamp-1">{service.title}</h1>
              </div>
            </AnimatedTransition>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleShare}
              >
                <Share className="h-4 w-4" />
                Compartilhar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={resetAllItems}
              >
                <RotateCcw className="h-4 w-4" />
                Reiniciar
              </Button>
              
              {isAuthenticated && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => navigate(`/admin/edit/${service.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir serviço</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este serviço? Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={deleteService}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-2 py-1">
              {service.category}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {completedRequiredSections} de {requiredSections.length} seções obrigatórias completadas
            </span>
          </div>
          
          <p className="text-muted-foreground">{service.description}</p>
          
          <div className="w-full bg-muted rounded-full h-2.5 mt-2">
            <motion.div 
              className="bg-completed h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        <Separator />
        
        {allCompleted && (
          <AnimatedTransition animation="bounce">
            <Card className="bg-completed/10 border-completed/30 p-4 flex items-center gap-4">
              <div className="bg-completed rounded-full p-1.5">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium">Todas as seções obrigatórias foram completadas!</h3>
                <p className="text-sm text-muted-foreground">
                  Você completou a verificação de todas as seções obrigatórias para este serviço.
                </p>
              </div>
            </Card>
          </AnimatedTransition>
        )}
        
        <div className="space-y-8">
          {service.checklists.map((checklist) => {
            // Calculate progress for this section
            const sectionProgress = calculateProgress(checklist);
            
            // Check if section is completed
            const isCompleted = isSectionCompleted(checklist);
            
            return (
              <div key={checklist.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "text-xl font-semibold flex items-center gap-2",
                    checklist.isOptional ? "text-amber-700" : "",
                    checklist.isAlternative ? "text-blue-700" : ""
                  )}>
                    {checklist.title}
                    <div className="flex items-center gap-2">
                      {checklist.isOptional && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          Só em casos específicos
                        </span>
                      )}
                      {checklist.isAlternative && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Seção alternativa
                        </span>
                      )}
                    </div>
                  </h3>
                  
                  {/* Progress bar for the section */}
                  {checklist.items.filter(item => !item.isOptional).length > 0 && !checklist.isAlternative && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(sectionProgress)}%
                      </span>
                      <div className="w-24 bg-muted rounded-full h-1.5">
                        <motion.div 
                          className="bg-completed h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${sectionProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {checklist.isAlternative && (
                    <div className="flex items-center">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isCompleted 
                          ? "bg-completed/20 text-completed" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? "Completo" : "Selecione um item"}
                      </span>
                    </div>
                  )}
                </div>
                
                <AnimatePresence>
                  {checklist.items.map((item) => (
                    <ChecklistItem 
                      key={item.id} 
                      item={item} 
                      onToggle={(itemId) => handleToggleItem(checklist.id, itemId)}
                      isInOptionalSection={checklist.isOptional}
                      isInAlternativeSection={checklist.isAlternative}
                      isSectionCompleted={isCompleted}
                    />
                  ))}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

// Helper function for class names
function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(" ");
}
