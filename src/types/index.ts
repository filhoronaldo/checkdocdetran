
export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  observation?: string;
  tags?: ('Original' | 'Físico' | 'Digital' | 'Digital ou Físico' | 'Original e Cópia')[];
  isOptional?: boolean;
  alternativeOf?: string;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  items: ChecklistItem[];
  isOptional?: boolean;
}

export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  checklists: ChecklistGroup[];
}

export type ServiceCategory = 'Veículo' | 'Habilitação' | 'Infrações' | 'Outros';

export interface ServiceFormData {
  title: string;
  category: ServiceCategory;
  description: string;
  checklists: {
    title: string;
    isOptional?: boolean;
    items: {
      text: string;
      observation?: string;
      tags?: ('Original' | 'Físico' | 'Digital' | 'Digital ou Físico' | 'Original e Cópia')[];
      isOptional?: boolean;
      alternativeOf?: string;
    }[];
  }[];
}
