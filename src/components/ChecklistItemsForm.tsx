
import React from "react";
import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Plus, Trash2, X } from "lucide-react";
import { ServiceFormData } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChecklistItemsFormProps {
  control: Control<ServiceFormData>;
  checklistIndex: number;
}

const tagOptions = [
  { value: 'Original', label: 'Original' },
  { value: 'Físico', label: 'Físico' },
  { value: 'Digital', label: 'Digital' },
  { value: 'Digital ou Físico', label: 'Digital ou Físico' },
  { value: 'Original e Cópia', label: 'Original e Cópia' },
];

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
          onClick={() => append({ text: "", observation: "", tags: [], isOptional: false })}
          className="h-8 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Adicionar
        </Button>
      </div>

      {fields.map((item, itemIndex) => (
        <div 
          key={item.id} 
          className="space-y-2 border border-border p-3 rounded-md mb-3"
        >
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
            
            {/* Optional checkbox */}
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
                  <div className="text-xs font-medium">Opcional</div>
                </FormItem>
              )}
            />
            
            {/* Delete button */}
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
            name={`checklists.${checklistIndex}.items.${itemIndex}.tags`}
            render={({ field }) => (
              <FormItem className="space-y-1">
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                      >
                        Adicionar tags
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2">
                      <div className="space-y-2">
                        {tagOptions.map(tag => (
                          <div key={tag.value} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`tag-${itemIndex}-${tag.value}`}
                              checked={field.value?.includes(tag.value as any)}
                              onCheckedChange={(checked) => {
                                const currentTags = field.value || [];
                                const newTags = checked
                                  ? [...currentTags, tag.value as any]
                                  : currentTags.filter(t => t !== tag.value);
                                field.onChange(newTags);
                              }}
                            />
                            <label 
                              htmlFor={`tag-${itemIndex}-${tag.value}`}
                              className="text-sm cursor-pointer"
                            >
                              {tag.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {field.value && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {field.value.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs py-0 px-2">
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(field.value.filter(t => t !== tag));
                          }}
                          className="ml-1 text-xs text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
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
