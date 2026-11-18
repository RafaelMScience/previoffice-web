import type {
  Contract,
  ContractKpis,
  ContractTemplate,
  FeeInstallment,
  PaymentMethod,
  PhysicalDocumentAttachment,
} from '@/types/contract';

export const INITIAL_CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'tpl-001',
    tenantId: 'tenant-001',
    title: 'Minuta Padrão — Aposentadoria por Idade Rural (Dr. Alexandre Pontes)',
    benefitSpecies: 'Aposentadoria por Idade Rural',
    description: 'Padrão para lavradores e agricultores familiares com cláusulas de prova material campesina e Quota Litis 30%.',
    defaultFeeModel: 'QUOTA_LITIS',
    defaultQuotaLitisPercentage: 30,
    clausesCount: 8,
    isDefault: true,
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/PB 18.234',
    contentBody: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS E HONORÁRIOS — APOSENTADORIA RURAL

CONTRATANTE: {{NOME_CLIENTE}}, CPF: {{CPF}}, RG: {{RG}}, {{ESTADO_CIVIL}}, profissão: {{PROFISSAO}}, residente em {{ENDERECO}}, telefone: {{TELEFONE}}.
CONTRATADA: ALEXANDRE PONTES SOCIEDADE DE ADVOGADOS, sob o patrocínio de {{NOME_ADVOGADO}}, {{OAB_ADVOGADO}}.

CLÁUSULA 1ª — DO OBJETO: Prestação de serviços jurídicos perante o INSS e Justiça Federal para postulação, acompanhamento e liquidação do benefício de {{BENEFICIO}} (Pasta: {{PASTA_FISICA}}).

CLÁUSULA 2ª — DOS HONORÁRIOS: Pelos serviços prestados, o CONTRATANTE pagará {{HONORARIOS}}.
§ 1º — Havendo expedição de Precatório ou Requisição de Pequeno Valor (RPV), os contratados ficam autorizados a destacar sua cota-parte diretamente na fonte pagadora (art. 22, § 4º da Lei nº 8.906/94).

CLÁUSULA 3ª — DA DOCUMENTAÇÃO RURAL: O contratante compromete-se a fornecer certidões, declarações e comprovantes de atividade campesina de boa-fé.

CLÁUSULA 4ª — DO SIGILO E LGPD: Guarda estrita de sigilo sobre dados e documentos.

CLÁUSULA 5ª — DO FORO: Foro da comarca de domicílio do CONTRATANTE.

Localidade, {{DATA_EXTENSO}}.`,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-11-10T14:30:00Z',
  },
  {
    id: 'tpl-002',
    tenantId: 'tenant-001',
    title: 'Minuta Padrão — BPC/LOAS Incapacidade e Idoso (Dra. Camila Santos)',
    benefitSpecies: 'BPC/LOAS',
    description: 'Modelo oficial da Dra. Camila com cláusulas de assistência social sem carência, avaliação pericial e honorários de êxito.',
    defaultFeeModel: 'QUOTA_LITIS',
    defaultQuotaLitisPercentage: 30,
    clausesCount: 9,
    isDefault: true,
    lawyerName: 'Dra. Camila Santos',
    lawyerOab: 'OAB/PB 22.100',
    contentBody: `CONTRATO DE HONORÁRIOS ADVOCATÍCIOS — BPC/LOAS (LEI 8.742/93)

CONTRATANTE: {{NOME_CLIENTE}}, CPF: {{CPF}}, residente em {{ENDERECO}}.
CONTRATADA: {{NOME_ADVOGADO}}, {{OAB_ADVOGADO}}.

CLÁUSULA 1ª — DO OBJETO: Pleito administrativo e judicial de Benefício de Prestação Continuada ({{BENEFICIO}}).
CLÁUSULA 2ª — DOS HONORÁRIOS AD EXITUM: O CONTRATANTE pagará {{HONORARIOS}}.
CLÁUSULA 3ª — DO CADÚNICO: Obrigatoriedade de inscrição e atualização periódica do CadÚnico pelo beneficiário.
CLÁUSULA 4ª — DO DESTACAMENTO DE HONORÁRIOS: Autorização expressa de retenção na RPV (art. 22 § 4º da Lei 8.906/94).

