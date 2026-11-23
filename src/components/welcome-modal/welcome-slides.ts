import type { WelcomeSlide } from '@/types/welcome';

/**
 * Catálogo de Slides do Modal de Boas-Vindas do PreviOffice
 *
 * Estrutura modular: novos passos (ex: Valores e Retornos na Aba Financeira)
 * podem ser adicionados inserindo novos objetos nesta lista.
 */
export const WELCOME_SLIDES: WelcomeSlide[] = [
  {
    id: 'slide-fast-intake-vs-full',
    stepNumber: 1,
    category: 'Recepção & Triagem',
    title: 'Entrada Rápida vs. Ficha Completa',
    subtitle: 'Triagem ágil de balcão em 30 segundos ou prontuário cadastral completo',
    description:
      'O PreviOffice oferece dois fluxos de cadastro para atender à dinâmica real do escritório: o balcão rápido de atendimento ou o aprofundamento documental detalhado.',
    benefits: [
      'Entrada Rápida: Registre o segurado em 30 segundos com apenas Nome, Telefone, Espécie de Benefício e Localizador Físico da Pasta.',
      'Ficha Completa: Detalhe todo o perfil previdenciário (vínculos do CNIS, dependentes, estado civil, remunerações e histórico contributivo).',
      'Zero burocracia: O cliente entra imediatamente na fila do dia para atendimento do advogado.',
    ],
    mockup: {
      type: 'reception_intake',
      badge: 'Triagem em 30 segundos',
      previewData: {
        title: 'Nova Entrada Rápida de Balcão',
        fields: [
          { label: 'Nome Completo', value: 'Maria Francisca da Silva' },
          { label: 'Telefone / WhatsApp', value: '(92) 99123-4567' },
          { label: 'Espécie Requerida', value: 'B41 - Aposentadoria por Idade Rural' },
          { label: 'Pasta Física no Arquivo', value: 'Armário 02, Gaveta B, Pasta 14' },
        ],
        statusTag: 'Fila de Hoje: 1º Atendimento',
      },
    },
  },
  {
    id: 'slide-digital-record',
    stepNumber: 2,
    category: 'Prontuário do Segurado',
    title: 'Prontuário Digital com Localizador Físico',
    subtitle: 'Visão 360° do cliente, contatos protegidos e localização de arquivo físico',
    description:
      'Cada pessoa atendida possui um prontuário digital unificado com dados de contato, benefício pleiteado, contador de visitas e localização física da pasta em papel.',
    benefits: [
      'Localizador de Pasta Física: Informa exatamente onde a pasta de papel está arquivada (Armário, Gaveta e Pasta) com Custo Zero de Nuvem.',
      'Contador de Visitas: Saiba quantas vezes o segurado compareceu ao escritório e quem foi o último responsável.',
      'Privacidade LGPD: CPFs e dados sensíveis com máscaras de proteção e auditoria de visualização.',
    ],
    mockup: {
      type: 'client_record',
      badge: 'Exemplo Demonstrativo',
      previewData: {
        name: 'Dona Maria Francisca da Silva',
        cpf: '123.***.***-00',
        benefit: 'Aposentadoria por Idade Rural',
        visits: '2 visitas registradas',
        attendant: 'Dr. Advogado Titular',
        archiveLocation: 'Armário 02 / Gaveta B / Pasta 14',
        progress: 85,
        status: 'Em Análise de Documentos',
      },
    },
  },
  {
    id: 'slide-return-attendance',
    stepNumber: 3,
    category: 'Atendimentos & Retorno',
    title: 'Registro de Retornos & Linha do Tempo',
    subtitle: 'Histórico inalterável para segurança jurídica da banca previdenciária',
    description:
      'Cada retorno do cliente ao escritório gera um registro com data, hora, atendente e anotações jurídicas, construindo uma linha do tempo forense protegida.',
    benefits: [
      'Documentos Pendentes: Checklist rápido para certidões, autodeclarações rurais, PPPs e extratos bancários.',
      'Trilha Inalterável: Registro cronológico que protege o advogado contra alegações de perda de prazos ou falta de orientações.',
      'Sincronização Imediata: O cliente sai do balcão e seu status na recepção é atualizado em tempo real.',
    ],
    mockup: {
      type: 'return_attendance',
      badge: 'Linha do Tempo Forense',
      previewData: {
        lastVisit: 'Hoje às 14:30',
        type: 'Retorno com Documentos',
        notes: 'Cliente entregou Certidão de Casamento com qualificação de lavrador e Notas Fiscais de produtor rural (2012-2022).',
        pendingList: [
          { item: 'Autodeclaração Rural assinada', done: true },
          { item: 'Procuração Ad Judicia impressa', done: true },
          { item: 'Extrato CNIS atualizado', done: false },
        ],
      },
    },
  },
  {
    id: 'slide-contracts-and-fees',
    stepNumber: 4,
    category: 'Contratos & Honorários',
    title: 'Geração de Contratos & 3 Modelos de Honorários',
    subtitle: 'Minutas jurídicas com cálculo automático e edição pelo advogado titular',
    description:
      'Gere contratos de prestação de serviços advocatícios e procurações completas com cláusulas previdenciárias e os 3 regimes de remuneração da OAB.',
    benefits: [
      'Quota Litis (Êxito): Percentual sobre as parcelas vencidas e atrasadas (RRA), com cálculo simulado na hora.',
      'Parcelamento / Carnê: Honorários iniciais divididos em parcelas mensais com cronograma de vencimentos.',
      'Híbrido: Entrada pró-labore mais percentual de êxito no cumprimento da tutela previdenciária.',
      'Editor de Minutas: O titular pode alterar as cláusulas e o modelo padrão a qualquer momento no menu Contratos.',
    ],
    mockup: {
      type: 'contracts_fee',
      badge: 'Cálculo Jurídico Automático',
      previewData: {
        models: [
          { name: '1. Quota Litis (Êxito Puro)', detail: '30% sobre atrasados recebidos do INSS' },
          { name: '2. Parcelado (Carnê Mensal)', detail: 'Ex: 4x de R$ 350,00 fixas com boleto/Pix' },
          { name: '3. Híbrido (Entrada + Êxito)', detail: 'R$ 500 entrada + 20% no êxito da concessão' },
        ],
        sampleCalculation: 'Simulação RRA: R$ 36.000,00 × 30% = R$ 10.800,00 honorários previdenciários',
      },
    },
  },
  {
    id: 'slide-pdf-dossier',
    stepNumber: 5,
    category: 'Ficha Cadastral em PDF',
    title: 'Ficha Cadastral em PDF para Impressão',
    subtitle: 'Assinatura física do cliente, arquivo em pasta física e protocolo administrativo',
    description:
      'Exporte um documento consolidado em PDF de alta resolução contendo toda a qualificação, declarações e termo de consentimento LGPD.',
    benefits: [
      'Assinatura no Balcão: O cliente assina presencialmente a ficha impressa, conferindo veracidade às informações prestadas.',
      'Arquivo Físico: Folha padrão de rosto para anexar à capa da pasta física guardada no armário/gaveta do escritório.',
      'Protocolo Administrativo: Pronto para digitalização e juntada ao Meu INSS ou ação judicial previdenciária.',
      'Cláusula de Proteção LGPD: Já inclui autorização para consulta ao INSS e tratamento dos dados.',
    ],
    mockup: {
      type: 'pdf_dossier',
      badge: 'Impressão Imediata (1 Clique)',
      previewData: {
        documentTitle: 'FICHA CADASTRAL DO SEGURADO DA PREVIDÊNCIA SOCIAL',
        sections: [
          '1. Qualificação Civil e Dados Pessoais',
          '2. Benefício Previdenciário Requerido',
          '3. Histórico de Contribuições e Vínculos',
          '4. Termo de Autorização e Assinatura do Titular',
        ],
        footerNote: 'Selo de Autenticidade PreviOffice • Arquivo Armário 02, Gaveta B, Pasta 14',
      },
    },
  },
  {
    id: 'slide-vade-mecum',
    stepNumber: 6,
    category: 'Inteligência Jurídica',
    title: 'Vade Mecum Previdenciário Integrado',
    subtitle: 'Legislação, IN 128/2022 e jurisprudência sem sair da tela de atendimento',
    description:
      'Consulte a legislação previdenciária completa e atualizada diretamente no sistema, sem precisar abrir abas externas no navegador durante a consulta com o cliente.',
    benefits: [
      'IN 128/2022 Completa: Pesquise rapidamente artigos, carências, regras de transição e enquadramentos rurais e urbanos.',
      'Lei 8.213/91 e Lei 8.212/91: Fundamentações legais prontas para petições e requerimentos.',
      'Súmulas da TNU e STJ: Jurisprudência pacificada para embasamento de recursos administrativos e judiciais.',
    ],
    mockup: {
      type: 'vade_mecum',
      badge: 'Pesquisa Instantânea em Tempo Real',
      previewData: {
        norm: 'Instrução Normativa PRES/INSS nº 128, de 28 de março de 2022',
        article: 'Art. 116. A comprovação do exercício de atividade rural do segurado especial...',
        crossRef: 'Lei 8.213/1991, Art. 48, § 2º • Súmula 149 do STJ',
      },
    },
  },
  {
    id: 'slide-office-audit',
    stepNumber: 7,
    category: 'Segurança & Equipe',
    title: 'Configurações da Banca & Auditoria LGPD',
    subtitle: 'Personalização do escritório, permissões da equipe e trilha forense',
    description:
      'Configure os dados do escritório, adicione membros com permissões personalizadas e acompanhe cada ação da equipe em uma trilha de auditoria inviolável.',
    benefits: [
      'Identidade da Banca: Logotipo, CNPJ, OAB do titular e dados de contato impressos automaticamente nos contratos.',
      'Gestão de Equipe (RBAC): Cadastre advogados, assistentes e estagiários com permissões granulares por módulo.',
      'Auditoria Forense LGPD: Registra quem visualizou senhas do Meu INSS, gerou minutas ou alterou cadastros, com carimbo de data/hora.',
    ],
    mockup: {
      type: 'office_audit',
      badge: 'Trilha Auditável Blindada',
      previewData: {
        firmName: 'Advocacia Previdenciária Titular',
        oab: 'OAB/AM 0000',
        auditLogs: [
          { action: 'Visualização de Senha Meu INSS', user: 'Dr. Advogado Titular', time: '14:28:10' },
          { action: 'Formalização de Contrato Quota Litis', user: 'Assistente Jurídico', time: '14:15:02' },
          { action: 'Cadastro de Entrada Rápida', user: 'Recepção Balcão', time: '14:02:44' },
        ],
      },
    },
  },
];
