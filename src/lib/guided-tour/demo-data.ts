import type { Client } from '@/types/client';
import type { Attendance } from '@/types/attendance';
import type { Contract } from '@/types/contract';

/**
 * Fictitious Demo Data used EXCLUSIVELY during the Guided Tour sandbox.
 * Never saved to the Supabase database. Destroyed immediately when the tour ends.
 */
export const DEMO_CLIENT: Client = {
  id: 'demo-client-tour-001',
  tenantId: 'demo-tenant',
  fullName: 'Maria Francisca da Silva (Exemplo Guiado)',
  normalizedName: 'maria francisca da silva',
  cpf: '123.456.789-00',
  normalizedCpf: '12345678900',
  rg: '9876543-2 SSP/AM',
  birthDate: '1962-05-14',
  maritalStatus: 'MARRIED',
  profession: 'Agricultora Familiar / Segurada Especial',
  nationality: 'Brasileira',
  postalCode: '69000-000',
  street: 'Estrada Rural do Tarumã',
  streetNumber: 'KM 12',
  neighborhood: 'Zona Rural',
  city: 'Manaus',
  state: 'AM',
  phone: '(92) 3211-0000',
  mobilePhone: '(92) 99123-4567',
  email: 'maria.francisca.exemplo@previoffice.demo',
  benefitType: 'Aposentadoria por Idade Rural',
  status: 'PROSPECT',
  active: true,
  visitCount: 2,
  lastVisitAt: new Date().toISOString(),
  lastAttendantName: 'Atendente PreviOffice',
  createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEMO_ATTENDANCES: Attendance[] = [
  {
    id: 'demo-att-001',
    tenantId: 'demo-tenant',
    clientId: 'demo-client-tour-001',
    attendanceType: 'FIRST_VISIT',
    objective: 'Aposentadoria por Idade Rural',
    notes: 'Segurada especial rural. Apresentou certidão de casamento e bloco de notas do produtor rural.',
    attendantName: 'Atendente PreviOffice',
    attendedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    physicalFileLocation: 'Armário A - Gaveta 02 - Pasta 2026-001',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    pendingDocuments: [
      {
        id: 'pdoc-1',
        description: 'Certidão de Casamento de Inteiro Teor',
        isDelivered: true,
        deliveredAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
      {
        id: 'pdoc-2',
        description: 'Autodeclaração de Atividade Rural assinada',
        isDelivered: false,
      },
    ],
  },
  {
    id: 'demo-att-002',
    tenantId: 'demo-tenant',
    clientId: 'demo-client-tour-001',
    attendanceType: 'RETURN_DOCUMENTS',
    objective: 'Retorno para entrega da Autodeclaração Rural',
    notes: 'Segurada retornou trazendo documento assinado pelo sindicato rural.',
    attendantName: 'Dr. Advogado Titular',
    attendedAt: new Date().toISOString(),
    physicalFileLocation: 'Armário A - Gaveta 02 - Pasta 2026-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEMO_CONTRACT: Partial<Contract> = {
  id: 'demo-ctr-001',
  contractNumber: 'CTR-2026-DEMO',
  clientName: 'Maria Francisca da Silva (Exemplo Guiado)',
  clientCpf: '123.456.789-00',
  benefitSpecies: 'Aposentadoria por Idade Rural',
  templateTitle: 'Contrato de Honorários Advocatícios & Procuração Previdenciária',
  status: 'PENDING_SIGNATURE',
  feeStructure: {
    feeModel: 'QUOTA_LITIS',
    quotaLitisPercentage: 30,
    estimatedRetroactiveAmount: 36000,
    estimatedSuccessFeeAmount: 10800,
    installments: [],
  },
};
