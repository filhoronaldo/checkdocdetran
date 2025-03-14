
import { useForm, useFieldArray, FieldArrayWithId } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { serviceCategories } from "@/data/services";
import { ServiceFormData, ServiceCategory } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

const formSchema = z.object({
  title: z.string().min(3, "O título precisa ter pelo menos 3 caracteres"),
  category: z.enum(["Veículo", "Habilitação", "Infrações", "Outros"] as const),
  description: z.string().min(10, "A descrição precisa ter pelo menos 10 caracteres"),
  checklists: z.array(
    z.object({
      title: z.string().min(1, "O título é obrigatório"),
      items: z.array(z.string().min(1, "O item não pode estar vazio"))
    })
  ).min(1, "Adicione pelo menos uma seção de checklist")
});

interface ServiceFormProps {
  onSubmit: (data: ServiceFormData) => void;
  defaultValues?: ServiceFormData;
  submitLabel?: string;
}

export default function ServiceForm({ 
  onSubmit, 
  defaultValues = {
    title: "",
    category: "Veículo",
    description: "",
    checklists: [{ title: "Documentos Necessários", items: [""] }]
  },
  submitLabel = "Cadastrar Serviço"
}: ServiceFormProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields: checklistFields, append: appendChecklist, remove: removeChecklist } = 
    useFieldArray({
      control: form.control,
      name: "checklists"
    });

  const handleSubmit = (data: ServiceFormData) => {
    try {
      onSubmit(data);
      form.reset({
        title: "",
        category: "Veículo",
        description: "",
        checklists: [{ title: "Documentos Necessários", items: [""] }]
      });
      toast.success("Serviço cadastrado com sucesso!");
    } catch (error) {
      toast.error("Erro ao cadastrar serviço");
    }
  };

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{submitLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Serviço</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Transferência de Propriedade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange as (value: string) => void}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o serviço e seus requisitos" 
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Checklists</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    appendChecklist({ title: "", items: [""] });
                  }}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Seção
                </Button>
              </div>

              <div className="space-y-8">
                {checklistFields.map((checklist, checklistIndex) => {
                  // Create the nested field array for each checklist item
                  // Note: This must be done inside the render loop so that React hooks
                  // are always called in the same order
                  const itemsArray = useFieldArray({
                    control: form.control,
                    name: `checklists.${checklistIndex}.items` as any
                  });

                  return (
                    <div 
                      key={checklist.id} 
                      className="p-4 border border-border rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <FormField
                          control={form.control}
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
                        
                        {checklistFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeChecklist(checklistIndex)}
                            className="ml-2 text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-muted-foreground">Itens</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => itemsArray.append("")}
                            className="h-8 px-2 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>

                        {itemsArray.fields.map((item, itemIndex) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <div className="flex-1">
                              <FormField
                                control={form.control}
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
                            {itemsArray.fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => itemsArray.remove(itemIndex)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              {submitLabel}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
