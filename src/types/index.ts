
export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  observation?: string;
  tags?: ('Original' | 'Físico' | 'Digital' | 'Digital ou Físico' | 'Original e Cópia')[];
  isOptional?: boolean;
  position?: number;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  items: ChecklistItem[];
  isOptional?: boolean;
  isAlternative?: boolean;
  position?: number;
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
    id?: string;
    title: string;
    isOptional?: boolean;
    isAlternative?: boolean;
    position?: number;
    items: {
      id?: string;
      text: string;
      observation?: string;
      tags?: ('Original' | 'Físico' | 'Digital' | 'Digital ou Físico' | 'Original e Cópia')[];
      isOptional?: boolean;
      position?: number;
    }[];
  }[];
}
