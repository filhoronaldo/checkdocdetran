
import React from "react";
import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Checkbox } from "./ui/checkbox";
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react";
import { MultiSelect, OptionType } from "./ui/multi-select";
import { ServiceFormData } from "@/types";

interface ChecklistItemsFormProps {
  control: Control<ServiceFormData>;
  checklistIndex: number;
}

const tagOptions: OptionType[] = [
  { value: "Original", label: "Original" },
  { value: "Físico", label: "Físico" },
  { value: "Digital", label: "Digital" },
  { value: "Digital ou Físico", label: "Digital ou Físico" },
  { value: "Original e Cópia", label: "Original e Cópia" },
];

const ChecklistItemsForm = ({ control, checklistIndex }: ChecklistItemsFormProps) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `checklists.${checklistIndex}.items`,
  });

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Itens da checklist</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ text: "", observation: "", tags: [], isOptional: false })}
          className="flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Adicionar Item
        </Button>
      </div>

      {fields.map((item, itemIndex) => (
        <div key={item.id} className="grid grid-cols-1 gap-4 p-3 border border-border/40 rounded-md">
          <div className="flex items-start gap-2">
            <FormField
              control={control}
              name={`checklists.${checklistIndex}.items.${itemIndex}.text`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Texto do item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center gap-1 mt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleMoveUp(itemIndex)}
                disabled={itemIndex === 0}
                className="h-7 w-7 p-1"
              >
                <MoveUp className="h-3 w-3" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleMoveDown(itemIndex)}
                disabled={itemIndex === fields.length - 1}
                className="h-7 w-7 p-1"
              >
                <MoveDown className="h-3 w-3" />
              </Button>
              
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(itemIndex)}
                  className="h-7 w-7 p-1 text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <FormField
              control={control}
              name={`checklists.${checklistIndex}.items.${itemIndex}.observation`}
              render={({ field }) => (
                <FormItem className="md:col-span-7">
                  <FormLabel className="text-xs">Observação</FormLabel>
                  <FormControl>
                    <Input placeholder="Observação (opcional)" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name={`checklists.${checklistIndex}.items.${itemIndex}.tags`}
              render={({ field }) => (
                <FormItem className="md:col-span-5">
                  <FormLabel className="text-xs">Tags</FormLabel>
                  <FormControl>
                    <MultiSelect
                      placeholder="Selecione tags"
                      selected={field.value || []}
                      options={tagOptions}
                      onChange={(value) => {
                        // Ensure we're setting a valid array, never undefined
                        field.onChange(value || []);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={control}
            name={`checklists.${checklistIndex}.items.${itemIndex}.isOptional`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="text-sm">Item Opcional</div>
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
};

export default ChecklistItemsForm;
