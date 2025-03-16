
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

  useEffect(() => {
    const foundService = services.find(s => s.id === id);
    if (foundService) {
      setService(foundService);
      
      // Only count required items and non-optional sections
      const requiredSections = foundService.checklists.filter(checklist => !checklist.isOptional);
      
      let totalRequiredItems = 0;
      let completedRequiredItems = 0;
      
      requiredSections.forEach(checklist => {
        const requiredItems = checklist.items.filter(item => !item.isOptional);
        totalRequiredItems += requiredItems.length;
        completedRequiredItems += requiredItems.filter(item => item.isCompleted).length;
      });
      
      setAllCompleted(totalRequiredItems > 0 && completedRequiredItems === totalRequiredItems);
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
    
    // Recalculate all completed status - only for required items in required sections
    const requiredSections = updatedService.checklists.filter(checklist => !checklist.isOptional);
    let totalRequiredItems = 0;
    let completedRequiredItems = 0;
    
    requiredSections.forEach(checklist => {
      const requiredItems = checklist.items.filter(item => !item.isOptional);
      totalRequiredItems += requiredItems.length;
      completedRequiredItems += requiredItems.filter(item => item.isCompleted).length;
    });
    
    setAllCompleted(totalRequiredItems > 0 && completedRequiredItems === totalRequiredItems);
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
  
  const deleteService = () => {
    if (!service) return;
    
    const updatedServices = services.filter(s => s.id !== service.id);
    setServices(updatedServices);
    
    toast.success("Serviço removido com sucesso!");
    navigate("/");
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

  // Group alternative items with their main item
  const getAlternativeItems = (checklist: ChecklistGroup, item: ChecklistItemType) => {
    // If item is already an alternative, return empty array
    if (item.alternativeOf) return [];
    
    // Get all alternatives for this item
    return checklist.items.filter(i => 
      i.alternativeOf === item.id || 
      (item.alternativeOf && i.alternativeOf === item.alternativeOf && i.id !== item.id)
    );
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
  
  // Calculate overall progress (only required items in required sections)
  const requiredSections = service.checklists.filter(checklist => !checklist.isOptional);
  let totalRequiredItems = 0;
  let completedRequiredItems = 0;
  
  requiredSections.forEach(checklist => {
    const requiredItems = checklist.items.filter(item => !item.isOptional);
    totalRequiredItems += requiredItems.length;
    completedRequiredItems += requiredItems.filter(item => item.isCompleted).length;
  });
  
  const progressPercentage = totalRequiredItems > 0 
    ? (completedRequiredItems / totalRequiredItems) * 100 
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
              {completedRequiredItems} de {totalRequiredItems} documentos obrigatórios verificados
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
                <h3 className="font-medium">Todos os documentos obrigatórios verificados!</h3>
                <p className="text-sm text-muted-foreground">
                  Você completou a verificação de todos os documentos obrigatórios para este serviço.
                </p>
              </div>
            </Card>
          </AnimatedTransition>
        )}
        
        <div className="space-y-8">
          {service.checklists.map((checklist) => {
            // Calculate progress for this section (only required items)
            const sectionProgress = calculateProgress(checklist);
            
            // For displaying items, we need to filter out alternatives to avoid duplication
            const mainItems = checklist.items.filter(item => !item.alternativeOf);
            
            return (
              <div key={checklist.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "text-xl font-semibold flex items-center gap-2",
                    checklist.isOptional ? "text-amber-700" : ""
                  )}>
                    {checklist.title}
                    {checklist.isOptional && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        Só em casos específicos
                      </span>
                    )}
                  </h3>
                  
                  {/* Progress bar for the section */}
                  {checklist.items.filter(item => !item.isOptional).length > 0 && (
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
                </div>
                
                <AnimatePresence>
                  {mainItems.map((item) => {
                    // Get all alternatives for this item
                    const alternatives = getAlternativeItems(checklist, item);
                    
                    return (
                      <ChecklistItem 
                        key={item.id} 
                        item={item} 
                        onToggle={(itemId) => handleToggleItem(checklist.id, itemId)}
                        alternativeItems={alternatives}
                        isInOptionalSection={checklist.isOptional}
                      />
                    );
                  })}
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
