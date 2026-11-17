import type { Client } from '@/types/client';
import type { Attendance } from '@/types/attendance';
import type { CaseUpdate } from '@/types/case-update';

export interface ClientProfileBundle {
  client: Client;
  attendances: Attendance[];
  caseUpdates: CaseUpdate[];
}

export const MOCK_CLIENTS_MAP: Record<string, ClientProfileBundle> = {
  // Client 1: Maria Francisca da Silva (Rural Retirement - 3 visits)
  'cli-001': {
    client: {
      id: 'cli-001',
      tenantId: 'tenant-default',
      fullName: 'Maria Francisca da Silva',
      normalizedName: 'maria francisca da silva',
      cpf: '123.456.789-09',
      normalizedCpf: '12345678909',
      rg: '2.456.789 SSP/PB',
      birthDate: '1968-04-12',
      maritalStatus: 'MARRIED',
      profession: 'Agricultora Familiar',
      nationality: 'Brasileira',
      placeOfBirth: 'Areia - PB',
      motherName: 'Francisca Maria de Jesus',
      fatherName: 'Manoel da Silva',
      postalCode: '58397-000',
      normalizedPostalCode: '58397000',
      street: 'Sítio Riacho do Meio',
      streetNumber: 'S/N',
      neighborhood: 'Zona Rural',
      city: 'Areia',
      state: 'PB',
      mobilePhone: '(83) 98765-4321',
      phone: '(83) 99123-4567',
      email: 'maria.francisca@exemplo.com',
      hasActiveBenefit: false,
      benefitType: 'Aposentadoria Rural - Segurado Especial',
      benefitNumber: '198.452.120-1',
      recentContributionsSummary: 'Atividade rural em regime de economia familiar desde 1985.',
      specialCategories: ['RURAL'],
      notes: 'Cliente trouxe ITR 2023, aguardando declaração do sindicato rural e certidão INCRA.',
      physicalFileLocation: 'Armário B - Gaveta 03 - Pasta 2026-042',
      visitCount: 3,
      lastVisitAt: '2026-11-14T10:30:00.000Z',
      lastAttendantName: 'Dr. Alexandre Pontes',
      status: 'PENDING',
      active: true,
      createdAt: '2026-10-15T09:00:00.000Z',
      updatedAt: '2026-11-14T10:30:00.000Z',
    },
    attendances: [
      {
        id: 'att-3',
        tenantId: 'tenant-default',
        clientId: 'cli-001',
        attendanceType: 'RETURN_DOCUMENTS',
        attendedAt: '2026-11-14T10:30:00.000Z',
        objective: 'Aposentadoria Rural - Entrega de ITR e Certidão INCRA',
        narrativeHistory:
          'Dona Maria compareceu ao escritório acompanhada de sua filha, trazendo o ITR de 2022 e 2023, além do comprovante de cadastro no INCRA do Sítio Riacho do Meio.\nInformou que localizou também a certidão de casamento de 1991 onde o marido consta qualificado como lavrador.',
        notes:
          'Instrução probatória quase completa. Falta apenas a declaração do sindicato rural para protocolar o requerimento no Meu INSS.',
        attendantName: 'Dr. Alexandre Pontes',
        pendingDocuments: [
          { id: 'p-1', description: 'Certidão de Casamento com qualificação rural (1991)', isDelivered: true },
          { id: 'p-2', description: 'ITR e CAF/DAP do imóvel rural', isDelivered: true },
          { id: 'p-3', description: 'Declaração emitida pelo Sindicato dos Trabalhadores Rurais', isDelivered: false },
        ],
        physicalFileLocation: 'Armário B - Gaveta 03 - Pasta 2026-042',
        createdAt: '2026-11-14T10:30:00.000Z',
        updatedAt: '2026-11-14T10:30:00.000Z',
      },
      {
        id: 'att-2',
        tenantId: 'tenant-default',
        clientId: 'cli-001',
        attendanceType: 'RETURN',
        attendedAt: '2026-10-28T14:15:00.000Z',
        objective: 'Aposentadoria Rural - Conferência de Documentos e Senha Meu INSS',
        narrativeHistory:
          'Realizada conferência da senha do Meu INSS. Acesso restabelecido com sucesso. Baixado extrato previdenciário CNIS para verificar pendências.',
        notes: 'Orientada a buscar no cartório certidão de nascimento dos filhos mais velhos.',
        attendantName: 'Camila Recepção',
        pendingDocuments: [
          { id: 'p-4', description: 'Certidão de nascimento dos filhos', isDelivered: true },
          { id: 'p-5', description: 'Notas fiscais de produtor rural em nome da família', isDelivered: false },
        ],
        physicalFileLocation: 'Armário B - Gaveta 03 - Pasta 2026-042',
        createdAt: '2026-10-28T14:15:00.000Z',
        updatedAt: '2026-10-28T14:15:00.000Z',
      },
      {
        id: 'att-1',
        tenantId: 'tenant-default',
        clientId: 'cli-001',
        attendanceType: 'FIRST_CONSULTATION',
        attendedAt: '2026-10-15T09:00:00.000Z',
        objective: '1ª Consulta - Orientação sobre Aposentadoria Rural por Idade (55 anos Mulher)',
        narrativeHistory:
          'Primeira ida ao escritório por indicação de vizinho. Dona Maria completou 56 anos e deseja saber se já pode se aposentar pelo trabalho na roça.',
        notes:
          'Atingiu o requisito etário (56 anos completos > 55 anos). Diagnosticada alta probabilidade de êxito na aposentadoria rural como segurada especial.',
        attendantName: 'Dr. Alexandre Pontes',
        pendingDocuments: [
          { id: 'p-6', description: 'RG e CPF', isDelivered: true },
          { id: 'p-7', description: 'Comprovante de residência no meio rural', isDelivered: true },
        ],
        physicalFileLocation: 'Armário B - Gaveta 03 - Pasta 2026-042',
        createdAt: '2026-10-15T09:00:00.000Z',
        updatedAt: '2026-10-15T09:00:00.000Z',
      },
    ],
    caseUpdates: [
      {
        id: 'case-up-2',
        tenantId: 'tenant-default',
        clientId: 'cli-001',
        processNumber: 'Protocolo INSS nº 541.209.814',
        forumOrAgency: 'INSS - Agência da Previdência Social / Meu INSS',
        stage: 'ADMINISTRATIVE_INSS',
        eventKind: 'REQUIREMENT_FILED',
        eventDate: '2026-11-15T10:00:00.000Z',
        title: 'Entrada do Requerimento Administrativo no INSS',
        description:
          'Protocolado requerimento de Aposentadoria por Idade Rural perante a agência digital do INSS com juntada de ITR e CAF.',
        notifyClientText:
          'Olá Dona Maria Francisca! Acabamos de dar entrada no seu pedido de Aposentadoria Rural no INSS (Protocolo 541.209.814). Estamos acompanhando a análise do órgão!',
        recordedBy: 'Dr. Alexandre Pontes',
        createdAt: '2026-11-15T10:00:00.000Z',
        updatedAt: '2026-11-15T10:00:00.000Z',
      },
    ],
  },

  // Client 2: Severino Manoel dos Santos (BPC/LOAS Disability - 1 visit)
  'cli-002': {
    client: {
      id: 'cli-002',
      tenantId: 'tenant-default',
      fullName: 'Severino Manoel dos Santos',
      normalizedName: 'severino manoel dos santos',
      cpf: '987.654.321-00',
      normalizedCpf: '98765432100',
      rg: '1.987.654 SSP/PB',
      birthDate: '1964-08-25',
      maritalStatus: 'SINGLE',
      profession: 'Servente de Obras (Incapacitado)',
      nationality: 'Brasileira',
      placeOfBirth: 'Guarabira - PB',
      motherName: 'Severina Maria dos Santos',
      fatherName: 'Antônio Manoel dos Santos',
      postalCode: '58200-000',
      normalizedPostalCode: '58200000',
      street: 'Rua Bela Vista',
      streetNumber: '142',
      neighborhood: 'Bairro Novo',
      city: 'Guarabira',
      state: 'PB',
      mobilePhone: '(83) 98877-6655',
      phone: '(83) 3271-1200',
      email: '',
      hasActiveBenefit: false,
      benefitType: 'BPC/LOAS Pessoa com Deficiência (Incapacidade)',
      benefitNumber: '',
      recentContributionsSummary: 'Poucos recolhimentos urbanos esparsos. Requisito de renda per capita preenchido.',
      specialCategories: ['PCD'],
      notes: 'Apresentou laudos com diagnóstico de artrose grave de coluna e limitações ortopédicas severas (CID M54.5).',
      physicalFileLocation: 'Armário A - Gaveta 01 - Pasta 2026-105',
      visitCount: 1,
      lastVisitAt: '2026-11-17T10:30:00.000Z',
      lastAttendantName: 'Camila Recepção',
      status: 'PROSPECT',
      active: true,
      createdAt: '2026-11-17T10:30:00.000Z',
      updatedAt: '2026-11-17T10:30:00.000Z',
    },
    attendances: [
      {
        id: 'att-sev-1',
        tenantId: 'tenant-default',
        clientId: 'cli-002',
        attendanceType: 'FIRST_CONSULTATION',
        attendedAt: '2026-11-17T10:30:00.000Z',
        objective: '1ª Consulta - BPC/LOAS por Incapacidade Ortopédica Severa',
        narrativeHistory:
          'Seu Severino compareceu de muleta ao escritório relatando fortes dores na lombar e quadril decorrentes de anos de trabalho pesado na construção civil. Vive sozinho com renda familiar extremamente baixa.',
        notes:
          'Renda per capita comprovadamente inferior a 1/4 do salário mínimo. Necessário reunir receitas e laudos atualizados do SUS para perícia médica e social.',
        attendantName: 'Camila Recepção',
        pendingDocuments: [
          { id: 'sev-p1', description: 'Laudo Médico Pericial Ortopédico Atualizado (CID M54.5)', isDelivered: false },
          { id: 'sev-p2', description: 'Comprovante do Cadastro Único (CadÚnico) atualizado', isDelivered: false },
          { id: 'sev-p3', description: 'Extrato CNIS de histórico de trabalho', isDelivered: true },
        ],
        physicalFileLocation: 'Armário A - Gaveta 01 - Pasta 2026-105',
        createdAt: '2026-11-17T10:30:00.000Z',
        updatedAt: '2026-11-17T10:30:00.000Z',
      },
    ],
    caseUpdates: [],
  },

  // Client 3: Antonia Ribeiro de Lima (Urban Age Retirement - Contract Signed - 2 visits)
  'cli-003': {
    client: {
      id: 'cli-003',
      tenantId: 'tenant-default',
      fullName: 'Antonia Ribeiro de Lima',
      normalizedName: 'antonia ribeiro de lima',
      cpf: '456.789.123-00',
      normalizedCpf: '45678912300',
      rg: '3.123.456 SSP/PB',
      birthDate: '1961-02-18',
      maritalStatus: 'DIVORCED',
      profession: 'Costureira / Ex-comerciária',
      nationality: 'Brasileira',
      placeOfBirth: 'Esperança - PB',
      motherName: 'Luzia Ribeiro de Lima',
      fatherName: 'Joaquim Ribeiro de Lima',
      postalCode: '58135-000',
      normalizedPostalCode: '58135000',
      street: 'Av. Manoel Rodrigues',
      streetNumber: '580',
      neighborhood: 'Centro',
      city: 'Esperança',
      state: 'PB',
      mobilePhone: '(83) 99345-6789',
      phone: '',
      email: 'antonia.costuras@gmail.com',
      hasActiveBenefit: false,
      benefitType: 'Aposentadoria por Idade Urbana (62 anos Mulher)',
      benefitNumber: '204.881.990-4',
      recentContributionsSummary: '182 contribuições comprovadas no CNIS (carência mínima de 180 meses superada).',
      specialCategories: ['URBAN_COMMON'],
      notes: 'Documentação completa. Contrato de honorários e procuração OAB devidamente assinados.',
      physicalFileLocation: 'Armário C - Gaveta 02 - Pasta 2026-088',
      visitCount: 2,
      lastVisitAt: '2026-11-17T11:00:00.000Z',
      lastAttendantName: 'Dr. Alexandre Pontes',
      status: 'CLOSED',
      active: true,
      createdAt: '2026-11-10T14:00:00.000Z',
      updatedAt: '2026-11-17T11:00:00.000Z',
    },
    attendances: [
      {
        id: 'att-ant-2',
        tenantId: 'tenant-default',
        clientId: 'cli-003',
        attendanceType: 'CONTRACT_SIGNING',
        attendedAt: '2026-11-17T11:00:00.000Z',
        objective: 'Formalização de Contrato de Honorários e Procuração OAB',
        narrativeHistory:
          'Dona Antonia retornou com todas as carteiras de trabalho (CTPS) originais. Efetuada a conferência dos carimbos e páginas de alteração salarial.',
        notes:
          'Assinada Procuração Ad Judicia e Contrato com cláusula quota litis de 30% sobre os retroativos. Caso encaminhado para protocolo no Meu INSS.',
        attendantName: 'Dr. Alexandre Pontes',
        pendingDocuments: [
          { id: 'ant-p1', description: 'CTPS Digital e Carteiras Físicas originais', isDelivered: true },
          { id: 'ant-p2', description: 'Extrato analítico do CNIS', isDelivered: true },
          { id: 'ant-p3', description: 'Comprovante de residência em nome da titular', isDelivered: true },
        ],
        physicalFileLocation: 'Armário C - Gaveta 02 - Pasta 2026-088',
        createdAt: '2026-11-17T11:00:00.000Z',
        updatedAt: '2026-11-17T11:00:00.000Z',
      },
      {
        id: 'att-ant-1',
        tenantId: 'tenant-default',
        clientId: 'cli-003',
        attendanceType: 'FIRST_CONSULTATION',
        attendedAt: '2026-11-10T14:00:00.000Z',
        objective: '1ª Consulta - Contagem de Tempo de Contribuição e Idade',
        narrativeHistory:
          'Cliente procurou o escritório para saber se já reunia os 15 anos de carência exigidos pela regra pós-reforma (EC 103/2019).',
        notes: 'Constatados 15 anos e 2 meses de contribuição válidos. Direto líquido e certo.',
        attendantName: 'Dr. Alexandre Pontes',
        pendingDocuments: [
          { id: 'ant-p4', description: 'Documentos Pessoais (RG/CPF)', isDelivered: true },
        ],
        physicalFileLocation: 'Armário C - Gaveta 02 - Pasta 2026-088',
        createdAt: '2026-11-10T14:00:00.000Z',
        updatedAt: '2026-11-10T14:00:00.000Z',
      },
    ],
    caseUpdates: [
      {
        id: 'case-up-ant-1',
        tenantId: 'tenant-default',
        clientId: 'cli-003',
        processNumber: 'Protocolo INSS nº 812.394.002',
        forumOrAgency: 'INSS - Agência da Previdência Social / Meu INSS',
        stage: 'ADMINISTRATIVE_INSS',
        eventKind: 'REQUIREMENT_FILED',
        eventDate: '2026-11-17T11:30:00.000Z',
        title: 'Entrada do Requerimento Administrativo no INSS',
        description: 'Protocolado requerimento com juntada de CTPS e extrato CNIS completo.',
        notifyClientText:
          'Olá Dona Antonia! Passando para avisar que acabamos de dar entrada no seu pedido de Aposentadoria Urbana no INSS (Protocolo 812.394.002). Estamos acompanhando a concessão!',
        recordedBy: 'Dr. Alexandre Pontes',
        createdAt: '2026-11-17T11:30:00.000Z',
        updatedAt: '2026-11-17T11:30:00.000Z',
      },
    ],
  },

  // Client 4: Josefa Clementina Alves (Administrative Review - 4 visits)
  'cli-004': {
    client: {
      id: 'cli-004',
      tenantId: 'tenant-default',
      fullName: 'Josefa Clementina Alves',
      normalizedName: 'josefa clementina alves',
      cpf: '654.321.987-11',
      normalizedCpf: '65432198711',
      rg: '2.876.543 SSP/PB',
      birthDate: '1966-11-30',
      maritalStatus: 'WIDOWED',
      profession: 'Auxiliar de Serviços Gerais',
      nationality: 'Brasileira',
      placeOfBirth: 'Remígio - PB',
      motherName: 'Maria José Clementina',
      fatherName: 'Severino Clementino Alves',
      postalCode: '58398-000',
      normalizedPostalCode: '58398000',
      street: 'Rua do Comércio',
      streetNumber: '75',
      neighborhood: 'Centro',
      city: 'Remígio',
      state: 'PB',
      mobilePhone: '(83) 99611-2233',
      phone: '',
      email: '',
      hasActiveBenefit: true,
      benefitType: 'Revisão Administrativa de Benefício (Acerto de Vínculos)',
      benefitNumber: '145.908.231-0',
      recentContributionsSummary: 'Vínculos de 1994 a 1999 com pendência de validação extemporânea (PEXT no CNIS).',
      specialCategories: ['URBAN_COMMON'],
      notes: 'Solicitada cópia integral do processo administrativo originário de concessão junto à agência do INSS.',
      physicalFileLocation: 'Armário B - Gaveta 01 - Pasta 2026-017',
      visitCount: 4,
      lastVisitAt: '2026-11-16T16:45:00.000Z',
      lastAttendantName: 'Camila Recepção',
      status: 'PENDING',
      active: true,
      createdAt: '2026-09-01T08:30:00.000Z',
      updatedAt: '2026-11-16T16:45:00.000Z',
    },
    attendances: [
      {
        id: 'att-jos-4',
        tenantId: 'tenant-default',
        clientId: 'cli-004',
        attendanceType: 'RETURN',
        attendedAt: '2026-11-16T16:45:00.000Z',
        objective: 'Acompanhamento do Pedido de Cópia de Processo no Meu INSS',
        narrativeHistory:
          'Dona Josefa esteve no escritório para verificar se o INSS já havia disponibilizado os arquivos digitalizados do processo de concessão.',
        notes: 'Informado que o prazo do INSS vence em 10 dias. Orientada a aguardar contato telefônico.',
        attendantName: 'Camila Recepção',
        pendingDocuments: [
          { id: 'jos-p1', description: 'Comprovante de residência recente (água/luz)', isDelivered: false },
        ],
        physicalFileLocation: 'Armário B - Gaveta 01 - Pasta 2026-017',
        createdAt: '2026-11-16T16:45:00.000Z',
        updatedAt: '2026-11-16T16:45:00.000Z',
      },
    ],
    caseUpdates: [
      {
        id: 'case-up-jos-1',
        tenantId: 'tenant-default',
        clientId: 'cli-004',
        processNumber: 'Protocolo INSS nº 331.092.115',
        forumOrAgency: 'INSS - Agência da Previdência Social / Meu INSS',
        stage: 'ADMINISTRATIVE_INSS',
        eventKind: 'REQUIREMENT_FILED',
        eventDate: '2026-10-20T09:00:00.000Z',
        title: 'Pedido de Cópia Integral de Processo Concessório',
        description: 'Requerimento protocolado para obtenção de microfichas e dossiê previdenciário do segurado.',
        notifyClientText:
          'Olá Dona Josefa! O pedido de cópia do seu processo já foi solicitado ao INSS. Assim que liberarem o arquivo digital, analisaremos a revisão!',
        recordedBy: 'Dr. Alexandre Pontes',
        createdAt: '2026-10-20T09:00:00.000Z',
        updatedAt: '2026-10-20T09:00:00.000Z',
      },
    ],
  },
};

