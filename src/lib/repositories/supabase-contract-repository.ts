/**
 * Supabase PostgreSQL Contract Repository Implementation
 * Handles real database persistence, JSONB structure sanitation, and attendance audit.
 */

import { createClient } from '../supabase/client.ts';
import type { IContractRepository } from './contract-repository.ts';
import type {
  Contract,
  ContractTemplate,
  PhysicalDocumentAttachment,
  PhysicalSignedStatus,
  PaymentMethod,
  ContractStatus,
} from '../../types/contract.ts';

function mapDbRowToContract(row: any): Contract {
  const clientInfo = row.clients || {};
  const feeStructure = row.fee_structure || {
    feeModel: 'QUOTA_LITIS',
    installments: [],
  };

  return {
    id: row.id,
    tenantId: row.tenant_id,
    contractNumber: row.contract_number,
    clientId: row.client_id,
    clientName: clientInfo.full_name || 'Cliente Sem Nome',
    clientCpf: clientInfo.cpf || '',
    clientPhone: clientInfo.mobile_phone || clientInfo.phone || '',
    benefitSpecies: row.benefit_species || '',
    templateId: row.template_id,
    templateTitle: row.template_title,
    status: (row.status as ContractStatus) || 'ACTIVE',
    physicalSignedStatus: (row.physical_signed_status as PhysicalSignedStatus) || 'PENDING',
    physicalAttachment: feeStructure.physicalAttachment,
    customContractAttachment: feeStructure.customContractAttachment,
    customPoaAttachment: feeStructure.customPoaAttachment,
    customDocuments: feeStructure.customDocuments || [],
    feeStructure,
    lawyerName: row.lawyer_name || '',
    lawyerOab: row.lawyer_oab || '',
    officeName: row.office_name || '',
    issuedAt: row.issued_at || row.created_at || new Date().toISOString(),
    physicalFileLocation: row.physical_file_location || clientInfo.physical_file_location || '',
    isCustomEdited: row.is_custom_edited || false,
    customEditedBy: row.custom_edited_by,
    customEditedAt: row.custom_edited_at,
    customContractBody: row.custom_contract_body,
    customPoaBody: row.custom_poa_body,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function sanitizeAttachmentForDb(att?: PhysicalDocumentAttachment): PhysicalDocumentAttachment | undefined {
  if (!att) return undefined;
  // Strip heavy base64 data to avoid database JSONB bloating
  const { fileDataUrl: _, ...rest } = att;
  return rest as PhysicalDocumentAttachment;
}

export class SupabaseContractRepository implements IContractRepository {
  private getClient() {
    return createClient();
  }

  async fetchContracts(tenantId: string): Promise<Contract[]> {
    try {
      const supabase = this.getClient();
      // Optimized column projection (Item 24): omit heavy text bodies (custom_contract_body, custom_poa_body) on listings
      const { data, error } = await (supabase.from('contracts') as any)
        .select(`
          id, tenant_id, client_id, contract_number, template_id, template_title,
          benefit_species, status, fee_structure, lawyer_name, lawyer_oab, office_name,
          physical_signed_status, physical_file_location, is_custom_edited, custom_edited_by,
          custom_edited_at, issued_at, created_at, updated_at,
          clients(id, full_name, cpf, mobile_phone, phone, physical_file_location)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('SupabaseContractRepository.fetchContracts warning:', error);
        return [];
      }

      return (data as any[]).map(mapDbRowToContract);
    } catch (err) {
      console.error('SupabaseContractRepository.fetchContracts error:', err);
      return [];
    }
  }

  async getContractById(id: string, tenantId: string): Promise<Contract | null> {
    try {
      const supabase = this.getClient();
      const { data, error } = await (supabase.from('contracts') as any)
        .select('*, clients(id, full_name, cpf, mobile_phone, phone, physical_file_location)')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error || !data) return null;
      return mapDbRowToContract(data);
    } catch {
      return null;
    }
  }

  async saveContract(contract: Contract): Promise<void> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      contract.clientId
    );

    if (!isUuid) {
      console.warn('Skipping Supabase save for draft/non-UUID client:', contract.clientId);
      return;
    }

    const supabase = this.getClient();

    const sanitizedFeeStructure = {
      ...contract.feeStructure,
      physicalAttachment: sanitizeAttachmentForDb(contract.physicalAttachment),
      customContractAttachment: sanitizeAttachmentForDb(contract.customContractAttachment),
      customPoaAttachment: sanitizeAttachmentForDb(contract.customPoaAttachment),
      customDocuments: (contract.customDocuments || []).map((d) => sanitizeAttachmentForDb(d)!),
    };

    const rowPayload = {
      tenant_id: contract.tenantId,
      client_id: contract.clientId,
      contract_number: contract.contractNumber,
      template_id: contract.templateId,
      template_title: contract.templateTitle,
      benefit_species: contract.benefitSpecies,
      status: contract.status,
      fee_structure: sanitizedFeeStructure,
      lawyer_name: contract.lawyerName,
      lawyer_oab: contract.lawyerOab,
      office_name: contract.officeName,
      physical_signed_status: contract.physicalSignedStatus,
      physical_file_location: contract.physicalFileLocation,
      is_custom_edited: contract.isCustomEdited || false,
      custom_edited_by: contract.customEditedBy,
      custom_edited_at: contract.customEditedAt,
      custom_contract_body: contract.customContractBody,
      custom_poa_body: contract.customPoaBody,
      issued_at: contract.issuedAt,
    };

    const { error } = await (supabase.from('contracts') as any).upsert(
      rowPayload,
      { onConflict: 'tenant_id,contract_number' }
    );

    if (error) {
      console.error('Error saving contract to Supabase:', error);
      throw error;
    }

    // Attendance audit log
    await (supabase.from('attendances') as any).insert({
      tenant_id: contract.tenantId,
      client_id: contract.clientId,
      attendance_type: 'OTHER',
      objective: `Formalização Contratual: ${contract.contractNumber}`,
      notes: `Contrato de prestação de serviços formalizado para ${contract.benefitSpecies}. Status da assinatura física: ${contract.physicalSignedStatus}.`,
      attended_at: new Date().toISOString(),
    });
  }

  async updatePhysicalSignedStatus(
    contractId: string,
    tenantId: string,
    status: PhysicalSignedStatus,
    attachment?: PhysicalDocumentAttachment
  ): Promise<void> {
    const supabase = this.getClient();
    const existing = await this.getContractById(contractId, tenantId);
    if (!existing) return;

    const sanitizedAttachment = sanitizeAttachmentForDb(attachment);
    const updatedFeeStructure = {
      ...existing.feeStructure,
      physicalAttachment: sanitizedAttachment || existing.physicalAttachment,
    };

    await (supabase.from('contracts') as any)
      .update({
        physical_signed_status: status,
        fee_structure: updatedFeeStructure,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .eq('tenant_id', tenantId);

    // Audit log
    await (supabase.from('attendances') as any).insert({
      tenant_id: tenantId,
      client_id: existing.clientId,
      attendance_type: 'OTHER',
      objective: `Documento Físico Arquivado: ${existing.contractNumber}`,
      notes: `Via física assinada digitalizada e vinculada à pasta física ${existing.physicalFileLocation}. Status: ${status}.`,
      attended_at: new Date().toISOString(),
    });
  }

  async settleInstallment(
    contractId: string,
    tenantId: string,
    installmentId: string,
    paymentMethod: PaymentMethod,
    receiptReference?: string,
    notes?: string
  ): Promise<Contract | null> {
    const supabase = this.getClient();
    const existing = await this.getContractById(contractId, tenantId);
    if (!existing) return null;

    const updatedInstallments = (existing.feeStructure.installments || []).map((inst) => {
      if (inst.id === installmentId) {
        return {
          ...inst,
          status: 'PAID' as const,
          paidAt: new Date().toISOString(),
          paymentMethod,
          receiptReference,
          notes,
        };
      }
      return inst;
    });

    const isSettled = updatedInstallments.every((i) => i.status === 'PAID');
    const updatedFeeStructure = {
      ...existing.feeStructure,
      installments: updatedInstallments,
      isSettled,
    };

    await (supabase.from('contracts') as any)
      .update({
        fee_structure: updatedFeeStructure,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .eq('tenant_id', tenantId);

    return {
      ...existing,
      feeStructure: updatedFeeStructure,
    };
  }

  async fetchTemplates(tenantId: string): Promise<ContractTemplate[]> {
    // Templates can be extended to a database table or combined with system presets
    const { contractsStore } = await import('@/lib/data/mock-contracts');
    const all = contractsStore.getTemplates();
    return all.filter(
      (t) =>
        !tenantId ||
        t.tenantId === tenantId ||
        t.isDefault ||
        t.tenantId === 'tenant-001' ||
        t.tenantId === 'system'
    );
  }

  async saveTemplate(template: ContractTemplate): Promise<void> {
    const { contractsStore } = await import('@/lib/data/mock-contracts');
    const updated = contractsStore.updateTemplate(template);
    if (!updated) {
      contractsStore.addTemplate(template);
    }
  }
}
