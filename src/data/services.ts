
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
            tags: ["Original"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de Vistoria Detran",
            observation: "Pode ser eletrônico em alguns estados",
            tags: ["Digital"],
            isCompleted: false
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Identificação",
        isAlternative: true,
        items: [
          {
            id: uuidv4(),
            text: "RG",
            tags: ["Original"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "CNH",
            tags: ["Original"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Passaporte",
            tags: ["Original"],
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
            tags: ["Original", "Original e Cópia"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "CPF",
            observation: "Caso não conste no documento de identificação",
            tags: ["Original"],
            isCompleted: false
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Pessoa Jurídica",
        isOptional: true,
        items: [
          {
            id: uuidv4(),
            text: "Cartão CNPJ",
            observation: "Pode ser impresso pelo atendente",
            isOptional: true,
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Contrato Social ou Estatuto e Ata de Nomeação da Diretoria",
            tags: ["Original", "Original e Cópia"],
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
            tags: ["Original"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "CPF",
            tags: ["Original"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de Residência Recente (últimos 3 meses)",
            tags: ["Original", "Digital ou Físico"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Exame Médico e Psicológico",
            tags: ["Original"],
            isCompleted: false
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Comprovante de Pagamento",
        isAlternative: true,
        items: [
          {
            id: uuidv4(),
            text: "Boleto bancário quitado",
            tags: ["Original", "Digital"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de pagamento via PIX",
            tags: ["Digital"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de transferência bancária",
            tags: ["Digital"],
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
            tags: ["Original"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Documento de Identidade Original",
            tags: ["Original"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de Residência Recente (últimos 3 meses)",
            tags: ["Digital", "Físico"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Exame Médico (para todas as categorias)",
            tags: ["Original"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Exame Psicológico (para motoristas profissionais)",
            isOptional: true,
            tags: ["Original"],
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
            tags: ["Original", "Digital"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de pagamento de IPVA",
            tags: ["Digital"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de pagamento de seguro DPVAT (quando aplicável)",
            isOptional: true,
            tags: ["Digital"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de pagamento da taxa de licenciamento",
            tags: ["Digital"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Comprovante de pagamento de multas (se houver)",
            isOptional: true,
            tags: ["Digital"],
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
            tags: ["Original", "Digital"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Documento de Identificação do Proprietário",
            tags: ["Original", "Original e Cópia"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "CRLV do Veículo",
            tags: ["Original", "Digital"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Formulário de Recurso preenchido",
            tags: ["Físico"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Provas que fundamentem o recurso (se houver)",
            isOptional: true,
            tags: ["Físico", "Digital"],
            isCompleted: false
          }
        ]
      },
      {
        id: uuidv4(),
        title: "Anexos Opcionais",
        isOptional: true,
        items: [
          {
            id: uuidv4(),
            text: "Fotografias do local da infração",
            tags: ["Digital"],
            isCompleted: false
          },
          {
            id: uuidv4(),
            text: "Declaração de testemunhas",
            tags: ["Físico"],
            isCompleted: false
          }
        ]
      }
    ]
  }
];
