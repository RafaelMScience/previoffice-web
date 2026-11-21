import { createClient } from '../supabase/client.ts';
import { encryptData, decryptData, isEncrypted } from '../security/encryption.ts';
import { dedupeRequest, invalidateCache } from '../cache/request-cache.ts';
import { sanitizePagination } from '../utils/pagination.ts';
import type { Client, ClientStatus, MaritalStatus, SpecialCategory } from '../../types/client.ts';
import type { Attendance, AttendanceType, AttendanceWithClient, PendingPhysicalDocument } from '../../types/attendance.ts';
import type { ClientFullRegistrationInput } from '../schemas/client-schema.ts';
import type { FastIntakeData } from '../../components/reception/fast-intake-modal.tsx';

/**
 * Service handling Client & Attendance operations directly with Supabase.
 * Enforces multi-tenancy and Supabase Postgres best practices.
 */

export async function fetchClientsFromDb(
  tenantId: string,
  pagination?: { page?: number; limit?: number }
): Promise<Client[]> {
  const { page, limit, from, to } = sanitizePagination(
    pagination?.page,
    pagination?.limit,
    50,
    100
  );

  return dedupeRequest(`clients:list:${tenantId}:${page}:${limit}`, async () => {
    const supabase = createClient();

    const { data, error } = await (supabase.from('clients') as any)
      .select('*, attendances(id, pending_documents, attended_at)')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching clients from Supabase:', error);
      throw error;
    }

    if (!data) return [];

    return (data as any[]).map(mapDbRowToClient);
  }, { ttlMs: 10000 });
}

function mapAttendanceRow(row: any): Attendance {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    clientId: row.client_id,
    attendanceType: (row.attendance_type as AttendanceType) || 'OTHER',
    attendedAt: row.attended_at,
    objective: row.objective || '',
    narrativeHistory: row.narrative_history || undefined,
    initialIntakeNotes: row.initial_intake_notes || undefined,
    notes: row.notes || undefined,
    attendantName: row.attendant_name || undefined,
    attendantUserId: row.attendant_user_id || undefined,
    pendingDocuments: row.pending_documents || [],
    physicalFileLocation: row.physical_file_location || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchClientByIdFromDb(
  clientId: string,
  tenantId: string
): Promise<{ client: Client | null; attendances: Attendance[]; documents: any[] }> {
  return dedupeRequest(`clients:dossier:${tenantId}:${clientId}`, async () => {
    const supabase = createClient();

    // 1. Single consolidated query with embedded relations (eliminates N+1 round trips)
    const { data: clientRow, error: clientError } = await (supabase.from('clients') as any)
      .select('*, attendances(*), documents(*)')
      .eq('id', clientId)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .maybeSingle();

    if (clientError || !clientRow) {
      // Graceful fallback to parallel batch fetch if schema lacks embedded relationships in mock or custom views
      const [cRes, aRes, dRes] = await Promise.all([
        (supabase.from('clients') as any)
          .select('*')
          .eq('id', clientId)
          .eq('tenant_id', tenantId)
          .is('deleted_at', null)
          .maybeSingle(),
        (supabase.from('attendances') as any)
          .select('*')
          .eq('client_id', clientId)
          .eq('tenant_id', tenantId)
          .order('attended_at', { ascending: false }),
        (supabase.from('documents') as any)
          .select('*')
          .eq('client_id', clientId)
          .eq('tenant_id', tenantId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false }),
      ]);

      if (!cRes.data) {
        return { client: null, attendances: [], documents: [] };
      }

      const client = mapDbRowToClient(cRes.data);
      const attendances = (aRes.data || []).map(mapAttendanceRow);
      return { client, attendances, documents: dRes.data || [] };
    }

    const client = mapDbRowToClient(clientRow);
    const attendances = (clientRow.attendances || [])
      .map(mapAttendanceRow)
      .sort((a: Attendance, b: Attendance) => new Date(b.attendedAt).getTime() - new Date(a.attendedAt).getTime());
    const documents = (clientRow.documents || [])
      .filter((d: any) => !d.deleted_at)
      .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return { client, attendances, documents };
  }, { ttlMs: 10000 });
}

/**
 * Batch-fetches attendances for a list of client IDs in a single query (eliminates N+1 queries).
 */
