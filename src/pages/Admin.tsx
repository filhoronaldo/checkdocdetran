import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Service, ServiceFormData, ServiceCategory } from "@/types";
import { initialServices } from "@/data/services";
import Layout from "@/components/Layout";
import ServiceForm from "@/components/ServiceForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AnimatedTransition from "@/components/AnimatedTransition";

export default function Admin() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [services, setServices] = useLocalStorage<Service[]>("services", initialServices);
  const isEditMode = !!id;

  const serviceToEdit = isEditMode 
    ? services.find(service => service.id === id) 
    : undefined;

  const handleCreateService = (data: ServiceFormData) => {
    const newService: Service = {
      id: uuidv4(),
      title: data.title,
      category: data.category,
      description: data.description,
      checklists: data.checklists.map(checklist => ({
        id: uuidv4(),
        title: checklist.title,
        items: checklist.items.map(item => ({
          id: uuidv4(),
          text: item,
          isCompleted: false
        }))
      }))
    };

    setServices([...services, newService]);
    toast.success("Serviço criado com sucesso!");
    navigate("/");
  };

  const handleUpdateService = (data: ServiceFormData) => {
    if (!id) return;

    const updatedService: Service = {
      id,
      title: data.title,
      category: data.category,
      description: data.description,
      checklists: data.checklists.map(checklist => {
        // Check if this is an existing checklist group or a new one
        const existingGroup = serviceToEdit?.checklists.find(g => g.title === checklist.title);
        
        return {
          id: existingGroup?.id || uuidv4(),
          title: checklist.title,
          items: checklist.items.map((item, index) => {
            // Try to preserve existing items and their completion state
            const existingItem = existingGroup?.items[index];
            return {
              id: existingItem?.id || uuidv4(),
              text: item,
              isCompleted: existingItem?.isCompleted || false
            };
          })
        };
      })
    };

    const updatedServices = services.map(service => 
      service.id === id ? updatedService : service
    );

    setServices(updatedServices);
    toast.success("Serviço atualizado com sucesso!");
    navigate(`/service/${id}`);
  };

  const getDefaultValues = (): ServiceFormData | undefined => {
    if (!serviceToEdit) return undefined;

    return {
      title: serviceToEdit.title,
      category: serviceToEdit.category as ServiceCategory,
      description: serviceToEdit.description,
      checklists: serviceToEdit.checklists.map(checklist => ({
        title: checklist.title,
        items: checklist.items.map(item => item.text)
      }))
    };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <AnimatedTransition animation="slide-down">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => isEditMode ? navigate(`/service/${id}`) : navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Editar Serviço" : "Novo Serviço"}
            </h1>
          </div>
        </AnimatedTransition>

        <AnimatedTransition animation="scale">
          <ServiceForm 
            onSubmit={isEditMode ? handleUpdateService : handleCreateService}
            defaultValues={getDefaultValues()}
            submitLabel={isEditMode ? "Atualizar Serviço" : "Cadastrar Serviço"}
          />
        </AnimatedTransition>
      </div>
    </Layout>
  );
}
