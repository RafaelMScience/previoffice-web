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

export const INITIAL_CONTRACTS: Contract[] = [];

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