Localidade, {{DATA_EXTENSO}}.`,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-10-22T11:15:00Z',
  },
  {
    id: 'tpl-003',
    tenantId: 'tenant-001',
    title: 'Minuta Padrão — Aposentadoria Urbana & Regras de Transição (Dr. Alexandre Pontes)',
    benefitSpecies: 'Aposentadoria por Tempo de Contribuição',
    description: 'Averbação de PPP/LTCAT insalubre, retificação de vínculos no CNIS e quota litis padrão OAB.',
    defaultFeeModel: 'QUOTA_LITIS',
    defaultQuotaLitisPercentage: 30,
    clausesCount: 10,
    isDefault: true,
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/PB 18.234',
    contentBody: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — APOSENTADORIA URBANA E TRANSIÇÃO

CONTRATANTE: {{NOME_CLIENTE}}, portador do CPF {{CPF}}, residente em {{ENDERECO}}.
CONTRATADA: {{NOME_ADVOGADO}}, {{OAB_ADVOGADO}}.

CLÁUSULA 1ª — DO OBJETO: Retificação de vínculos no CNIS e postulação de {{BENEFICIO}}.
CLÁUSULA 2ª — DOS HONORÁRIOS: {{HONORARIOS}}.
CLÁUSULA 3ª — SUCUMBÊNCIA: Os honorários de sucumbência pertencem com exclusividade aos patronos.

Localidade, {{DATA_EXTENSO}}.`,
    createdAt: '2026-02-15T14:00:00Z',
    updatedAt: '2026-09-18T16:00:00Z',
  },
  {
    id: 'tpl-004',
    tenantId: 'tenant-001',
    title: 'Minuta Padrão — Planejamento Previdenciário Parcelado (Banca Geral)',
    benefitSpecies: 'Planejamento Previdenciário',
    description: 'Estrutura com entrada à vista e parcelamento em carnê/boleto/Pix para cálculos e contagem de tempo.',
    defaultFeeModel: 'FIXED_INSTALLMENT',
    defaultQuotaLitisPercentage: 0,
    clausesCount: 7,
    isDefault: false,
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/PB 18.234',
    contentBody: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PLANEJAMENTO PREVIDENCIÁRIO

CONTRATANTE: {{NOME_CLIENTE}}, CPF: {{CPF}}, residente em {{ENDERECO}}.
CONTRATADA: {{NOME_ADVOGADO}}, {{OAB_ADVOGADO}}.

CLÁUSULA 1ª — DO OBJETO: Elaboração de Estudo Técnico de Planejamento Previdenciário com simulação de cenários de aposentadoria.
CLÁUSULA 2ª — DO VALOR: O CONTRATANTE pagará {{HONORARIOS}}.
CLÁUSULA 3ª — DA ENTREGA: O relatório do planejamento será entregue no prazo de 15 dias úteis.

Localidade, {{DATA_EXTENSO}}.`,
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-11-05T09:20:00Z',
  },
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'ctr-001',
    tenantId: 'tenant-001',
    contractNumber: 'CTR-2026-081',
    clientId: 'cli-001',
    clientName: 'Maria Francisca da Silva',
    clientCpf: '12345678909',
    clientPhone: '(83) 98765-4321',
    benefitSpecies: 'Aposentadoria por Idade Rural',
    templateId: 'tpl-001',
    templateTitle: 'Aposentadoria Rural por Idade',
    status: 'ACTIVE',
    physicalSignedStatus: 'ATTACHED',
    physicalAttachment: {
      id: 'att-001',
      fileName: 'Contrato_Procuracao_Maria_Francisca_Assinado.pdf',
      fileSizeFormatted: '2.4 MB',
      fileType: 'application/pdf',
      uploadedAt: '2026-11-12T14:30:00Z',
      uploadedBy: 'Dr. Alexandre Pontes',
      physicalCabinetLocation: 'Armário B - Gaveta 03 - Pasta 2026-042',
      signerType: 'CLIENT_SIGNATURE',
      notes: 'Assinatura a rogo com presença de 2 testemunhas idôneas da comunidade rural.',
    },
    feeStructure: {
      feeModel: 'QUOTA_LITIS',
      quotaLitisPercentage: 30,
      estimatedRetroactiveAmount: 42000,
      estimatedSuccessFeeAmount: 12600,
      actualSuccessFeeReceived: 0,
      installments: [],
    },
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/PB 18.234',
    officeName: 'Alexandre Pontes Sociedade de Advogados',
    issuedAt: '2026-11-10T11:00:00Z',
    signedAt: '2026-11-12T14:25:00Z',
    physicalFileLocation: 'Armário B - Gaveta 03 - Pasta 2026-042',
    notes: 'Requerimento administrativo protocolado no INSS com segurado especial reconhecido.',
    createdAt: '2026-11-10T11:00:00Z',
    updatedAt: '2026-11-12T14:30:00Z',
  },
  {
    id: 'ctr-002',
    tenantId: 'tenant-001',
    contractNumber: 'CTR-2026-092',
    clientId: 'cli-002',
    clientName: 'Severino Manoel dos Santos',
    clientCpf: '98765432100',
    clientPhone: '(83) 99123-4567',
    benefitSpecies: 'BPC/LOAS Deficiência',
    templateId: 'tpl-002',
    templateTitle: 'Benefício Assistencial BPC/LOAS',
    status: 'ACTIVE',
    physicalSignedStatus: 'PENDING',
    feeStructure: {
      feeModel: 'HYBRID',
      quotaLitisPercentage: 20,
      estimatedRetroactiveAmount: 28000,
      estimatedSuccessFeeAmount: 5600,
      fixedTotalAmount: 1400,
      downPaymentAmount: 400,
      installmentCount: 4,
      installments: [
        {
          id: 'inst-002-1',
          contractId: 'ctr-002',
          installmentNumber: 1,
          dueDate: '2026-10-15',
          amount: 400,
          status: 'PAID',
          paidAt: '2026-10-15T15:20:00Z',
          paymentMethod: 'PIX',
          receiptReference: 'PIX-E2E-99887766',
          notes: 'Entrada à vista paga no balcão',
        },
        {
          id: 'inst-002-2',
          contractId: 'ctr-002',
          installmentNumber: 2,
          dueDate: '2026-11-15',
          amount: 250,
          status: 'PAID',
          paidAt: '2026-11-14T10:15:00Z',
          paymentMethod: 'PIX',
          receiptReference: 'PIX-E2E-11223344',
          notes: 'Segunda parcela quitada com antecedência',
        },
        {
          id: 'inst-002-3',
          contractId: 'ctr-002',
          installmentNumber: 3,
          dueDate: '2026-12-15',
          amount: 250,
          status: 'PENDING',
        },
        {
          id: 'inst-002-4',
          contractId: 'ctr-002',
          installmentNumber: 4,
          dueDate: '2027-01-15',
          amount: 250,
          status: 'PENDING',
        },
        {
          id: 'inst-002-5',
          contractId: 'ctr-002',
          installmentNumber: 5,
          dueDate: '2027-02-15',
          amount: 250,
          status: 'PENDING',
        },
      ],
    },
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/PB 18.234',
    officeName: 'Alexandre Pontes Sociedade de Advogados',
    issuedAt: '2026-10-10T09:30:00Z',
    signedAt: '2026-10-15T15:00:00Z',
    physicalFileLocation: 'Armário A - Gaveta 01 - Pasta 2026-015',
    notes: 'Aguardando cliente trazer a folha física com firma reconhecida para arquivar no cofre.',
    createdAt: '2026-10-10T09:30:00Z',
    updatedAt: '2026-11-14T10:15:00Z',
  },
  {
    id: 'ctr-003',
    tenantId: 'tenant-001',
    contractNumber: 'CTR-2026-088',
    clientId: 'cli-003',
    clientName: 'Antonia Ribeiro de Lima',
    clientCpf: '45678912345',
    clientPhone: '(83) 98888-2233',
    benefitSpecies: 'Aposentadoria por Tempo de Contribuição',
    templateId: 'tpl-003',
    templateTitle: 'Aposentadoria Urbana Transição',
    status: 'ACTIVE',
    physicalSignedStatus: 'ATTACHED',
    physicalAttachment: {
      id: 'att-003',
      fileName: 'Contrato_Assinado_Antonia_Ribeiro.pdf',
      fileSizeFormatted: '1.8 MB',
      fileType: 'application/pdf',
      uploadedAt: '2026-11-08T16:00:00Z',
      uploadedBy: 'Dr. Alexandre Pontes',
      physicalCabinetLocation: 'Armário C - Gaveta 02 - Pasta 2026-089',
      signerType: 'CLIENT_SIGNATURE',
    },
    feeStructure: {
      feeModel: 'QUOTA_LITIS',
      quotaLitisPercentage: 30,
      estimatedRetroactiveAmount: 36000,
      estimatedSuccessFeeAmount: 10800,
      actualSuccessFeeReceived: 0,
      installments: [],
    },
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/PB 18.234',
    officeName: 'Alexandre Pontes Sociedade de Advogados',
    issuedAt: '2026-11-05T14:00:00Z',
    signedAt: '2026-11-08T15:45:00Z',
    physicalFileLocation: 'Armário C - Gaveta 02 - Pasta 2026-089',
    notes: 'Contrato físico assinado no gabinete. Atrasados com base na DER de Jan/2025.',
    createdAt: '2026-11-05T14:00:00Z',
    updatedAt: '2026-11-08T16:00:00Z',
  },
  {
    id: 'ctr-004',
    tenantId: 'tenant-001',
    contractNumber: 'CTR-2026-105',
    clientId: 'cli-004',
    clientName: 'Josefa Clementina Alves',
    clientCpf: '78912345678',
    clientPhone: '(83) 99345-6789',
    benefitSpecies: 'Planejamento Previdenciário',
    templateId: 'tpl-004',
    templateTitle: 'Contrato Parcelado Fixo com Entrada',
    status: 'ACTIVE',
    physicalSignedStatus: 'ATTACHED',
    physicalAttachment: {
      id: 'att-004',
      fileName: 'Scan_Contrato_Josefa_Clementina.pdf',
      fileSizeFormatted: '3.1 MB',
      fileType: 'application/pdf',
      uploadedAt: '2026-10-01T11:20:00Z',
      uploadedBy: 'Dr. Alexandre Pontes',
      physicalCabinetLocation: 'Arquivo Geral - Pasta 2026-105',
      signerType: 'CLIENT_SIGNATURE',
    },
    feeStructure: {
      feeModel: 'FIXED_INSTALLMENT',
      fixedTotalAmount: 2400,
      downPaymentAmount: 400,
      installmentCount: 5,
      installments: [
        {
          id: 'inst-004-1',
          contractId: 'ctr-004',
          installmentNumber: 1,
          dueDate: '2026-10-01',
          amount: 400,
          status: 'PAID',
          paidAt: '2026-10-01T11:00:00Z',
          paymentMethod: 'PIX',
          receiptReference: 'PIX-001122',
        },
        {
          id: 'inst-004-2',
          contractId: 'ctr-004',
          installmentNumber: 2,
          dueDate: '2026-11-01',
          amount: 400,
          status: 'PAID',
          paidAt: '2026-11-01T09:30:00Z',
          paymentMethod: 'BOLETO',
          receiptReference: 'BOL-990088',
        },
        {
          id: 'inst-004-3',
          contractId: 'ctr-004',
          installmentNumber: 3,
          dueDate: '2026-11-15',
          amount: 400,
          status: 'OVERDUE',
          notes: 'Aguardando contato pelo WhatsApp para regularização do boleto',
        },
        {
          id: 'inst-004-4',
          contractId: 'ctr-004',
          installmentNumber: 4,
          dueDate: '2026-12-15',
          amount: 400,
          status: 'PENDING',
        },
        {
          id: 'inst-004-5',
          contractId: 'ctr-004',
          installmentNumber: 5,
          dueDate: '2027-01-15',
          amount: 400,
          status: 'PENDING',
        },
        {
          id: 'inst-004-6',
          contractId: 'ctr-004',
          installmentNumber: 6,
          dueDate: '2027-02-15',
          amount: 400,
          status: 'PENDING',
        },
      ],
    },
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/PB 18.234',
    officeName: 'Alexandre Pontes Sociedade de Advogados',
    issuedAt: '2026-10-01T10:00:00Z',
    signedAt: '2026-10-01T10:45:00Z',
    physicalFileLocation: 'Arquivo Geral - Pasta 2026-105',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-11-16T12:00:00Z',
  },
  {
    id: 'ctr-005',
    tenantId: 'tenant-001',
    contractNumber: 'CTR-2026-044',
    clientId: 'cli-005',
    clientName: 'Sebastião Ferreira Ramos',
    clientCpf: '32165498711',
    clientPhone: '(83) 99678-1234',
    benefitSpecies: 'Pensão por Morte Rural',
    templateId: 'tpl-001',
    templateTitle: 'Pensão por Morte Previdenciária',
    status: 'CONCLUDED',
    physicalSignedStatus: 'ATTACHED',
    physicalAttachment: {
      id: 'att-005',
      fileName: 'Contrato_Concluido_Sebastiao_Ferreira.pdf',
      fileSizeFormatted: '1.5 MB',
      fileType: 'application/pdf',
      uploadedAt: '2026-08-10T14:00:00Z',
      uploadedBy: 'Dr. Alexandre Pontes',
      physicalCabinetLocation: 'Arquivo Morto / Concluídos - Pasta 2026-044',
      signerType: 'CLIENT_SIGNATURE',
    },
    feeStructure: {
      feeModel: 'QUOTA_LITIS',
      quotaLitisPercentage: 30,
      estimatedRetroactiveAmount: 32833.33,
      estimatedSuccessFeeAmount: 9850,
      actualSuccessFeeReceived: 9850,
      installments: [],
    },
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/PB 18.234',
    officeName: 'Alexandre Pontes Sociedade de Advogados',
    issuedAt: '2026-08-01T08:30:00Z',
    signedAt: '2026-08-10T11:00:00Z',
    concludedAt: '2026-11-01T16:00:00Z',
    physicalFileLocation: 'Arquivo Morto / Concluídos - Pasta 2026-044',
    notes: 'Benefício implantado no INSS com sucesso. Honorários recebidos integralmente via RPV.',
    createdAt: '2026-08-01T08:30:00Z',
    updatedAt: '2026-11-01T16:00:00Z',
  },
  {
    id: 'ctr-006',
    tenantId: 'tenant-001',
    contractNumber: 'CTR-2026-118',
    clientId: 'cli-006',
    clientName: 'Geraldo Rodrigues de Sousa',
    clientCpf: '65432198700',
    clientPhone: '(83) 98711-2233',
    benefitSpecies: 'Auxílio por Incapacidade Temporária',
    templateId: 'tpl-002',
    templateTitle: 'Benefício Assistencial BPC/LOAS',
    status: 'PENDING_SIGNATURE',
    physicalSignedStatus: 'PENDING',
    feeStructure: {
      feeModel: 'HYBRID',
      quotaLitisPercentage: 30,
      estimatedRetroactiveAmount: 18000,
      estimatedSuccessFeeAmount: 5400,
      fixedTotalAmount: 900,
      downPaymentAmount: 300,
      installmentCount: 3,
      installments: [
        {
          id: 'inst-006-1',
          contractId: 'ctr-006',
          installmentNumber: 1,
          dueDate: '2026-11-25',
          amount: 300,
          status: 'PENDING',
        },
        {
          id: 'inst-006-2',
          contractId: 'ctr-006',
          installmentNumber: 2,
          dueDate: '2026-12-25',
          amount: 300,
          status: 'PENDING',
        },
        {
          id: 'inst-006-3',
          contractId: 'ctr-006',
          installmentNumber: 3,
          dueDate: '2027-01-25',
          amount: 300,
          status: 'PENDING',
        },
      ],
    },
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/PB 18.234',
    officeName: 'Alexandre Pontes Sociedade de Advogados',
    issuedAt: '2026-11-16T15:00:00Z',
    physicalFileLocation: 'Armário A - Gaveta 03 - Pasta 2026-118',
    notes: 'Minuta impressa entregue ao cliente para assinatura junto aos familiares.',
    createdAt: '2026-11-16T15:00:00Z',
    updatedAt: '2026-11-16T15:00:00Z',
  },
];

export function calculateContractKpis(contracts: Contract[]): ContractKpis {
  let totalContractedAmount = 0;
  let estimatedSuccessReceivables = 0;
  let openInstallmentsCount = 0;
  let openInstallmentsAmount = 0;
  let overdueInstallmentsCount = 0;
  let signedPhysicalCount = 0;

  for (const c of contracts) {
    if (c.status === 'CANCELLED') continue;

    // Quota litis projection
    if (c.feeStructure.estimatedSuccessFeeAmount) {
      totalContractedAmount += c.feeStructure.estimatedSuccessFeeAmount;
      if (c.status === 'ACTIVE' || c.status === 'PENDING_SIGNATURE') {
        estimatedSuccessReceivables += c.feeStructure.estimatedSuccessFeeAmount;
      }
    }

    // Fixed / installment amount
    if (c.feeStructure.fixedTotalAmount) {
      totalContractedAmount += c.feeStructure.fixedTotalAmount;
    }

    // Installments status
    if (c.feeStructure.installments) {
      for (const inst of c.feeStructure.installments) {
        if (inst.status === 'PENDING' || inst.status === 'OVERDUE') {
          openInstallmentsCount++;
          openInstallmentsAmount += inst.amount;
        }
        if (inst.status === 'OVERDUE') {
          overdueInstallmentsCount++;
        }
      }
    }

    // Physical signed attachment audit
    if (c.physicalSignedStatus === 'ATTACHED') {
      signedPhysicalCount++;
    }
  }

  const totalContractsCount = contracts.length;
  const signedPhysicalAttachedRate =
    totalContractsCount > 0 ? (signedPhysicalCount / totalContractsCount) * 100 : 0;

  return {
    totalContractedAmount,
    estimatedSuccessReceivables,
    openInstallmentsCount,
    openInstallmentsAmount,
    overdueInstallmentsCount,
    signedPhysicalAttachedRate,
    signedPhysicalCount,
    totalContractsCount,
  };
}

class ContractsStore {
  private contracts: Contract[] = [...INITIAL_CONTRACTS];
  private templates: ContractTemplate[] = [...INITIAL_CONTRACT_TEMPLATES];

  public getContracts(): Contract[] {
    return [...this.contracts];
  }

  public getTemplates(): ContractTemplate[] {
    return [...this.templates];
  }

  public getKpis(): ContractKpis {
    return calculateContractKpis(this.contracts);
  }

  public getContractById(id: string): Contract | undefined {
    return this.contracts.find((c) => c.id === id);
  }

  public settleInstallment(
    contractId: string,
    installmentId: string,
    paymentMethod: PaymentMethod,
    receiptReference?: string,
    notes?: string
  ): Contract | null {
    const contract = this.contracts.find((c) => c.id === contractId);
    if (!contract) return null;

    const installment = contract.feeStructure.installments.find((i) => i.id === installmentId);
    if (!installment) return null;

    installment.status = 'PAID';
    installment.paidAt = new Date().toISOString();
    installment.paymentMethod = paymentMethod;
    installment.receiptReference = receiptReference;
    if (notes) installment.notes = notes;

    // Check if ALL installments are now settled
    const allInstallmentsPaid = contract.feeStructure.installments.every(
      (inst) => inst.status === 'PAID'
    );
    if (allInstallmentsPaid && contract.feeStructure.installments.length > 0) {
      contract.feeStructure.isSettled = true;
      // If it's a fixed installment contract, the financial obligation is concluded
      if (contract.feeStructure.feeModel === 'FIXED_INSTALLMENT') {
        contract.status = 'CONCLUDED';
        contract.concludedAt = new Date().toISOString();
      }
    }

    contract.updatedAt = new Date().toISOString();
    return { ...contract };
  }

  public attachSignedPhysicalDocument(
    contractId: string,
    attachment: PhysicalDocumentAttachment
  ): Contract | null {
    const contract = this.contracts.find((c) => c.id === contractId);
    if (!contract) return null;

    contract.physicalAttachment = attachment;
    contract.physicalSignedStatus = 'ATTACHED';
    contract.physicalFileLocation = attachment.physicalCabinetLocation;
    if (contract.status === 'PENDING_SIGNATURE' || contract.status === 'DRAFT') {
      contract.status = 'ACTIVE';
      contract.signedAt = new Date().toISOString();
    }
    contract.updatedAt = new Date().toISOString();
    return { ...contract };
  }

  public updateTemplate(updated: ContractTemplate): ContractTemplate | null {
    const idx = this.templates.findIndex((t) => t.id === updated.id);
    if (idx === -1) return null;
    const tpl: ContractTemplate = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    this.templates[idx] = tpl;
    return tpl;
  }

  public addTemplate(template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>): ContractTemplate {
    const newTpl: ContractTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.templates = [newTpl, ...this.templates];
    return newTpl;
  }

  public createContract(newContract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Contract {
    const created: Contract = {
      ...newContract,
      id: `ctr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.contracts = [created, ...this.contracts];
    return created;
  }
}

export const contractsStore = new ContractsStore();
