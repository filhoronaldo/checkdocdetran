import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Service, ChecklistItem as ChecklistItemType } from "@/types";
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

  useEffect(() => {
    const foundService = services.find(s => s.id === id);
    if (foundService) {
      setService(foundService);
      
      // Check if all items are completed
      const totalItems = foundService.checklists.reduce(
        (acc, checklist) => acc + checklist.items.length, 
        0
      );
      
      const completedItems = foundService.checklists.reduce(
        (acc, checklist) => acc + checklist.items.filter(item => item.isCompleted).length, 
        0
      );
      
      setAllCompleted(totalItems > 0 && completedItems === totalItems);
    }
  }, [id, services]);

  // Reset checklist when unmounting - but store in a ref to prevent recreation on each render
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
  }, []); // Remove setServices from dependencies
  
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
    
    // Update the service in the services array using functional update
    setServices(prevServices => 
      prevServices.map(s => s.id === service.id ? updatedService : s)
    );
    
    // Check if all items are completed
    const totalItems = updatedService.checklists.reduce(
      (acc, checklist) => acc + checklist.items.length, 
      0
    );
    
    const completedItems = updatedService.checklists.reduce(
      (acc, checklist) => acc + checklist.items.filter(item => item.isCompleted).length, 
      0
    );
    
    setAllCompleted(totalItems > 0 && completedItems === totalItems);
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
    
    // Update the service in the services array
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
  
  const totalItems = service.checklists.reduce(
    (acc, checklist) => acc + checklist.items.length, 
    0
  );
  
  const completedItems = service.checklists.reduce(
    (acc, checklist) => acc + checklist.items.filter(item => item.isCompleted).length, 
    0
  );
  
  const progressPercentage = totalItems > 0 
    ? (completedItems / totalItems) * 100 
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
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-2 py-1">
              {service.category}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {completedItems} de {totalItems} documentos verificados
            </span>
          </div>
          
          <p className="text-muted-foreground">{service.description}</p>
          
          {/* Progress bar */}
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
                <h3 className="font-medium">Todos os documentos verificados!</h3>
                <p className="text-sm text-muted-foreground">
                  Você completou a verificação de todos os documentos para este serviço.
                </p>
              </div>
            </Card>
          </AnimatedTransition>
        )}
        
        <div className="space-y-8">
          {service.checklists.map((checklist) => (
            <div key={checklist.id} className="space-y-3">
              <h3 className="text-xl font-semibold">{checklist.title}</h3>
              <AnimatePresence>
                {checklist.items.map((item) => (
                  <ChecklistItem 
                    key={item.id} 
                    item={item} 
                    onToggle={(itemId) => handleToggleItem(checklist.id, itemId)} 
                  />
                ))}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
