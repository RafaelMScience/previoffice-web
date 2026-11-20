import type { Client } from '@/types/client';
import type { Attendance, AttendanceWithClient } from '@/types/attendance';
import type { CaseUpdate } from '@/types/case-update';

export interface ClientProfileBundle {
  client: Client;
  attendances: Attendance[];
  caseUpdates: CaseUpdate[];
}

export const MOCK_CLIENTS_MAP: Record<string, ClientProfileBundle> = {};

export function createFastIntakeClient(
  fullName: string,
  cpf: string,
  phone: string,
  benefitType: string,
  notes?: string
): ClientProfileBundle {
  const id = `cli-${Date.now()}`;
  const now = new Date().toISOString();

  const newClient: Client = {
    id,
    tenantId: 'tenant-default',
    fullName: fullName.trim(),
    normalizedName: fullName.trim().toLowerCase(),
    cpf,
    normalizedCpf: cpf.replace(/\D/g, ''),
    mobilePhone: phone,
    benefitType,
    visitCount: 1,
    lastVisitAt: now,
    status: 'PROSPECT',
    active: true,
    notes: notes || undefined,
    createdAt: now,
    updatedAt: now,
  };

  const initialAttendance: Attendance = {
    id: `att-${Date.now()}`,
    tenantId: 'tenant-default',
    clientId: id,
    attendanceType: 'FIRST_CONSULTATION',
    attendedAt: now,
    objective: benefitType || 'Triagem Inicial',
    notes: notes || undefined,
    createdAt: now,
    updatedAt: now,
  };

  const bundle: ClientProfileBundle = {
    client: newClient,
    attendances: [initialAttendance],
    caseUpdates: [],
  };

  MOCK_CLIENTS_MAP[id] = bundle;
  return bundle;
}

export function getClientProfile(id: string): ClientProfileBundle {
  if (MOCK_CLIENTS_MAP[id]) {
    return MOCK_CLIENTS_MAP[id];
  }

  const fallbackClient: Client = {
    id,
    tenantId: 'tenant-default',
    fullName: 'Cliente não encontrado',
    normalizedName: 'cliente nao encontrado',
    cpf: '',
    visitCount: 0,
    status: 'PROSPECT',
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    client: fallbackClient,
    attendances: [],
    caseUpdates: [],
  };
}

export { type AttendanceWithClient };

export function getAllAttendancesWithClient(): AttendanceWithClient[] {
  const list: AttendanceWithClient[] = [];
  const processedClientIds = new Set<string>();

  for (const bundle of Object.values(MOCK_CLIENTS_MAP)) {
    if (processedClientIds.has(bundle.client.id)) continue;
    processedClientIds.add(bundle.client.id);

    for (const att of bundle.attendances) {
      list.push({
        ...att,
        clientName: bundle.client.fullName,
        clientCpf: bundle.client.cpf || '',
        clientPhone: bundle.client.mobilePhone || bundle.client.phone,
        clientBenefitType: bundle.client.benefitType,
      });
    }
  }

  return list.sort((a, b) => new Date(b.attendedAt).getTime() - new Date(a.attendedAt).getTime());
}
