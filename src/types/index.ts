
export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  observation?: string;
  tag?: 'Original' | 'Físico' | 'Digital' | 'Original e Cópia';
}

export interface ChecklistGroup {
  id: string;
  title: string;
  items: ChecklistItem[];
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
    items: {
      text: string;
      observation?: string;
      tag?: 'Original' | 'Físico' | 'Digital' | 'Original e Cópia';
    }[];
  }[];
}