export async function fetchBatchAttendancesByClientIds(
  clientIds: string[],
  tenantId: string
): Promise<Map<string, Attendance[]>> {
  const result = new Map<string, Attendance[]>();
  if (!clientIds.length) return result;

  const supabase = createClient();
  const { data, error } = await (supabase.from('attendances') as any)
    .select('*')
    .in('client_id', clientIds)
    .eq('tenant_id', tenantId)
    .order('attended_at', { ascending: false });

  if (error || !data) {
    console.warn('fetchBatchAttendancesByClientIds warning:', error);
    return result;
  }

  for (const row of data as any[]) {
    const att = mapAttendanceRow(row);
    const existing = result.get(att.clientId) || [];
    existing.push(att);
    result.set(att.clientId, existing);
  }

  return result;
}

/**
 * Batch-fetches documents for a list of client IDs in a single query (eliminates N+1 queries).
 */
export async function fetchBatchDocumentsByClientIds(
  clientIds: string[],
  tenantId: string
): Promise<Map<string, any[]>> {
  const result = new Map<string, any[]>();
  if (!clientIds.length) return result;

  const supabase = createClient();
  const { data, error } = await (supabase.from('documents') as any)
    .select('*')
    .in('client_id', clientIds)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('fetchBatchDocumentsByClientIds warning:', error);
    return result;
  }

  for (const row of data as any[]) {
    const existing = result.get(row.client_id) || [];
    existing.push(row);
    result.set(row.client_id, existing);
  }

  return result;
}

export async function createFastIntakeInDb(
  data: FastIntakeData,
  tenantId: string,
  attendant: { id: string; name: string }
): Promise<Client> {
  const supabase = createClient();
  const cleanCpf = data.cpf?.replace(/\D/g, '') || null;
  const normalizedName = data.fullName.toLowerCase().trim();

  // 1. Pre-flight Check: CPF Uniqueness within Tenant
  if (cleanCpf) {
    const { data: existingClient } = await (supabase.from('clients') as any)
      .select('id, full_name')
      .eq('tenant_id', tenantId)
      .eq('normalized_cpf', cleanCpf)
      .is('deleted_at', null)
      .maybeSingle();

    if (existingClient) {
      throw new Error(
        `Já existe um cliente cadastrado com este CPF neste escritório (${existingClient.full_name}).`
      );
    }
  }

  const assignedName = data.assignedLawyerName || attendant.name;
  const intakeNotes =
    data.registeredBy && data.registeredBy !== assignedName
      ? `${data.notes || 'Entrada rápida de recepção.'} (Cadastrado por: ${data.registeredBy})`
      : data.notes || 'Entrada rápida de recepção.';

  // 2. Insert Client
  const { data: clientRow, error: clientErr } = await (supabase.from('clients') as any)
    .insert({
      tenant_id: tenantId,
      full_name: data.fullName.trim(),
      normalized_name: normalizedName,
      cpf: data.cpf || null,
      normalized_cpf: cleanCpf,
      mobile_phone: data.phone.trim(),
      benefit_type: data.benefit,
      notes: intakeNotes,
      status: 'PROSPECT',
      active: true,
      visit_count: 1,
      last_visit_at: new Date().toISOString(),
      last_attendant_name: assignedName,
    })
    .select()
    .single();

  if (clientErr || !clientRow) {
    if (
      clientErr?.code === '23505' ||
      clientErr?.message?.includes('idx_clients_unique_cpf_per_tenant') ||
      clientErr?.message?.includes('duplicate key')
    ) {
      throw new Error('Já existe um cliente cadastrado com este CPF neste escritório.');
    }
    throw new Error('Falha ao cadastrar cliente no banco de dados. Tente novamente.');
  }

  // 2. Insert Initial Attendance
  const pendingDocs =
    data.pendingDocuments && data.pendingDocuments.length > 0
      ? data.pendingDocuments
      : [];

  const nowIso = new Date().toISOString();

  await (supabase.from('attendances') as any).insert({
    tenant_id: tenantId,
    client_id: clientRow.id,
    attendance_type: 'FIRST_VISIT',
    objective: data.benefit || 'Triagem Inicial',
    notes: intakeNotes,
    attendant_name: assignedName,
    attendant_user_id: attendant.id,
    attended_at: nowIso,
    pending_documents: pendingDocs,
  });

  invalidateCache('clients:');
  invalidateCache('nav-counts:');

  return mapDbRowToClient({
    ...clientRow,
    attendances: [
      {
        attended_at: nowIso,
        pending_documents: pendingDocs,
      },
    ],
  });
}

