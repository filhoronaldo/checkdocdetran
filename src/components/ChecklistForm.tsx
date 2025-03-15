
import React from "react";
import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { ServiceFormData } from "@/types";
import ChecklistItemsForm from "./ChecklistItemsForm";

interface ChecklistFormProps {
  control: Control<ServiceFormData>;
}

const ChecklistForm = ({ control }: ChecklistFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "checklists"
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Checklists</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            append({ title: "", items: [{ text: "", observation: "", tag: undefined }] });
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
            className="p-4 border border-border rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between">
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
              
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(checklistIndex)}
                  className="ml-2 text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
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
