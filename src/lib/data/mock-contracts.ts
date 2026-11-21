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
    description: 'Padrão oficial para lavradores e segurados especiais com comprovação de atividade campesina, destacamento de RPV e Quota Litis 30%.',
    defaultFeeModel: 'QUOTA_LITIS',
    defaultQuotaLitisPercentage: 30,
    clausesCount: 8,
    isDefault: true,
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/AM 55.858',
    contentBody: `INSTRUMENTO PARTICULAR DE CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS E HONORÁRIOS PROFISSIONAIS — APOSENTADORIA RURAL

Pelo presente instrumento particular, regido pela Lei Federal nº 8.906/1994 (Estatuto da Advocacia e da OAB), pelos artigos 593 e seguintes e 653 e seguintes da Lei Federal nº 10.406/2002 (Código Civil Brasileiro), pelo Código de Ética e Disciplina da OAB e pela legislação previdenciária de regência (Lei nº 8.213/1991), têm entre si justo e acordado:

CONTRATANTE: {{NOME_CLIENTE}}, brasileiro(a), {{ESTADO_CIVIL}}, profissão: {{PROFISSAO}}, inscrito(a) no CPF/MF sob o nº {{CPF}}, portador(a) do RG nº {{RG}}, residente e domiciliado(a) em {{ENDERECO}}, telefone/WhatsApp: {{TELEFONE}}.

CONTRATADA: ALEXANDRE PONTES SOCIEDADE DE ADVOGADOS, inscrita na OAB/AM, representada neste ato pelo(a) advogado(a) Dr(a). {{NOME_ADVOGADO}}, inscrito(a) na OAB sob o nº {{OAB_ADVOGADO}}, com sede e domicílio profissional no escritório central.

As partes ajustam o presente contrato mediante as seguintes cláusulas:

CLÁUSULA 1ª — DO OBJETO E PATROCÍNIO: O presente contrato tem por objeto a prestação de serviços jurídicos e representação técnica profissional da CONTRATADA em favor do(a) CONTRATANTE, para postulação, acompanhamento e liquidação do benefício previdenciário de {{BENEFICIO}} (Pasta Documental: {{PASTA_FISICA}}), na esfera administrativa perante o Instituto Nacional do Seguro Social (INSS) e, se necessário, na esfera judicial perante a Justiça Federal ou Estadual delegada e tribunais competentes até final liquidação.
Parágrafo Único — A atuação contratada constitui obrigação de meio e não de resultado, assumindo a CONTRATADA o compromisso de aplicar todo zelo profissional e técnica jurídica na defesa dos direitos do(a) CONTRATANTE (art. 14 do Código de Ética e Disciplina da OAB).

CLÁUSULA 2ª — DAS OBRIGAÇÕES DAS PARTES E PROVA RURAL:
I — A CONTRATADA obriga-se a prestar informações transparentes sobre o andamento dos pleitos e a guardar estrito sigilo de todos os dados e documentos, nos termos do art. 35 do Código de Ética e Disciplina da OAB e da Lei Federal nº 13.709/2018 (LGPD).
II — O(A) CONTRATANTE compromete-se a fornecer toda a documentação comprobatória de sua atividade rural e campesina (certidões de registro de imóveis rurais, declarações de sindicatos rurais, notas fiscais de produtor, contratos de comodato/arrendamento, certidões públicas com qualificação de lavrador e autodeclaração homologada perante o INSS), responsabilizando-se civil e penalmente pela veracidade das informações e documentos apresentados, bem como a comparecer pontualmente a todos os atos, perícias e audiências designadas.

CLÁUSULA 3ª — DOS HONORÁRIOS ADVOCATÍCIOS CONTRATUAIS:
Pelos serviços profissionais prestados, em conformidade com o art. 22 da Lei Federal nº 8.906/1994 e o Código de Ética e Disciplina da OAB, o(a) CONTRATANTE pagará à CONTRATADA a título de honorários advocatícios:
{{HONORARIOS}}

CLÁUSULA 4ª — DO DESTACAMENTO DE HONORÁRIOS EM RPV / PRECATÓRIO E ALVARÁ:
Com fulcro no artigo 22, § 4º da Lei Federal nº 8.906/1994, o(a) CONTRATANTE autoriza expressamente os patronos constituídos a juntar este contrato de honorários aos autos judiciais, com requerimento ao Juízo competente para expedição de Requisição de Pequeno Valor (RPV) ou Precatório Judicial com DESTACAMENTO PRÉVIO DA COTA-PARTE DOS HONORÁRIOS CONTRATUAIS diretamente em favor da sociedade de advogados / patrono junto à instituição bancária oficial pagadora (Caixa Econômica Federal ou Banco do Brasil S/A).
Parágrafo Único — Fica a CONTRATADA igualmente autorizada a receber valores e levantar alvarás judiciais, retendo a verba honorária acordada e repassando de imediato ao(à) CONTRATANTE o saldo líquido respectivo mediante prestação de contas.

CLÁUSULA 5ª — DOS HONORÁRIOS DE SUCUMBÊNCIA:
Os honorários de sucumbência arbitrados judicialmente em desfavor do INSS pertencem com exclusividade à CONTRATADA, na forma do art. 23 da Lei Federal nº 8.906/1994 e do art. 85, § 14 da Lei Federal nº 13.105/2015 (CPC), não se compensando nem se deduzindo dos honorários contratuais ora ajustados.

CLÁUSULA 6ª — DA REVOGAÇÃO DO MANDATO OU ACORDO DIRETO:
Caso o(a) CONTRATANTE venha a revogar o mandato outorgado sem justa causa antes do término do processo ou celebre acordo direto com o INSS à revelia dos advogados constituídos, permanecerá obrigado(a) ao adimplemento integral dos honorários advocatícios contratados sobre o proveito econômico obtido, na forma do art. 22 da Lei nº 8.906/1994 e art. 658 da Lei nº 10.406/2002.

CLÁUSULA 7ª — DA PROTEÇÃO DE DADOS (LGPD):
O(A) CONTRATANTE autoriza expressamente o tratamento e guarda de seus dados cadastrais e documentos para as estritas finalidades de cumprimento deste contrato e postulação perante os órgãos previdenciários e judiciais, em estrita consonância com o art. 7º, incisos V e VI da Lei Federal nº 13.709/2018.

CLÁUSULA 8ª — DA FORÇA EXECUTIVA E DO FORO:
O presente contrato reveste-se de eficácia de título executivo extrajudicial (art. 784, III, do Código de Processo Civil e art. 24 da Lei Federal nº 8.906/1994). Para dirimir quaisquer litígios decorrentes deste instrumento, as partes elegem o foro da Comarca do domicílio do(a) CONTRATANTE.

Localidade, {{DATA_EXTENSO}}.`,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-11-20T15:30:00Z',
  },
  {
    id: 'tpl-002',
    tenantId: 'tenant-001',
    title: 'Minuta Padrão — BPC/LOAS Incapacidade e Idoso (Dra. Camila Santos)',
    benefitSpecies: 'BPC/LOAS',
    description: 'Modelo oficial da Dra. Camila com cláusulas de assistência social sem carência (Lei 8.742/93), avaliação pericial e honorários de êxito.',
    defaultFeeModel: 'QUOTA_LITIS',
    defaultQuotaLitisPercentage: 30,
    clausesCount: 8,
    isDefault: true,
    lawyerName: 'Dra. Camila Santos',
    lawyerOab: 'OAB/AM 22.100',
    contentBody: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS E HONORÁRIOS PROFISSIONAIS — BENEFÍCIO DE PRESTAÇÃO CONTINUADA (BPC/LOAS)

Pelo presente instrumento particular, regido pela Lei Federal nº 8.906/1994 (Estatuto da OAB), artigos 593 e seguintes e 653 e seguintes da Lei Federal nº 10.406/2002 (Código Civil) e Lei Federal nº 8.742/1993 (Lei Orgânica da Assistência Social - LOAS), celebram entre si:

CONTRATANTE: {{NOME_CLIENTE}}, portador(a) do CPF/MF nº {{CPF}}, RG nº {{RG}}, residente em {{ENDERECO}}, telefone: {{TELEFONE}}.
CONTRATADA: Sociedade de Advogados sob patrocínio de {{NOME_ADVOGADO}}, {{OAB_ADVOGADO}}.

CLÁUSULA 1ª — DO OBJETO: Prestação de serviços jurídicos para postulação e obtenção do Benefício de Prestação Continuada da Assistência Social ({{BENEFICIO}}), em favor da pessoa com deficiência ou idoso hipossuficiente (Pasta: {{PASTA_FISICA}}).
CLÁUSULA 2ª — DOS HONORÁRIOS CONTRATUAIS: Pelos serviços prestados, em conformidade com o art. 22 da Lei Federal nº 8.906/1994 e o Código de Ética e Disciplina da OAB, o(a) CONTRATANTE pagará à CONTRATADA a título de honorários advocatícios:
{{HONORARIOS}}
CLÁUSULA 3ª — DO DESTACAMENTO DE HONORÁRIOS: Autorização expressa para requisição judicial de RPV com retenção e destacamento de honorários diretamente na fonte pagadora (art. 22, § 4º da Lei 8.906/94).
CLÁUSULA 4ª — DO CADÚNICO: O(A) CONTRATANTE compromete-se a manter sua inscrição e atualização bienal no Cadastro Único para Programas Sociais do Governo Federal (CadÚnico).
CLÁUSULA 5ª — DAS PERÍCIAS E AVALIAÇÕES: Obrigatoriedade de comparecimento às perícias médicas e avaliações sociais designadas pelo INSS ou perito judicial.
CLÁUSULA 6ª — DOS HONORÁRIOS DE SUCUMBÊNCIA: Os honorários sucumbenciais pertencem exclusivamente à CONTRATADA (art. 23 da Lei 8.906/94 e art. 85, § 14 do CPC).
CLÁUSULA 7ª — DA LGPD: Tratamento estrito de dados pessoais nos moldes da Lei Federal nº 13.709/2018 (art. 7º, V e VI).
CLÁUSULA 8ª — DO FORO: Foro da comarca do domicílio do(a) CONTRATANTE, com base no art. 784, III do CPC.

Localidade, {{DATA_EXTENSO}}.`,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-11-20T15:30:00Z',
  },
  {
    id: 'tpl-003',
    tenantId: 'tenant-001',
    title: 'Minuta Padrão — Aposentadoria Urbana & Regras de Transição (Dr. Alexandre Pontes)',
    benefitSpecies: 'Aposentadoria por Tempo de Contribuição',
    description: 'Averbação de PPP/LTCAT insalubre, retificação de vínculos no CNIS, regras de transição da EC 103/2019 e quota litis padrão OAB.',
    defaultFeeModel: 'QUOTA_LITIS',
    defaultQuotaLitisPercentage: 30,
    clausesCount: 8,
    isDefault: true,
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/AM 55.858',
    contentBody: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS PREVIDENCIÁRIOS — APOSENTADORIA URBANA E REGRAS DE TRANSIÇÃO (EC 103/2019)

Pelo presente instrumento, regido pela Lei Federal nº 8.906/1994, Lei Federal nº 10.406/2002 e Lei Federal nº 8.213/1991:

CONTRATANTE: {{NOME_CLIENTE}}, portador(a) do CPF {{CPF}}, RG {{RG}}, residente em {{ENDERECO}}, telefone: {{TELEFONE}}.
CONTRATADA: ALEXANDRE PONTES SOCIEDADE DE ADVOGADOS, representada por {{NOME_ADVOGADO}}, {{OAB_ADVOGADO}}.

CLÁUSULA 1ª — DO OBJETO: Retificação, acerto de vínculos e remunerações no CNIS, averbação de tempo especial/insalubre e postulação administrativa e judicial do benefício de {{BENEFICIO}} (Pasta: {{PASTA_FISICA}}).
CLÁUSULA 2ª — DOS HONORÁRIOS CONTRATUAIS: Pelos serviços profissionais prestados, em conformidade com o art. 22 da Lei Federal nº 8.906/1994 e o Código de Ética e Disciplina da OAB, o(a) CONTRATANTE pagará à CONTRATADA a título de honorários advocatícios:
{{HONORARIOS}}
CLÁUSULA 3ª — DO DESTACAMENTO NA RPV: Autorização expressa para requisição e destacamento prévio da verba honorária diretamente em favor da CONTRATADA (art. 22, § 4º da Lei 8.906/94).
CLÁUSULA 4ª — DOS HONORÁRIOS SUCUMBENCIAIS: Cabem exclusivamente à CONTRATADA (art. 23 da Lei 8.906/94 e art. 85, § 14 do CPC).
CLÁUSULA 5ª — DAS OBRIGAÇÕES DE MEIO: Prestação de serviços com zelo técnico e presteza, sem garantia de resultado específico (art. 14 do Código de Ética da OAB).
CLÁUSULA 6ª — DA RESCISÃO: Aplicação dos arts. 22 da Lei 8.906/94 e 658 do Código Civil em caso de revogação imotivada ou acordo direto à revelia dos patronos.
CLÁUSULA 7ª — DA PROTEÇÃO DE DADOS: Tratamento de dados nos termos do art. 7º, V e VI da Lei Federal nº 13.709/2018 (LGPD).
CLÁUSULA 8ª — DA EFICÁCIA EXECUTIVA E FORO: Título executivo extrajudicial (art. 784, III do CPC), elegendo-se o foro do domicílio do CONTRATANTE.

Localidade, {{DATA_EXTENSO}}.`,
    createdAt: '2026-02-15T14:00:00Z',
    updatedAt: '2026-11-20T15:30:00Z',
  },
  {
    id: 'tpl-004',
    tenantId: 'tenant-001',
    title: 'Minuta Padrão — Planejamento Previdenciário Parcelado (Banca Geral)',
    benefitSpecies: 'Planejamento Previdenciário',
    description: 'Estrutura com honorários fixos de consultoria para estudo técnico de aposentadoria e análise contributiva.',
    defaultFeeModel: 'FIXED_INSTALLMENT',
    defaultQuotaLitisPercentage: 0,
    clausesCount: 7,
    isDefault: false,
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/AM 55.858',
    contentBody: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS E CONSULTORIA — PLANEJAMENTO PREVIDENCIÁRIO

Pelo presente instrumento, regido pela Lei Federal nº 8.906/1994 e artigos 593 e seguintes da Lei Federal nº 10.406/2002:

CONTRATANTE: {{NOME_CLIENTE}}, CPF: {{CPF}}, residente em {{ENDERECO}}, telefone: {{TELEFONE}}.
CONTRATADA: ALEXANDRE PONTES SOCIEDADE DE ADVOGADOS, sob a responsabilidade de {{NOME_ADVOGADO}}, {{OAB_ADVOGADO}}.

CLÁUSULA 1ª — DO OBJETO: Elaboração de Estudo Técnico de Planejamento Previdenciário contendo análise detalhada do CNIS, contagem de tempo de contribuição, projeção de regras de transição e cálculo de Renda Mensal Inicial (RMI) mais vantajosa (Pasta: {{PASTA_FISICA}}).
CLÁUSULA 2ª — DO VALOR E FORMA DE PAGAMENTO: Pela prestação dos serviços de consultoria técnica, o(a) CONTRATANTE pagará {{HONORARIOS}}.
CLÁUSULA 3ª — DO PRAZO DE ENTREGA: O Parecer Técnico Conclusivo será entregue no prazo de 15 (quinze) dias úteis a contar do fornecimento completo da documentação e extratos previdenciários.
CLÁUSULA 4ª — DO ESCOPO: O presente contrato abrange exclusivamente a análise técnica consultiva e simulações, não compreendendo atuação contenciosa em ação judicial.
CLÁUSULA 5ª — DO SIGILO E LGPD: Aplicação estrita das diretrizes da Lei Federal nº 13.709/2018 e do sigilo profissional (art. 35 do Código de Ética da OAB).
CLÁUSULA 6ª — DA FORÇA EXECUTIVA: O presente contrato constitui título executivo extrajudicial (art. 784, III do CPC e art. 24 da Lei 8.906/94).
CLÁUSULA 7ª — DO FORO: Foro do domicílio do(a) CONTRATANTE.

Localidade, {{DATA_EXTENSO}}.`,
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-11-20T15:30:00Z',
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

const TEMPLATES_STORAGE_KEY = 'previoffice_contract_templates';
const CONTRACTS_STORAGE_KEY = 'previoffice_contracts';

class ContractsStore {
  private contracts: Contract[] = [...INITIAL_CONTRACTS];
  private templates: ContractTemplate[] = [...INITIAL_CONTRACT_TEMPLATES];
  private isLoadedFromStorage = false;

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (storedTemplates) {
        const parsed = JSON.parse(storedTemplates);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const storedIds = new Set(parsed.map((t: ContractTemplate) => t.id));
          const missingInitials = INITIAL_CONTRACT_TEMPLATES.filter(
            (init) => !storedIds.has(init.id)
          );
          // If stored templates have old versions of initial templates that lacked the robust legal header,
          // update them to the robust system version unless modified by the user
          const updatedTemplates = parsed.map((storedTpl: ContractTemplate) => {
            const initial = INITIAL_CONTRACT_TEMPLATES.find((i) => i.id === storedTpl.id);
            if (initial && !storedTpl.contentBody.includes('Lei Federal nº 8.906/1994')) {
              return { ...initial, ...storedTpl, contentBody: initial.contentBody };
            }
            return storedTpl;
          });
          this.templates = [...updatedTemplates, ...missingInitials];
        }
      }
      const storedContracts = localStorage.getItem(CONTRACTS_STORAGE_KEY);
      if (storedContracts) {
        const parsed = JSON.parse(storedContracts);
        if (Array.isArray(parsed)) {
          this.contracts = parsed;
        }
      }
      this.isLoadedFromStorage = true;
    } catch (e) {
      console.warn('Could not load contracts/templates from localStorage', e);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(this.templates));
      // Sanitize contracts for localStorage to prevent QuotaExceededError (5MB browser limit)
      const sanitizedContracts = this.contracts.map((c) => ({
        ...c,
        physicalAttachment: c.physicalAttachment
          ? { ...c.physicalAttachment, fileDataUrl: undefined }
          : undefined,
        customContractAttachment: c.customContractAttachment
          ? { ...c.customContractAttachment, fileDataUrl: undefined }
          : undefined,
        customPoaAttachment: c.customPoaAttachment
          ? { ...c.customPoaAttachment, fileDataUrl: undefined }
          : undefined,
        customDocuments: c.customDocuments?.map((d) => ({ ...d, fileDataUrl: undefined })),
      }));
      localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(sanitizedContracts));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  public getContracts(): Contract[] {
    if (!this.isLoadedFromStorage) {
      this.loadFromStorage();
    }
    return [...this.contracts];
  }

  public getTemplates(): ContractTemplate[] {
    if (!this.isLoadedFromStorage) {
      this.loadFromStorage();
    }
    return [...this.templates];
  }

  public getKpis(): ContractKpis {
    if (!this.isLoadedFromStorage) {
      this.loadFromStorage();
    }
    return calculateContractKpis(this.contracts);
  }

  public getContractById(id: string): Contract | undefined {
    if (!this.isLoadedFromStorage) {
      this.loadFromStorage();
    }
    return this.contracts.find((c) => c.id === id);
  }

  public settleInstallment(
    contractId: string,
    installmentId: string,
    paymentMethod: PaymentMethod,
    receiptReference?: string,
    notes?: string
  ): Contract | null {
    if (!this.isLoadedFromStorage) {
      this.loadFromStorage();
    }
    const contractIdx = this.contracts.findIndex((c) => c.id === contractId);
    if (contractIdx === -1) return null;
    const contract = this.contracts[contractIdx];
    if (!contract.feeStructure.installments || contract.feeStructure.installments.length === 0) {
      return null;
    }

    const updatedInstallments = contract.feeStructure.installments.map((inst) =>
      inst.id === installmentId
        ? {
            ...inst,
            status: 'PAID' as const,
            paidAt: new Date().toISOString(),
            paymentMethod,
            receiptReference,
            notes: notes || inst.notes,
          }
        : inst
    );

    const allInstallmentsPaid = updatedInstallments.every((inst) => inst.status === 'PAID');
    const isFixed = contract.feeStructure.feeModel === 'FIXED_INSTALLMENT';

    const updatedContract: Contract = {
      ...contract,
      status: allInstallmentsPaid && isFixed ? 'CONCLUDED' : contract.status,
      concludedAt: allInstallmentsPaid && isFixed ? new Date().toISOString() : contract.concludedAt,
      feeStructure: {
        ...contract.feeStructure,
        isSettled: allInstallmentsPaid ? true : contract.feeStructure.isSettled,
        installments: updatedInstallments,
      },
      updatedAt: new Date().toISOString(),
    };

    this.contracts[contractIdx] = updatedContract;
    this.saveToStorage();
    return { ...updatedContract };
  }

  public attachSignedPhysicalDocument(
    contractId: string,
    attachment: PhysicalDocumentAttachment
  ): Contract | null {
    if (!this.isLoadedFromStorage) {
      this.loadFromStorage();
    }
    const contractIdx = this.contracts.findIndex((c) => c.id === contractId);
    if (contractIdx === -1) return null;
    const contract = this.contracts[contractIdx];

    const isSigned = attachment.isSigned !== false;
    const shouldActivate = isSigned && (contract.status === 'PENDING_SIGNATURE' || contract.status === 'DRAFT');

    const updatedContract: Contract = {
      ...contract,
      physicalAttachment: attachment,
      customContractAttachment:
        attachment.documentCategory === 'FEE_CONTRACT' ? attachment : contract.customContractAttachment,
      customPoaAttachment:
        attachment.documentCategory === 'POWER_OF_ATTORNEY' ? attachment : contract.customPoaAttachment,
      customDocuments: [
        ...(contract.customDocuments || []).filter((d) => d.id !== attachment.id),
        attachment,
      ],
      physicalFileLocation: attachment.physicalCabinetLocation || contract.physicalFileLocation,
      physicalSignedStatus: isSigned ? 'ATTACHED' : 'PENDING',
      status: shouldActivate ? 'ACTIVE' : contract.status,
      signedAt: isSigned ? (attachment.uploadedAt || new Date().toISOString()) : contract.signedAt,
      isCustomEdited: true,
      customEditedBy: attachment.uploadedBy,
      customEditedAt: attachment.uploadedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.contracts[contractIdx] = updatedContract;
    this.saveToStorage();
    return { ...updatedContract };
  }

  public updateTemplate(updated: ContractTemplate): ContractTemplate | null {
    if (!this.isLoadedFromStorage) {
      this.loadFromStorage();
    }
    const idx = this.templates.findIndex((t) => t.id === updated.id);
    if (idx === -1) return null;
    const tpl: ContractTemplate = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    this.templates[idx] = tpl;
    this.saveToStorage();
    return tpl;
  }

  public addTemplate(template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>): ContractTemplate {
    if (!this.isLoadedFromStorage) {
      this.loadFromStorage();
    }
    const newTpl: ContractTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.templates = [newTpl, ...this.templates];
    this.saveToStorage();
    return newTpl;
  }

  public createContract(newContract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Contract {
    if (!this.isLoadedFromStorage) {
      this.loadFromStorage();
    }
    const created: Contract = {
      ...newContract,
      id: `ctr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.contracts = [created, ...this.contracts];
    this.saveToStorage();
    return created;
  }
}

export const contractsStore = new ContractsStore();