// Alias 'c-8902' to Maria Francisca
MOCK_CLIENTS_MAP['c-8902'] = MOCK_CLIENTS_MAP['cli-001'];

/**
 * Registers dynamically created client from fast intake
 */
export function registerFastIntakeClient(
  id: string,
  data: { fullName: string; phone: string; cpf?: string; benefit: string; notes?: string }
): ClientProfileBundle {
  const newClient: Client = {
    id,
    tenantId: 'tenant-default',
    fullName: data.fullName,
    normalizedName: data.fullName.toLowerCase(),
    cpf: data.cpf || '000.000.000-00',
    normalizedCpf: (data.cpf || '').replace(/\D/g, ''),
    mobilePhone: data.phone,
    benefitType: data.benefit,
    status: 'PROSPECT',
    active: true,
    visitCount: 1,
    lastVisitAt: new Date().toISOString(),
    lastAttendantName: 'Camila Recepção',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: data.notes || 'Entrada rápida registrada na recepção.',
    physicalFileLocation: 'Arquivo Geral - Pasta 2026-Rápido',
  };

  const initialAttendance: Attendance = {
    id: `att-fast-${id}`,
    tenantId: 'tenant-default',
    clientId: id,
    attendanceType: 'FIRST_CONSULTATION',
    attendedAt: new Date().toISOString(),
    objective: `1ª Consulta / Entrada Rápida: ${data.benefit}`,
    narrativeHistory: `Cliente realizou triagem rápida na recepção com interesse no benefício: ${data.benefit}.`,
    notes: data.notes || 'Cadastro rápido de 15 segundos efetuado com sucesso.',
    attendantName: 'Camila Recepção',
    pendingDocuments: [
      { id: 'p-fast-1', description: 'Documentos Pessoais (RG/CPF)', isDelivered: false },
      { id: 'p-fast-2', description: 'Comprovante de residência atualizado', isDelivered: false },
    ],
    physicalFileLocation: 'Arquivo Geral - Pasta 2026-Rápido',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const bundle: ClientProfileBundle = {
    client: newClient,
    attendances: [initialAttendance],
    caseUpdates: [],
  };

  MOCK_CLIENTS_MAP[id] = bundle;
  return bundle;
}

/**
 * Retrieves client profile bundle by ID.
 * If client is not pre-seeded, dynamically creates a compliant bundle.
 */
export function getClientProfile(id: string): ClientProfileBundle {
  if (MOCK_CLIENTS_MAP[id]) {
    return MOCK_CLIENTS_MAP[id];
  }

  // Fallback for dynamically generated or fast-intake IDs
  const fallbackClient: Client = {
    id,
    tenantId: 'tenant-default',
    fullName: `Cliente Triagem (${id.slice(0, 8)})`,
    normalizedName: `cliente triagem ${id.slice(0, 8)}`,
    cpf: '000.000.000-00',
    normalizedCpf: '00000000000',
    rg: '1.000.000 SSP/PB',
    birthDate: '1970-01-01',
    maritalStatus: 'MARRIED',
    profession: 'Trabalhador(a) Geral',
    nationality: 'Brasileira',
    placeOfBirth: 'Paraíba',
    postalCode: '58000-000',
    street: 'Rua Principal do Município',
    streetNumber: 'S/N',
    neighborhood: 'Centro',
    city: 'Areia',
    state: 'PB',
    mobilePhone: '(83) 99999-0000',
    benefitType: 'Aposentadoria Previdenciária',
    visitCount: 1,
    lastVisitAt: new Date().toISOString(),
    lastAttendantName: 'Camila Recepção',
    status: 'PROSPECT',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Cadastro rápido realizado na recepção. Documentação inicial pendente de validação física.',
    physicalFileLocation: 'Arquivo Geral - Pasta Provisória',
  };

  const fallbackAttendance: Attendance = {
    id: `att-init-${id}`,
    tenantId: 'tenant-default',
    clientId: id,
    attendanceType: 'FIRST_CONSULTATION',
    attendedAt: new Date().toISOString(),
    objective: '1ª Consulta de Balcão e Triagem Inicial',
    narrativeHistory: 'Cliente compareceu ao escritório para orientações sobre benefícios previdenciários.',
    notes: 'Realizado cadastro inicial rápido. Solicitada documentação comprobatória básica.',
    attendantName: 'Camila Recepção',
    pendingDocuments: [
      { id: 'init-p1', description: 'Documento Oficial de Identidade (RG/CPF)', isDelivered: false },
      { id: 'init-p2', description: 'Comprovante de residência atualizado', isDelivered: false },
    ],
    physicalFileLocation: 'Arquivo Geral - Pasta Provisória',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    client: fallbackClient,
    attendances: [fallbackAttendance],
    caseUpdates: [],
  };
}
