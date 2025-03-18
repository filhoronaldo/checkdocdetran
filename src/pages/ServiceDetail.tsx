
import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Service } from "@/types";
import { initialServices } from "@/data/services";
import Layout from "@/components/Layout";
import ChecklistItem from "@/components/ChecklistItem";
import { Pencil, Trash2, ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { Card, CardContent } from "@/components/ui/card";
import AnimatedTransition from "@/components/AnimatedTransition";
import { useAuth } from "@/contexts/AuthContext";

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [services, setServices] = useLocalStorage<Service[]>("services", initialServices);
  const { isAuthenticated } = useAuth();
  
  const service = services.find(s => s.id === id);
  const [progressCounts, setProgressCounts] = useState<{
    completed: number;
    total: number;
    requiredCompleted: number;
    requiredTotal: number;
  }>({
    completed: 0,
    total: 0,
    requiredCompleted: 0,
    requiredTotal: 0
  });

  const updateProgress = useCallback(() => {
    if (!service) return;
    
    let completed = 0;
    let total = 0;
    let requiredCompleted = 0;
    let requiredTotal = 0;
    
    service.checklists.forEach(checklist => {
      checklist.items.forEach(item => {
        // Count all items
        total++;
        if (item.isCompleted) completed++;
        
        // Count required items (not optional)
        if (!item.isOptional && !checklist.isOptional) {
          requiredTotal++;
          if (item.isCompleted) requiredCompleted++;
        }
      });
    });
    
    setProgressCounts({
      completed,
      total,
      requiredCompleted,
      requiredTotal
    });
  }, [service]);

  // Update progress counts when service changes
  useState(() => {
    updateProgress();
  });

  const handleToggleItem = (checklistId: string, itemId: string, isCompleted: boolean) => {
    if (!service) return;

    const updatedServices = services.map(s => {
      if (s.id !== service.id) return s;

      const updatedChecklists = s.checklists.map(checklist => {
        if (checklist.id !== checklistId) return checklist;

        const updatedItems = checklist.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, isCompleted };
        });

        return { ...checklist, items: updatedItems };
      });

      return { ...s, checklists: updatedChecklists };
    });

    setServices(updatedServices);
    updateProgress();
  };

  const handleDeleteService = () => {
    const updatedServices = services.filter(s => s.id !== id);
    setServices(updatedServices);
    toast.success("Serviço removido com sucesso!");
    navigate("/");
  };

  const handleDuplicateService = () => {
    navigate(`/admin/edit/${id}`, { state: { isDuplicating: true } });
  };

  if (!service) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold mb-4">Serviço não encontrado</h1>
          <Button onClick={() => navigate("/")}>Voltar para a lista de serviços</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <AnimatedTransition animation="slide-down">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold">{service.title}</h1>
            </div>
            
            {isAuthenticated && (
              <div className="flex gap-2 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleDuplicateService}
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Duplicar</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => navigate(`/admin/edit/${service.id}`)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Excluir</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteService}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </AnimatedTransition>

        <AnimatedTransition animation="fade">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Categoria</h3>
                  <p>{service.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
                  <p className="whitespace-pre-line">{service.description}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-medium">{progressCounts.completed}</span>
                    <span className="text-muted-foreground"> de </span>
                    <span className="font-medium">{progressCounts.total}</span>
                    <span className="text-muted-foreground"> itens concluídos</span>
                  </div>
                  
                  <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out"
                      style={{ 
                        width: `${progressCounts.total > 0 ? (progressCounts.completed / progressCounts.total) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedTransition>

        <AnimatedTransition animation="slide-up">
          <div className="space-y-8 mb-10">
            {service.checklists.map((checklist) => (
              <Card key={checklist.id} className={`
                border overflow-hidden
                ${checklist.isOptional ? 'border-amber-200' : ''}
                ${checklist.isAlternative ? 'border-blue-200' : ''}
              `}>
                <div className={`
                  px-4 py-2
                  ${checklist.isOptional ? 'bg-amber-50/30' : ''}
                  ${checklist.isAlternative ? 'bg-blue-50/30' : ''}
                `}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{checklist.title}</h3>
                    {(checklist.isOptional || checklist.isAlternative) && (
                      <div className="flex gap-2">
                        {checklist.isOptional && (
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                            Opcional
                          </span>
                        )}
                        {checklist.isAlternative && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                            Escolha uma das opções
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="divide-y">
                  {checklist.items.map((item) => (
                    <ChecklistItem 
                      key={item.id}
                      item={item}
                      onChange={(isChecked) => handleToggleItem(checklist.id, item.id, isChecked)}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </AnimatedTransition>
      </div>
    </Layout>
  );
}
