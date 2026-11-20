import { createClient } from '@/lib/supabase/client';
import type { Client, ClientStatus, MaritalStatus, SpecialCategory } from '@/types/client';
import type { Attendance, AttendanceType } from '@/types/attendance';
import type { ClientFullRegistrationInput } from '@/lib/schemas/client-schema';
import type { FastIntakeData } from '@/components/reception/fast-intake-modal';

/**
 * Service handling Client & Attendance operations directly with Supabase.
 * Enforces multi-tenancy and Supabase Postgres best practices.
 */

export async function fetchClientsFromDb(tenantId: string): Promise<Client[]> {
  const supabase = createClient();

  const { data, error } = await (supabase.from('clients') as any)
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error fetching clients from Supabase:', error);
    return [];
  }

  return (data as any[]).map(mapDbRowToClient);
}

export async function fetchClientByIdFromDb(
  clientId: string,
  tenantId: string
): Promise<{ client: Client | null; attendances: Attendance[]; documents: any[] }> {
  const supabase = createClient();

  // 1. Fetch Client
  const { data: clientRow, error: clientError } = await (supabase.from('clients') as any)
    .select('*')
    .eq('id', clientId)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .maybeSingle();

  if (clientError || !clientRow) {
    return { client: null, attendances: [], documents: [] };
  }

  // 2. Fetch Attendances
  const { data: attendanceRows } = await (supabase.from('attendances') as any)
    .select('*')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)
    .order('attended_at', { ascending: false });

  // 3. Fetch Documents
  const { data: docRows } = await (supabase.from('documents') as any)
    .select('*')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const client = mapDbRowToClient(clientRow);
  const attendances: Attendance[] = (attendanceRows || []).map((row: any) => ({
    id: row.id,
    tenantId: row.tenant_id,
    clientId: row.client_id,
    attendanceType: (row.attendance_type as AttendanceType) || 'OTHER',
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
  }));

  return { client, attendances, documents: docRows || [] };
}

export async function createFastIntakeInDb(
  data: FastIntakeData,
  tenantId: string,
  attendant: { id: string; name: string }
): Promise<Client> {
  const supabase = createClient();
  const cleanCpf = data.cpf ? data.cpf.replace(/\D/g, '') : null;
  const normalizedName = data.fullName.toLowerCase().trim();

  // 1. Insert Client
  const { data: clientRow, error: clientErr } = await (supabase.from('clients') as any)
    .insert({
      tenant_id: tenantId,
      full_name: data.fullName.trim(),
      normalized_name: normalizedName,
      cpf: data.cpf || null,
      normalized_cpf: cleanCpf,
      mobile_phone: data.phone.trim(),
      benefit_type: data.benefit,
      notes: data.notes || 'Entrada rápida de recepção.',
      status: 'PROSPECT',
      active: true,
      visit_count: 1,
      last_visit_at: new Date().toISOString(),
      last_attendant_name: attendant.name,
    })
    .select()
    .single();

  if (clientErr || !clientRow) {
    throw new Error(clientErr?.message || 'Falha ao salvar cliente no banco.');
  }

  // 2. Insert Initial Attendance
  await (supabase.from('attendances') as any).insert({
    tenant_id: tenantId,
    client_id: clientRow.id,
    attendance_type: 'FIRST_VISIT',
    objective: data.benefit || 'Triagem Inicial',
    notes: data.notes || 'Entrada rápida registrada na recepção.',
    attendant_name: attendant.name,
    attendant_user_id: attendant.id,
    attended_at: new Date().toISOString(),
    pending_documents: [{ id: 'doc-1', description: 'Documentos Pessoais e CNIS', isDelivered: false }],
  });

  return mapDbRowToClient(clientRow);
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
      cacheControl: '3600',
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
  photoUrl?: string
): Promise<Client> {
  const supabase = createClient();
  const cleanCpf = input.cpf ? input.cpf.replace(/\D/g, '') : null;
  const normalizedName = input.fullName.toLowerCase().trim();

  // 1. Insert Client with 32 fields
  const { data: clientRow, error: clientErr } = await (supabase.from('clients') as any)
    .insert({
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
      encrypted_inss_password: input.inssPassword || null,
      photo_reference: photoUrl || null,
      notes: input.notes || null,
      status: 'PROSPECT',
      active: true,
      visit_count: 1,
      last_visit_at: new Date().toISOString(),
      last_attendant_name: attendant.name,
    })
    .select()
    .single();

  if (clientErr || !clientRow) {
    throw new Error(clientErr?.message || 'Falha ao registrar cliente completo no banco.');
  }

  // 2. Insert Initial Attendance
  await (supabase.from('attendances') as any).insert({
    tenant_id: tenantId,
    client_id: clientRow.id,
    attendance_type: 'FIRST_CONSULTATION',
    objective: input.benefitType,
    notes: input.notes || 'Atendimento inicial com ficha cadastral completa.',
    attendant_name: attendant.name,
    attendant_user_id: attendant.id,
    attended_at: new Date().toISOString(),
    physical_file_location: input.physicalFileLocation || null,
  });

  return mapDbRowToClient(clientRow);
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
}

function mapDbRowToClient(row: any): Client {
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
    encryptedInssPassword: row.encrypted_inss_password || undefined,
    photoReference: row.photo_reference || undefined,
    notes: row.notes || undefined,
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