export async function uploadClientPhotoToStorage(
  file: File,
  tenantId: string
): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${tenantId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('client-photos')
    .upload(fileName, file, {
      cacheControl: '31536000',
      contentType: file.type || 'image/webp',
      upsert: true,
    });

  if (error || !data) {
    throw new Error(error?.message || 'Erro ao fazer upload da foto.');
  }

  const { data: publicUrlData } = supabase.storage
    .from('client-photos')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

export async function createFullClientInDb(
  input: ClientFullRegistrationInput,
  tenantId: string,
  attendant: { id: string; name: string },
  photoUrl?: string | null,
  existingClientId?: string
): Promise<Client> {
  const supabase = createClient();
  const cleanCpf = input.cpf?.replace(/\D/g, '') || null;
  const normalizedName = input.fullName.toLowerCase().trim();

  // 1. Pre-flight Check: CPF Uniqueness within Tenant (ignoring current client if updating)
  if (cleanCpf) {
    let query = (supabase.from('clients') as any)
      .select('id, full_name')
      .eq('tenant_id', tenantId)
      .eq('normalized_cpf', cleanCpf)
      .is('deleted_at', null);

    if (existingClientId) {
      query = query.neq('id', existingClientId);
    }

    const { data: existingClient } = await query.maybeSingle();

    if (existingClient) {
      throw new Error(
        `Já existe um cliente cadastrado com este CPF neste escritório (${existingClient.full_name}).`
      );
    }
  }

  const clientPayload: Record<string, any> = {
    tenant_id: tenantId,
    full_name: input.fullName.trim(),
    normalized_name: normalizedName,
    cpf: input.cpf || null,
    normalized_cpf: cleanCpf,
    rg: input.rg || null,
    birth_date: input.birthDate || null,
    marital_status: input.maritalStatus,
    profession: input.profession || null,
    nationality: input.nationality || 'Brasileira',
    mother_name: input.motherName || null,
    father_name: input.fatherName || null,
    postal_code: input.postalCode || null,
    street: input.street || null,
    street_number: input.streetNumber || null,
    complement: input.complement || null,
    neighborhood: input.neighborhood || null,
    city: input.city || null,
    state: input.state || null,
    mobile_phone: input.mobilePhone,
    phone: input.phone || null,
    email: input.email || null,
    benefit_type: input.benefitType,
    has_active_benefit: input.hasActiveBenefit ?? false,
    benefit_number: input.benefitNumber || null,
    special_categories: input.specialCategories,
    encrypted_inss_password: input.inssPassword
      ? isEncrypted(input.inssPassword.trim())
        ? input.inssPassword.trim()
        : encryptData(input.inssPassword.trim())
      : null,
    photo_reference: photoUrl !== undefined ? photoUrl : (input.photoReference ?? null),
    notes: input.notes || null,
    last_visit_at: new Date().toISOString(),
    last_attendant_name: attendant.name,
    updated_at: new Date().toISOString(),
  };

  if (!existingClientId) {
    clientPayload.status = 'PROSPECT';
    clientPayload.active = true;
    clientPayload.visit_count = 1;
  }

  let clientRow: any = null;

  if (existingClientId) {
    // Update existing fast-intake prospect into complete profile
    const { data, error: updateErr } = await (supabase.from('clients') as any)
      .update(clientPayload)
      .eq('id', existingClientId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (updateErr || !data) {
      throw new Error('Falha ao atualizar cadastro do cliente no banco de dados.');
    }
    clientRow = data;
  } else {
    // Insert new client
    const { data, error: clientErr } = await (supabase.from('clients') as any)
      .insert({
        ...clientPayload,
        visit_count: 1,
      })
      .select()
      .single();

    if (clientErr || !data) {
      if (
        clientErr?.code === '23505' ||
        clientErr?.message?.includes('idx_clients_unique_cpf_per_tenant') ||
        clientErr?.message?.includes('duplicate key')
      ) {
        throw new Error('Já existe um cliente cadastrado com este CPF neste escritório.');
      }
      throw new Error('Falha ao cadastrar ficha completa do cliente no banco de dados.');
    }
    clientRow = data;
  }

  // 2. Insert Initial Attendance (only on new client creation)
  if (!existingClientId) {
    await (supabase.from('attendances') as any).insert({
      tenant_id: tenantId,
      client_id: clientRow.id,
      attendance_type: 'FIRST_CONSULTATION',
      objective: input.benefitType,
      notes: input.notes || 'Atendimento com qualificação cadastral completa.',
      attendant_name: attendant.name,
      attendant_user_id: attendant.id,
      attended_at: new Date().toISOString(),
      physical_file_location: input.physicalFileLocation || null,
    });
  }

  invalidateCache('clients:');
  invalidateCache('nav-counts:');

  return mapDbRowToClient(clientRow);
}

export async function updateAttendancePendingDocumentsInDb(
  attendanceId: string,
  pendingDocuments: PendingPhysicalDocument[]
): Promise<void> {
  const supabase = createClient();
  const { error } = await (supabase.from('attendances') as any)
    .update({
      pending_documents: pendingDocuments,
      updated_at: new Date().toISOString(),
    })
    .eq('id', attendanceId);

  if (error) {
    console.error('Error updating pending documents in attendance:', error);
    throw new Error('Falha ao atualizar status dos documentos pendentes no banco de dados.');
  }

  invalidateCache('clients:');
  invalidateCache('attendances:');
}

export async function inactivateClientInDb(
  clientId: string,
  tenantId: string,
  reason: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await (supabase.from('clients') as any)
    .update({
      active: false,
      status: 'INACTIVE',
      inactivation_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', clientId)
    .eq('tenant_id', tenantId);

  if (error) {
    throw new Error(error.message);
  }

  invalidateCache('clients:');
  invalidateCache('nav-counts:');
}

export async function fetchAttendancesFromDb(
  tenantId: string,
  pagination?: { page?: number; limit?: number }
): Promise<AttendanceWithClient[]> {
  const { page, limit, from, to } = sanitizePagination(
    pagination?.page,
    pagination?.limit,
    50,
    100
  );

  return dedupeRequest(`attendances:list:${tenantId}:${page}:${limit}`, async () => {
    const supabase = createClient();
    const { data, error } = await (supabase.from('attendances') as any)
      .select('*, client:clients(id, full_name, cpf, phone, mobile_phone, benefit_type)')
      .eq('tenant_id', tenantId)
      .order('attended_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching attendances from Supabase:', error);
      throw error;
    }

    if (!data) return [];

    return (data as any[]).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      clientId: row.client_id,
      clientName: row.client?.full_name || 'Cliente',
      clientCpf: row.client?.cpf || '',
      clientPhone: row.client?.mobile_phone || row.client?.phone || '',
      clientBenefitType: row.client?.benefit_type,
      attendanceType: (row.attendance_type as AttendanceType) || 'OTHER',
      attendedAt: row.attended_at,
      objective: row.objective || '',
      narrativeHistory: row.narrative_history || undefined,
      initialIntakeNotes: row.initial_intake_notes || undefined,
      notes: row.notes || undefined,
      attendantName: row.attendant_name || undefined,
      attendantUserId: row.attendant_user_id || undefined,
      pendingDocuments: row.pending_documents || [],
      physicalFileLocation: row.physical_file_location || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }, { ttlMs: 10000 });
}

export async function createAttendanceInDb(
  tenantId: string,
  input: {
    clientId: string;
    attendanceType: AttendanceType;
    objective: string;
    narrativeHistory?: string;
    notes?: string;
    attendantName: string;
    attendantUserId?: string;
    pendingDocuments: PendingPhysicalDocument[];
    physicalFileLocation?: string;
  }
): Promise<AttendanceWithClient> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: row, error } = await (supabase.from('attendances') as any)
    .insert({
      tenant_id: tenantId,
      client_id: input.clientId,
      attendance_type: input.attendanceType,
      objective: input.objective,
      narrative_history: input.narrativeHistory || null,
      notes: input.notes || null,
      attendant_name: input.attendantName,
      attendant_user_id: input.attendantUserId || null,
      pending_documents: input.pendingDocuments,
      physical_file_location: input.physicalFileLocation || null,
      attended_at: now,
    })
    .select('*, client:clients(id, full_name, cpf, phone, mobile_phone, benefit_type)')
    .single();

  if (error || !row) {
    throw new Error(error?.message || 'Falha ao registrar atendimento.');
  }

  // Count total attendances for this client to accurately update visit_count
  const { count: attendanceCount } = await (supabase.from('attendances') as any)
    .select('*', { count: 'exact', head: true })
    .eq('client_id', input.clientId)
    .eq('tenant_id', tenantId);

  // Update client visit count and last visit
  await (supabase.from('clients') as any)
    .update({
      visit_count: Math.max(1, attendanceCount || 1),
      last_visit_at: now,
      last_attendant_name: input.attendantName,
      updated_at: now,
    })
    .eq('id', input.clientId)
    .eq('tenant_id', tenantId);

  invalidateCache('clients:');
  invalidateCache('attendances:');
  invalidateCache('nav-counts:');

  return {
    id: row.id,
    tenantId: row.tenant_id,
    clientId: row.client_id,
    clientName: row.client?.full_name || 'Cliente',
    clientCpf: row.client?.cpf || '',
    clientPhone: row.client?.mobile_phone || row.client?.phone || '',
    clientBenefitType: row.client?.benefit_type,
    attendanceType: row.attendance_type,
    attendedAt: row.attended_at,
    objective: row.objective,
    narrativeHistory: row.narrative_history || undefined,
    initialIntakeNotes: row.initial_intake_notes || undefined,
    notes: row.notes || undefined,
    attendantName: row.attendant_name || undefined,
    attendantUserId: row.attendant_user_id || undefined,
    pendingDocuments: row.pending_documents || [],
    physicalFileLocation: row.physical_file_location || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDbRowToClient(row: any): Client {
  let pendingDocuments: string[] | undefined = undefined;
  if (Array.isArray(row.attendances) && row.attendances.length > 0) {
    const sorted = [...row.attendances].sort(
      (a: any, b: any) =>
        new Date(b.attended_at || 0).getTime() - new Date(a.attended_at || 0).getTime()
    );
    const latest = sorted[0];
    if (Array.isArray(latest?.pending_documents)) {
      pendingDocuments = latest.pending_documents
        .filter((d: any) => !d.isDelivered)
        .map((d: any) => d.description);
    }
  }

  return {
    id: row.id,
    tenantId: row.tenant_id,
    fullName: row.full_name,
    normalizedName: row.normalized_name,
    cpf: row.cpf || undefined,
    normalizedCpf: row.normalized_cpf || undefined,
    rg: row.rg || undefined,
    birthDate: row.birth_date || undefined,
    maritalStatus: (row.marital_status as MaritalStatus) || undefined,
    profession: row.profession || undefined,
    nationality: row.nationality || 'Brasileira',
    placeOfBirth: row.place_of_birth || undefined,
    motherName: row.mother_name || undefined,
    fatherName: row.father_name || undefined,
    postalCode: row.postal_code || undefined,
    normalizedPostalCode: row.postal_code?.replace(/\D/g, '') || undefined,
    street: row.street || undefined,
    streetNumber: row.street_number || undefined,
    complement: row.complement || undefined,
    neighborhood: row.neighborhood || undefined,
    city: row.city || undefined,
    state: row.state || undefined,
    phone: row.phone || undefined,
    mobilePhone: row.mobile_phone || undefined,
    email: row.email || undefined,
    monthlyIncome: row.monthly_income ? Number(row.monthly_income) : undefined,
    dependentCount: row.dependent_count ?? 0,
    hasActiveBenefit: row.has_active_benefit ?? false,
    benefitType: row.benefit_type || undefined,
    benefitNumber: row.benefit_number || undefined,
    recentContributionsSummary: row.recent_contributions_summary || undefined,
    specialCategories: (row.special_categories as SpecialCategory[]) || [],
    encryptedInssPassword: row.encrypted_inss_password
      ? decryptData(row.encrypted_inss_password)
      : undefined,
    inssPassword: row.encrypted_inss_password
      ? decryptData(row.encrypted_inss_password)
      : undefined,
    photoReference: row.photo_reference || undefined,
    notes: row.notes || undefined,
    pendingDocuments,
    visitCount: row.visit_count ?? 1,
    lastVisitAt: row.last_visit_at || undefined,
    lastAttendantName: row.last_attendant_name || undefined,
    status: (row.status as ClientStatus) || 'PROSPECT',
    active: row.active ?? true,
    inactivationReason: row.inactivation_reason || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || undefined,
  };
}
