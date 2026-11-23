import type { TourStep } from '@/types/tour';

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-intake-comparison',
    stepNumber: 1,
    title: 'Entrada Rápida vs. Ficha Completa',
    subtitle: 'Triagem de Balcão ágil em 30 segundos vs. Prontuário Previdenciário Aprofundado',
    description:
      'O PreviOffice separa o acolhimento inicial em duas modalidades estratégicas para otimizar o tempo da recepção e a precisão do advogado.',
    highlights: [
      'Entrada Rápida de Balcão: Preenchimento veloz em apenas 30 segundos para acolher o segurado, registrando Nome, Celular, Espécie de Benefício (ex: Rural, BPC, Invalidez) e a Localização Física da Pasta no armário.',
      'Ficha Cadastral Completa: Prontuário detalhado para qualificação civil, dados do CNIS, histórico de vínculos de trabalho, dependentes, filiação e situação previdenciária.',
      'Regra Prática: Use a Entrada Rápida na fila de atendimento da recepção e complete a Ficha Completa durante a consulta jurídica com o advogado.',
    ],
    targetSelector: '#tour-fast-intake-btn',
    placement: 'bottom',
    actionHint: 'Observe os botões "Entrada Rápida" e "Ficha Completa" no topo da recepção.',
  },
  {
    id: 'step-client-record',
    stepNumber: 2,
    title: 'Prontuário Digital do Segurado (Exemplo Demo)',
    subtitle: 'Como a sua equipe visualiza e gerencia cada pessoa atendida',
    description:
      'Veja na tabela abaixo um segurado fictício demonstrativo (Dona Maria Francisca da Silva). Cada linha resume a situação jurídica, contato rápido e localização física do processo.',
    highlights: [
      'Identificação Imediata: Nome, CPF com máscara de proteção, status do processo e espécie do benefício.',
      'Contador de Visitas e Atendente: Veja quantas vezes o segurado esteve no escritório e quem realizou o último atendimento.',
      'Localizador de Pasta Física: Informa em qual armário, gaveta e pasta os documentos físicos do segurado estão arquivados.',
    ],
    targetSelector: '#tour-demo-client-row',
    placement: 'bottom',
    requiresDemoData: true,
    actionHint: 'Este cliente é um exemplo fictício em memória para este tour e será removido ao final.',
  },
  {
    id: 'step-return-attendance',
    stepNumber: 3,
    title: 'Atendimento de Retorno & Linha do Tempo',
    subtitle: 'Como registrar novas visitas, entrega de documentos e evolução do caso',
    description:
      'Sempre que o cliente retornar ao escritório (para trazer documentos faltantes, tirar dúvidas ou assinar papéis), o sistema registra o atendimento sem sobrepor o histórico inicial.',
    highlights: [
      'Histórico Inalterável: Cada comparecimento é carimbado com data, hora e o nome do operador que atendeu.',
      'Checklist de Documentos Pendentes: Controle visual se a certidão de casamento, bloco de produtor ou laudo médico já foi entregue.',
      'Anotações Forenses: Registre as orientações passadas ao cliente para que qualquer advogado da banca saiba o status exato do caso.',
    ],
    targetSelector: '#tour-demo-client-row',
    placement: 'top',
    requiresDemoData: true,
    actionHint: 'Ao clicar no cliente, o botão "Novo Retorno" permite registrar o comparecimento em segundos.',
  },
  {
    id: 'step-contracts-and-templates',
    stepNumber: 4,
    title: 'Contratos, Procurações & Edição de Minutas',
    subtitle: 'Geração automatizada de honorários e personalização das cláusulas da banca',
    description:
      'Gere contratos de honorários e procurações previdenciárias formatadas em segundos com qualificação completa e cálculo financeiro exato.',
    highlights: [
      '3 Modelos de Honorários: Quota Litis (êxito puro no atrasado do INSS), Parcelado (carnê em parcelas fixas) ou Híbrido (entrada pro labore + percentual de êxito).',
      'Cálculo Automático: O sistema calcula a estimativa de atrasados e o valor dos honorários automaticamente na minuta.',
      'Como Alterar Minutas: No menu lateral "Contratos", acesse a aba "Catálogo de Minutas" para editar as cláusulas padrão da sua banca ou criar novos modelos.',
    ],
    targetSelector: '#tour-contracts-nav-link',
    placement: 'right',
    actionHint: 'As minutas herdam os dados do cliente e da OAB do advogado titular automaticamente.',
  },
  {
    id: 'step-pdf-export',
    stepNumber: 5,
    title: 'Para que serve a Ficha em PDF?',
    subtitle: 'Instrumento indispensável para segurança jurídica e protocolo administrativo',
    description:
      'A emissão da Ficha Cadastral em PDF consolida todos os dados do segurado em uma folha padronizada de alta definição gráfica pronta para impressão.',
    highlights: [
      'Assinatura Física e Validação: O cliente assina a ficha no balcão, confirmando a veracidade de todas as informações prestadas.',
      'Armazenamento em Pasta Física: Destinada ao arquivo de pastas físicas no armário/gaveta do escritório.',
      'Protocolo no Meu INSS / Justiça Federal: Serve como comprovação documental imediata para anexar ao processo administrativo ou judicial.',
      'Termo de Consentimento LGPD Integrado: Já contém cláusula de autorização para tratamento de dados previdenciários.',
    ],
    targetSelector: '#tour-demo-client-row',
    placement: 'top',
    requiresDemoData: true,
    actionHint: 'Disponível no prontuário do cliente pelo botão "Gerar Ficha Cadastral (PDF)".',
  },
  {
    id: 'step-vade-mecum',
    stepNumber: 6,
    title: 'Vade Mecum Previdenciário Integrado',
    subtitle: 'Legislação, IN 128/2022 e jurisprudência sem sair da tela de atendimento',
    description:
      'Durante a consulta com o segurado, o advogado pode consultar instantaneamente as leis e regras previdenciárias sem precisar abrir abas externas no navegador.',
    highlights: [
      'IN 128/2022 (Instrução Normativa PRES/INSS nº 128/2022) completa e pesquisável por artigos e palavras-chave.',
      'Lei 8.213/1991 (Planos de Benefícios da Previdência Social) e Lei 8.212/1991.',
      'Súmulas da TNU e STJ para fundamentação de requerimentos administrativos e petições iniciais.',
    ],
    targetSelector: '#tour-vade-mecum-btn',
    placement: 'bottom',
    actionHint: 'Acesse pelo ícone da balança dourada no canto superior direito do cabeçalho.',
  },
  {
    id: 'step-settings-and-audit',
    stepNumber: 7,
    title: 'Configurações da Banca & Auditoria LGPD',
    subtitle: 'Identidade visual, equipe, alvarás e trilha forense auditável',
    description:
      'Personalize a identidade da sua banca e monitore a segurança de acesso a senhas e dados sensíveis dos clientes.',
    highlights: [
      'Dados da Banca: Configure Razão Social, CNPJ, OAB do titular e logotipo impresso nos contratos e minutas.',
      'Gestão de Equipe: Cadastre advogados associados, assistentes e estagiários com senhas provisórias e permissões personalizadas.',
      'Auditoria Forense (LGPD): Trilha de auditoria blindada que registra quem consultou senhas do Meu INSS, emissões e sessões ativas da equipe com selo de integridade.',
    ],
    targetSelector: '#tour-settings-nav-link',
    placement: 'right',
    actionHint: 'Ao clicar em "Concluir", o tour é finalizado e todos os dados fictícios são limpos imediatamente.',
  },
];
