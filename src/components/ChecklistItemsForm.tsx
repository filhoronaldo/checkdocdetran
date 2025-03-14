
import React from "react";
import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { ServiceFormData } from "@/types";

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
          onClick={() => append("")}
          className="h-8 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Adicionar
        </Button>
      </div>

      {fields.map((item, itemIndex) => (
        <div key={item.id} className="flex items-center gap-2">
          <div className="flex-1">
            <FormField
              control={control}
              name={`checklists.${checklistIndex}.items.${itemIndex}`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Item do checklist" {...field} />
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
      ))}
    </div>
  );
};

export default ChecklistItemsForm;
