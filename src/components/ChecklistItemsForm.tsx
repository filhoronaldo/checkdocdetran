import React, { useState } from "react";
import { useFieldArray, Control, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Plus, Trash2, Link, X } from "lucide-react";
import { ServiceFormData } from "@/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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

// Define the expected type for field items
interface FieldItem {
  id: string;
  text: string;
  observation?: string;
  tags?: ('Original' | 'Físico' | 'Digital' | 'Digital ou Físico' | 'Original e Cópia')[];
  isOptional?: boolean;
  alternativeOf?: string;
}

const tagOptions = [
  { value: 'Original', label: 'Original' },
  { value: 'Físico', label: 'Físico' },
  { value: 'Digital', label: 'Digital' },
  { value: 'Digital ou Físico', label: 'Digital ou Físico' },
  { value: 'Original e Cópia', label: 'Original e Cópia' },
];

const ChecklistItemsForm = ({ control, checklistIndex }: ChecklistItemsFormProps) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `checklists.${checklistIndex}.items` as any
  });

  // Create a stable alternative group ID
  const addAlternative = (index: number) => {
    // Get the current item
    const currentItem = fields[index] as unknown as FieldItem;
    
    // If the item is already part of an alternative group, use that group ID
    // Otherwise, create a new unique group ID
    const groupId = currentItem.alternativeOf || `group-${Date.now()}`;
    
    // Update the current item to be part of the alternative group if it's not already
    if (!currentItem.alternativeOf) {
      const updatedItem = { 
        ...currentItem, 
        alternativeOf: groupId 
      };
      update(index, updatedItem);
    }
    
    // Add a new item as an alternative to the same group
    append({ 
      text: "", 
      observation: "", 
      tags: [], 
      alternativeOf: groupId,
      isOptional: false
    });
  };

  // Helper function to find all items in an alternative group
  const getAlternativeGroupItems = (groupId: string) => {
    return fields
      .map((field, i) => ({ ...field, index: i }))
      .filter(field => (field as unknown as FieldItem).alternativeOf === groupId);
  };

  // Helper function to check if an item should be displayed in the list
  const shouldDisplayItem = (item: FieldItem, index: number) => {
    // If it's not part of an alternative group, always display it
    if (!item.alternativeOf) return true;
    
    // If it's part of an alternative group, only display it if it's the first item in the group
    const groupItems = getAlternativeGroupItems(item.alternativeOf);
    return groupItems.length === 0 || groupItems[0].index === index;
  };

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

      {fields.map((item, itemIndex) => {
        const typedItem = item as unknown as FieldItem;
        
        // Get all items in this alternative group (if any)
        const alternativeItems = typedItem.alternativeOf 
          ? getAlternativeGroupItems(typedItem.alternativeOf)
          : [];
        
        // Check if this is the first item in an alternative group
        const isFirstInAlternativeGroup = alternativeItems.length > 0 && 
          alternativeItems[0].index === itemIndex;
        
        // Only render the item if it's not part of an alternative group or if it's the first item in the group
        if (typedItem.alternativeOf && !isFirstInAlternativeGroup) {
          return null;
        }
        
        return (
          <div 
            key={item.id} 
            className={`space-y-2 border ${typedItem.alternativeOf ? 'border-blue-200 bg-blue-50/30' : 'border-border'} p-3 rounded-md mb-3`}
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
              
              {/* Add alternative button - only show for items that are not already alternatives */}
              {!typedItem.alternativeOf && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addAlternative(itemIndex)}
                  className="h-8 px-2 text-xs"
                >
                  <Link className="h-3 w-3 mr-1" />
                  Alternativa
                </Button>
              )}
              
              {/* Delete button */}
              {(fields.length > 1 || typedItem.alternativeOf) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (typedItem.alternativeOf) {
                      // If part of a group, find and remove all items in that group
                      const groupId = typedItem.alternativeOf;
                      const groupItems = fields
                        .map((f, i) => ({ 
                          index: i, 
                          alternativeOf: (f as unknown as FieldItem).alternativeOf 
                        }))
                        .filter(f => f.alternativeOf === groupId)
                        .sort((a, b) => b.index - a.index); // Remove from last to first

                      groupItems.forEach(groupItem => {
                        remove(groupItem.index);
                      });
                    } else {
                      remove(itemIndex);
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Show alternative items if this is the first in a group */}
            {isFirstInAlternativeGroup && alternativeItems.length > 1 && (
              <div className="ml-6 pl-3 border-l-2 border-blue-300 space-y-3 my-3">
                <div className="text-xs font-medium text-blue-600">Alternativas (qualquer uma atende):</div>
                
                {alternativeItems.slice(1).map((alt) => (
                  <div key={alt.id} className="space-y-2">
                    <FormField
                      control={control}
                      name={`checklists.${checklistIndex}.items.${alt.index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Input placeholder="Alternativa" {...field} className="text-sm" />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(alt.index)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Observation field for alternative item */}
                    <FormField
                      control={control}
                      name={`checklists.${checklistIndex}.items.${alt.index}.observation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Observação (opcional)" {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Tags for alternative item */}
                    <FormField
                      control={control}
                      name={`checklists.${checklistIndex}.items.${alt.index}.tags`}
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
                                        id={`tag-alt-${alt.index}-${tag.value}`}
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
                                        htmlFor={`tag-alt-${alt.index}-${tag.value}`}
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
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    append({ 
                      text: "", 
                      observation: "", 
                      tags: [], 
                      alternativeOf: typedItem.alternativeOf,
                      isOptional: false 
                    });
                  }}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar alternativa
                </Button>
              </div>
            )}
            
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
        );
      })}
    </div>
  );
};

export default ChecklistItemsForm;
