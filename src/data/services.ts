import { Service, ServiceCategory } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const serviceCategories: ServiceCategory[] = [
  'Veículo',
  'Habilitação',
  'Infrações',
  'Outros'
];

export const initialServices: Service[] = [
  {
    id: uuidv4(),
    title: "Transferência de Propriedade",
    category: "Veículo",
    description: "Documentação necessária para transferir a propriedade de um veículo para outro proprietário.",
    checklists: [
      {
        id: uuidv4(),
        title: "Documentos Básicos",
        items: [
          {
            id: uuidv4(),
            text: "ATPV (Autorização para Transferência de Propriedade Veicular)",
            observation: "Pode ser eletrônico ou em papel (CRV antigo)",
            tag: "Original",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de Vistoria Detran",
            observation: "Pode ser eletrônico em alguns estados",
            tag: "Digital",
            isCompleted: false
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Pessoa Física",
        items: [
          {
            id: uuidv4(),
            text: "Documento de Identificação Oficial com Foto",
            observation: "Identidade, CNH, Carteira de Trabalho",
            tag: "Original e Cópia",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "CPF",
            observation: "Caso não conste no documento de identificação",
            tag: "Original",
            isCompleted: false
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Pessoa Jurídica",
        items: [
          {
            id: uuidv4(),
            text: "Cartão CNPJ",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Contrato Social ou Estatuto e Ata de Nomeação da Diretoria",
            isCompleted: false
          }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Primeira Habilitação",
    category: "Habilitação",
    description: "Documentação necessária para obter a primeira habilitação.",
    checklists: [
      {
        id: uuidv4(),
        title: "Documentos Necessários",
        items: [
          {
            id: uuidv4(),
            text: "Documento de Identidade Original",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "CPF",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de Residência Recente (últimos 3 meses)",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Exame Médico e Psicológico",
            isCompleted: false
          }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Renovação da CNH",
    category: "Habilitação",
    description: "Documentação necessária para renovar a CNH.",
    checklists: [
      {
        id: uuidv4(),
        title: "Documentos Necessários",
        items: [
          {
            id: uuidv4(),
            text: "CNH atual (mesmo vencida)",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Documento de Identidade Original",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de Residência Recente (últimos 3 meses)",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Exame Médico (para todas as categorias)",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Exame Psicológico (para motoristas profissionais)",
            isCompleted: false
          }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Licenciamento Anual",
    category: "Veículo",
    description: "Documentação necessária para realizar o licenciamento anual do veículo.",
    checklists: [
      {
        id: uuidv4(),
        title: "Documentos Necessários",
        items: [
          {
            id: uuidv4(),
            text: "CRLV do ano anterior",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de pagamento de IPVA",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de pagamento de seguro DPVAT (quando aplicável)",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de pagamento da taxa de licenciamento",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de pagamento de multas (se houver)",
            isCompleted: false
          }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Recurso de Multa",
    category: "Infrações",
    description: "Documentação necessária para entrar com recurso contra uma multa.",
    checklists: [
      {
        id: uuidv4(),
        title: "Documentos Necessários",
        items: [
          {
            id: uuidv4(),
            text: "Notificação da Infração",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Documento de Identificação do Proprietário",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "CRLV do Veículo",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Formulário de Recurso preenchido",
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Provas que fundamentem o recurso (se houver)",
            isCompleted: false
          }
        ]
      }
    ]
  }
];
