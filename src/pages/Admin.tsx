
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
import { useAuth } from "@/contexts/AuthContext";
import supabase from "@/lib/supabase";

export default function Admin() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [services, setServices] = useLocalStorage<Service[]>("services", initialServices);
  const { isAuthenticated, isLoading } = useAuth();
  const isEditMode = !!id;

  // Check if user is authenticated
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }
  
  if (!isAuthenticated) {
    navigate("/login", { state: { from: isEditMode ? `/admin/edit/${id}` : "/admin" } });
    return null;
  }

  const serviceToEdit = isEditMode 
    ? services.find(service => service.id === id) 
    : undefined;

  const handleCreateService = async (data: ServiceFormData) => {
    try {
      const newService: Service = {
        id: uuidv4(),
        title: data.title,
        category: data.category,
        description: data.description,
        checklists: data.checklists.map(checklist => ({
          id: uuidv4(),
          title: checklist.title,
          isOptional: checklist.isOptional,
          isAlternative: checklist.isAlternative,
          items: checklist.items.map(item => ({
            id: uuidv4(),
            text: item.text,
            observation: item.observation || undefined,
            tags: item.tags || undefined,
            isOptional: item.isOptional,
            isCompleted: false
          }))
        }))
      };

      // Save to local storage first
      setServices([...services, newService]);
      
      // Save to Supabase
      const { error: serviceError } = await supabase
        .from('ckdt_services')
        .insert({
          id: newService.id,
          title: newService.title,
          category: newService.category,
          description: newService.description
        });
      
      if (serviceError) throw serviceError;

      // Save checklists
      for (const checklist of newService.checklists) {
        const { error: checklistError } = await supabase
          .from('ckdt_checklists')
          .insert({
            id: checklist.id,
            service_id: newService.id,
            title: checklist.title,
            is_optional: checklist.isOptional || false,
            is_alternative: checklist.isAlternative || false
          });
        
        if (checklistError) throw checklistError;

        // Save checklist items
        for (const item of checklist.items) {
          const { error: itemError } = await supabase
            .from('ckdt_checklist_items')
            .insert({
              id: item.id,
              checklist_id: checklist.id,
              text: item.text,
              observation: item.observation,
              tags: item.tags,
              is_optional: item.isOptional || false
            });
          
          if (itemError) throw itemError;
        }
      }
      
      toast.success("Serviço criado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("Erro ao salvar o serviço no banco de dados");
    }
  };

  const handleUpdateService = async (data: ServiceFormData) => {
    if (!id) return;

    try {
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
            isOptional: checklist.isOptional,
            isAlternative: checklist.isAlternative,
            items: checklist.items.map((item, index) => {
              // Try to preserve existing items and their completion state
              const existingItem = existingGroup?.items[index];
              return {
                id: existingItem?.id || uuidv4(),
                text: item.text,
                observation: item.observation || undefined,
                tags: item.tags || undefined,
                isOptional: item.isOptional,
                isCompleted: existingItem?.isCompleted || false
              };
            })
          };
        })
      };

      // Update local storage
      const updatedServices = services.map(service => 
        service.id === id ? updatedService : service
      );
      setServices(updatedServices);

      // Update service in Supabase
      const { error: serviceError } = await supabase
        .from('ckdt_services')
        .update({
          title: updatedService.title,
          category: updatedService.category,
          description: updatedService.description
        })
        .eq('id', id);
      
      if (serviceError) throw serviceError;

      // Handle checklists - more complex as we need to determine which to update/create/delete
      const existingChecklists = serviceToEdit?.checklists || [];
      
      // Update or create checklists
      for (const checklist of updatedService.checklists) {
        const isExisting = existingChecklists.some(c => c.id === checklist.id);

        if (isExisting) {
          // Update existing checklist
          const { error: checklistError } = await supabase
            .from('ckdt_checklists')
            .update({
              title: checklist.title,
              is_optional: checklist.isOptional || false,
              is_alternative: checklist.isAlternative || false
            })
            .eq('id', checklist.id);
          
          if (checklistError) throw checklistError;
        } else {
          // Create new checklist
          const { error: checklistError } = await supabase
            .from('ckdt_checklists')
            .insert({
              id: checklist.id,
              service_id: updatedService.id,
              title: checklist.title,
              is_optional: checklist.isOptional || false,
              is_alternative: checklist.isAlternative || false
            });
          
          if (checklistError) throw checklistError;
        }

        // Handle items for this checklist
        const existingItems = existingChecklists
          .find(c => c.id === checklist.id)?.items || [];

        // Update or create items
        for (const item of checklist.items) {
          const isExistingItem = existingItems.some(i => i.id === item.id);

          if (isExistingItem) {
            // Update existing item
            const { error: itemError } = await supabase
              .from('ckdt_checklist_items')
              .update({
                text: item.text,
                observation: item.observation,
                tags: item.tags,
                is_optional: item.isOptional || false
              })
              .eq('id', item.id);
            
            if (itemError) throw itemError;
          } else {
            // Create new item
            const { error: itemError } = await supabase
              .from('ckdt_checklist_items')
              .insert({
                id: item.id,
                checklist_id: checklist.id,
                text: item.text,
                observation: item.observation,
                tags: item.tags,
                is_optional: item.isOptional || false
              });
            
            if (itemError) throw itemError;
          }
        }

        // Delete items that no longer exist
        const itemsToDelete = existingItems
          .filter(existingItem => !checklist.items.some(item => item.id === existingItem.id))
          .map(item => item.id);
        
        if (itemsToDelete.length > 0) {
          const { error: deleteItemError } = await supabase
            .from('ckdt_checklist_items')
            .delete()
            .in('id', itemsToDelete);
          
          if (deleteItemError) throw deleteItemError;
        }
      }

      // Delete checklists that no longer exist
      const checklistsToDelete = existingChecklists
        .filter(existingChecklist => !updatedService.checklists.some(checklist => checklist.id === existingChecklist.id))
        .map(checklist => checklist.id);
      
      if (checklistsToDelete.length > 0) {
        // First delete all items in these checklists
        for (const checklistId of checklistsToDelete) {
          const { error: deleteItemsError } = await supabase
            .from('ckdt_checklist_items')
            .delete()
            .eq('checklist_id', checklistId);
          
          if (deleteItemsError) throw deleteItemsError;
        }

        // Then delete the checklists
        const { error: deleteChecklistError } = await supabase
          .from('ckdt_checklists')
          .delete()
          .in('id', checklistsToDelete);
        
        if (deleteChecklistError) throw deleteChecklistError;
      }

      toast.success("Serviço atualizado com sucesso!");
      navigate(`/service/${id}`);
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Erro ao atualizar o serviço no banco de dados");
    }
  };

  const getDefaultValues = (): ServiceFormData | undefined => {
    if (!serviceToEdit) return undefined;

    return {
      title: serviceToEdit.title,
      category: serviceToEdit.category as ServiceCategory,
      description: serviceToEdit.description,
      checklists: serviceToEdit.checklists.map(checklist => ({
        title: checklist.title,
        isOptional: checklist.isOptional,
        isAlternative: checklist.isAlternative,
        items: checklist.items.map(item => ({
          text: item.text,
          observation: item.observation,
          tags: item.tags,
          isOptional: item.isOptional,
        }))
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
