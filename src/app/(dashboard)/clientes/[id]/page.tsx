import React from 'react';
import { notFound } from 'next/navigation';
import { ClientDetailsView } from '@/components/client-details/client-details-view';
import { createClientServer } from '@/lib/supabase/server';
import { decryptData } from '@/lib/security/encryption';
import type { Client, ClientStatus, MaritalStatus, SpecialCategory } from '@/types/client';
import type { Attendance, AttendanceType } from '@/types/attendance';

interface ClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientDetailPage({ params }: ClientPageProps) {
  const { id } = await params;
  const supabase = await createClientServer();

  // 1. Single-query nested join to eliminate sequential network hops during SSR
  const { data: rawClient } = await (supabase
    .from('clients') as any)
    .select('*, attendances(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  const clientRow = rawClient as any;

  if (clientRow) {
    const attendanceRows = clientRow.attendances || [];

    const client: Client = {
      id: clientRow.id,
      tenantId: clientRow.tenant_id,
      fullName: clientRow.full_name,
      normalizedName: clientRow.normalized_name,
      cpf: clientRow.cpf || undefined,
      normalizedCpf: clientRow.normalized_cpf || undefined,
      rg: clientRow.rg || undefined,
      birthDate: clientRow.birth_date || undefined,
      maritalStatus: (clientRow.marital_status as MaritalStatus) || undefined,
      profession: clientRow.profession || undefined,
      nationality: clientRow.nationality || 'Brasileira',
      placeOfBirth: clientRow.place_of_birth || undefined,
      motherName: clientRow.mother_name || undefined,
      fatherName: clientRow.father_name || undefined,
      postalCode: clientRow.postal_code || undefined,
      normalizedPostalCode: clientRow.postal_code?.replace(/\D/g, '') || undefined,
      street: clientRow.street || undefined,
      streetNumber: clientRow.street_number || undefined,
      complement: clientRow.complement || undefined,
      neighborhood: clientRow.neighborhood || undefined,
      city: clientRow.city || undefined,
      state: clientRow.state || undefined,
      phone: clientRow.phone || undefined,
      mobilePhone: clientRow.mobile_phone || undefined,
      email: clientRow.email || undefined,
      monthlyIncome: clientRow.monthly_income ? Number(clientRow.monthly_income) : undefined,
      dependentCount: clientRow.dependent_count ?? 0,
      hasActiveBenefit: clientRow.has_active_benefit ?? false,
      benefitType: clientRow.benefit_type || undefined,
      benefitNumber: clientRow.benefit_number || undefined,
      recentContributionsSummary: clientRow.recent_contributions_summary || undefined,
      specialCategories: (clientRow.special_categories as SpecialCategory[]) || [],
      encryptedInssPassword: clientRow.encrypted_inss_password
        ? decryptData(clientRow.encrypted_inss_password)
        : undefined,
      inssPassword: clientRow.encrypted_inss_password
        ? decryptData(clientRow.encrypted_inss_password)
        : undefined,
      photoReference: clientRow.photo_reference || undefined,
      notes: clientRow.notes || undefined,
      visitCount: clientRow.visit_count ?? 1,
      lastVisitAt: clientRow.last_visit_at || undefined,
      lastAttendantName: clientRow.last_attendant_name || undefined,
      status: (clientRow.status as ClientStatus) || 'PROSPECT',
      active: clientRow.active ?? true,
      inactivationReason: clientRow.inactivation_reason || undefined,
      createdAt: clientRow.created_at,
      updatedAt: clientRow.updated_at,
      deletedAt: clientRow.deleted_at || undefined,
    };

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

    return (
      <div className="py-2">
        <ClientDetailsView
          initialClient={client}
          initialAttendances={attendances}
          initialCaseUpdates={[]}
        />
      </div>
    );
  }

  // 2. Client not found in database -> 404
  notFound();
}
