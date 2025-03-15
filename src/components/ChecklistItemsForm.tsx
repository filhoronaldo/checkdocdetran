
import React from "react";
import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { ServiceFormData } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChecklistItemsFormProps {
  control: Control<ServiceFormData>;
  checklistIndex: number;
}

const ChecklistItemsForm = ({ control, checklistIndex }: ChecklistItemsFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `checklists.${checklistIndex}.items` as any
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-muted-foreground">Itens</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ text: "", observation: "", tag: undefined })}
          className="h-8 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Adicionar
        </Button>
      </div>

      {fields.map((item, itemIndex) => (
        <div key={item.id} className="space-y-2 border border-border p-3 rounded-md mb-3">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <FormField
                control={control}
                name={`checklists.${checklistIndex}.items.${itemIndex}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Título do item" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(itemIndex)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <FormField
            control={control}
            name={`checklists.${checklistIndex}.items.${itemIndex}.observation`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Observação (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name={`checklists.${checklistIndex}.items.${itemIndex}.tag`}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Selecionar tag (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Original">Original</SelectItem>
                    <SelectItem value="Físico">Físico</SelectItem>
                    <SelectItem value="Digital">Digital</SelectItem>
                    <SelectItem value="Original e Cópia">Original e Cópia</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
};

export default ChecklistItemsForm;
