import React from 'react';
import { ClientDetailsView } from '@/components/client-details/client-details-view';
import type { Client } from '@/types/client';
import type { Attendance } from '@/types/attendance';

interface ClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

const MOCK_CLIENT: Client = {
  id: 'c-8902',
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
  recentContributionsSummary: 'Atividade rural em regime de economia familiar de 1985 até a presente data.',
  specialCategories: ['RURAL'],
  notes: 'Cliente trouxe ITR 2023, aguardando declaração de sindicato rural e certidão INCRA.',
  visitCount: 3,
  lastVisitAt: '2026-11-14T10:30:00.000Z',
  lastAttendantName: 'Dr. Alexandre Pontes',
  status: 'PENDING',
  active: true,
  createdAt: '2026-10-15T09:00:00.000Z',
  updatedAt: '2026-11-14T10:30:00.000Z',
};

const MOCK_ATTENDANCES: Attendance[] = [
  {
    id: 'att-3',
    tenantId: 'tenant-default',
    clientId: 'c-8902',
    attendanceType: 'RETURN_DOCUMENTS',
    attendedAt: '2026-11-14T10:30:00.000Z',
    objective: 'Aposentadoria Rural - Entrega de ITR e Certidão INCRA',
    narrativeHistory:
      'Dona Maria compareceu ao escritório acompanhada de sua filha, trazendo o ITR de 2022 e 2023, além do comprovante de cadastro no INCRA do Sítio Riacho do Meio.\nInformou que conseguiu localizar também a certidão de casamento de 1991 onde o marido consta qualificado como lavrador.',
    notes:
      'Instrução probatória quase completa. Falta apenas o extrato CNIS sem vínculos urbanos concomitantes para assinar o requerimento administrativo.',
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
    clientId: 'c-8902',
    attendanceType: 'RETURN',
    attendedAt: '2026-10-28T14:15:00.000Z',
    objective: 'Aposentadoria Rural - Conferência de Documentos e Senha Meu INSS',
    narrativeHistory:
      'Realizada conferência da senha do Meu INSS. Acesso restabelecido com sucesso. Baixado extrato previdenciário CNIS para verificar se havia pendências de vínculos urbanos extemporâneos.',
    notes:
      'Orientada a buscar no cartório certidão de nascimento dos filhos mais velhos e histórico escolar da infância na zona rural.',
    attendantName: 'Dra. Camila Vasconcelos',
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
    clientId: 'c-8902',
    attendanceType: 'FIRST_CONSULTATION',
    attendedAt: '2026-10-15T09:00:00.000Z',
    objective: '1ª Consulta - Orientação sobre Aposentadoria Rural por Idade (55 anos Mulher)',
    narrativeHistory:
      'Primeira ida ao escritório por indicação de vizinho. Dona Maria completou 56 anos e deseja saber se já pode se aposentar pelo trabalho na roça.\nRelatou que trabalhou desde os 12 anos na agricultura com a família.',
    notes:
      'Atingiu o requisito etário (56 anos completos > 55 anos). Diagnosticada alta probabilidade de êxito na aposentadoria rural como segurada especial. Entregue checklist de documentos necessários.',
    attendantName: 'Dr. Alexandre Pontes',
    pendingDocuments: [
      { id: 'p-6', description: 'RG e CPF', isDelivered: true },
      { id: 'p-7', description: 'Comprovante de residência no meio rural', isDelivered: true },
    ],
    physicalFileLocation: 'Armário B - Gaveta 03 - Pasta 2026-042',
    createdAt: '2026-10-15T09:00:00.000Z',
    updatedAt: '2026-10-15T09:00:00.000Z',
  },
];

export default async function ClientDetailPage({ params }: ClientPageProps) {
  const { id } = await params;

  const clientWithId: Client = {
    ...MOCK_CLIENT,
    id,
  };

  return (
    <div className="py-2">
      <ClientDetailsView
        initialClient={clientWithId}
        initialAttendances={MOCK_ATTENDANCES}
      />
    </div>
  );
}
