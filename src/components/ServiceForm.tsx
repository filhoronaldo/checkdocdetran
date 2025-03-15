
import { useForm } from "react-hook-form";
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
import { ServiceFormData } from "@/types";
import ChecklistForm from "./ChecklistForm";

const formSchema = z.object({
  title: z.string().min(3, "O título precisa ter pelo menos 3 caracteres"),
  category: z.enum(["Veículo", "Habilitação", "Infrações", "Outros"] as const),
  description: z.string().min(10, "A descrição precisa ter pelo menos 10 caracteres"),
  checklists: z.array(
    z.object({
      title: z.string().min(1, "O título é obrigatório"),
      items: z.array(
        z.object({
          text: z.string().min(1, "O item não pode estar vazio"),
          observation: z.string().optional(),
          tag: z.enum(["Original", "Físico", "Digital", "Original e Cópia"]).optional()
        })
      )
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
    checklists: [{ 
      title: "Documentos Necessários", 
      items: [{ text: "", observation: "", tag: undefined }] 
    }]
  },
  submitLabel = "Cadastrar Serviço"
}: ServiceFormProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (data: ServiceFormData) => {
    try {
      onSubmit(data);
      form.reset({
        title: "",
        category: "Veículo",
        description: "",
        checklists: [{ 
          title: "Documentos Necessários", 
          items: [{ text: "", observation: "", tag: undefined }] 
        }]
      });
      toast.success("Serviço cadastrado com sucesso!");
    } catch (error) {
      toast.error("Erro ao cadastrar serviço");
    }
  };

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

            <ChecklistForm control={form.control} />

            <Button type="submit" className="w-full md:w-auto">
              {submitLabel}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
