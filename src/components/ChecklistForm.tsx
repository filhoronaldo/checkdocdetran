
import React from "react";
import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react";
import { ServiceFormData } from "@/types";
import ChecklistItemsForm from "./ChecklistItemsForm";
import { Checkbox } from "@/components/ui/checkbox";
import { updateChecklistPositions } from "@/lib/supabase";
import { toast } from "sonner";

interface ChecklistFormProps {
  control: Control<ServiceFormData>;
  serviceId?: string;
}

const ChecklistForm = ({ control, serviceId }: ChecklistFormProps) => {
  const { fields, append, remove, move, replace } = useFieldArray({
    control,
    name: "checklists"
  });

  const handleMoveUp = async (index: number) => {
    if (index > 0) {
      // Move the item in the form
      move(index, index - 1);
      
      // If we have a serviceId, update the positions in the database
      if (serviceId) {
        try {
          // Get the current field IDs in the new order
          const checklistIds = fields.map((field, i) => {
            if (i === index - 1) return fields[index].id;
            if (i === index) return fields[index - 1].id;
            return field.id;
          });
          
          // Update the positions in the database
          const success = await updateChecklistPositions(serviceId, checklistIds);
          
          if (!success) {
            toast.error("Falha ao atualizar a posição no banco de dados. Tente novamente.");
          }
        } catch (error) {
          console.error("Error updating checklist positions:", error);
          toast.error("Erro ao atualizar a posição. As mudanças podem não ser mantidas ao recarregar.");
        }
      }
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index < fields.length - 1) {
      // Move the item in the form
      move(index, index + 1);
      
      // If we have a serviceId, update the positions in the database
      if (serviceId) {
        try {
          // Get the current field IDs in the new order
          const checklistIds = fields.map((field, i) => {
            if (i === index) return fields[index + 1].id;
            if (i === index + 1) return fields[index].id;
            return field.id;
          });
          
          // Update the positions in the database
          const success = await updateChecklistPositions(serviceId, checklistIds);
          
          if (!success) {
            toast.error("Falha ao atualizar a posição no banco de dados. Tente novamente.");
          }
        } catch (error) {
          console.error("Error updating checklist positions:", error);
          toast.error("Erro ao atualizar a posição. As mudanças podem não ser mantidas ao recarregar.");
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Checklists</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            append({ 
              title: "", 
              items: [{ text: "", observation: "", tags: [], isOptional: false }],
              isOptional: false,
              isAlternative: false
            });
          }}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Adicionar Seção
        </Button>
      </div>

      <div className="space-y-8">
        {fields.map((checklist, checklistIndex) => (
          <div 
            key={checklist.id} 
            className={`p-4 border rounded-lg space-y-4 ${
              checklist.isAlternative 
                ? 'border-blue-200 bg-blue-50/30' 
                : checklist.isOptional 
                  ? 'border-amber-200 bg-amber-50/30' 
                  : 'border-border'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <FormField
                control={control}
                name={`checklists.${checklistIndex}.title`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Título da Seção" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center gap-2">
                <FormField
                  control={control}
                  name={`checklists.${checklistIndex}.isOptional`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="text-sm font-medium">Seção Opcional</div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name={`checklists.${checklistIndex}.isAlternative`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="text-sm font-medium">Escolha uma das opções</div>
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveUp(checklistIndex)}
                    disabled={checklistIndex === 0}
                    className="h-8 w-8 p-1"
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveDown(checklistIndex)}
                    disabled={checklistIndex === fields.length - 1}
                    className="h-8 w-8 p-1"
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(checklistIndex)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <ChecklistItemsForm 
              control={control} 
              checklistIndex={checklistIndex} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistForm;
