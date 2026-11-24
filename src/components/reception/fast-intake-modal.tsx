'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  PlusCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { isValidCpf } from '@/lib/domain/cpf-validator';
import type { TeamMember } from '@/types/settings';
import type { PendingPhysicalDocument } from '@/types/attendance';
import {
  getDefaultDocumentsForBenefit,
  type DocumentChecklistItem,
} from '@/lib/domain/document-presets';
import { formatBenefitType } from '@/lib/utils/benefit-translations';
import {
  IntakeClientDataSection,
  IntakeDocumentChecklistSection,
  IntakeAttendantSection,
} from './fast-intake-sections';

export interface FastIntakeData {
  fullName: string;
  phone: string;
  cpf: string;
  benefit: string;
  notes: string;
  registeredBy?: string;
  assignedLawyerName?: string;
  pendingDocuments?: PendingPhysicalDocument[];
}

interface FastIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (data: FastIntakeData) => void | Promise<void>;
}

export function FastIntakeModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}: FastIntakeModalProps) {
  const { t, locale } = useI18n();
  const { currentUser } = useAuth();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [dbMembers, setDbMembers] = useState<TeamMember[]>([]);
  const isManagingPartner = Boolean(currentUser?.isAdminLawyer);

  // Load team members from Supabase profiles
  useEffect(() => {
    if (!currentUser?.tenantId) return;
    const supabase = createClient();
    (supabase.from('profiles') as any)
      .select('*')
      .eq('tenant_id', currentUser.tenantId)
      .eq('is_active', true)
      .then(({ data }: any) => {
        if (data && data.length > 0) {
          const members: TeamMember[] = data.map((p: any) => ({
            id: p.id,
            tenantId: p.tenant_id,
            fullName: p.full_name,
            email: p.email,
            phone: p.phone || undefined,
            oabNumber: p.oab_number || undefined,
            memberType:
              p.role === 'INTERN'
                ? 'INTERN'
                : p.role === 'ASSISTANT' || p.role === 'RECEPTIONIST'
                ? 'ASSISTANT'
                : 'LAWYER',
            isAdminLawyer: p.role === 'MANAGING_LAWYER',
            active: p.is_active ?? true,
            permissions: currentUser?.permissions || ({} as any),
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }));
          setDbMembers(members);
        }
      })
      .catch((err: any) => console.error('Error loading team profiles:', err));
  }, [currentUser?.tenantId, currentUser?.permissions]);

  // Lawyers available to attend
  const lawyerOptions = useMemo(() => {
    const list = dbMembers.filter((m) => m.memberType === 'LAWYER' || m.isAdminLawyer);
    if (list.length === 0 && currentUser) {
      list.push(currentUser);
    }
    return list;
  }, [dbMembers, currentUser]);

  const [createdById, setCreatedById] = useState<string>(() => currentUser?.id || '');
  const [assignedLawyerId, setAssignedLawyerId] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [benefit, setBenefit] = useState('Rural Special Retirement');
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<DocumentChecklistItem[]>(() =>
    getDefaultDocumentsForBenefit('Rural Special Retirement')
  );
  const [customDocName, setCustomDocName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBenefitChange = (newBenefit: string) => {
    setBenefit(newBenefit);
    const customItems = documents.filter((d) => d.isCustom);
    const newPresets = getDefaultDocumentsForBenefit(newBenefit);
    setDocuments([...newPresets, ...customItems]);
  };

  const handleToggleSelectDoc = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isSelected: !doc.isSelected } : doc))
    );
  };

  const handleToggleDeliveredDoc = (id: string, isDelivered: boolean) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isDelivered } : doc))
    );
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleAddCustomDoc = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = documents.find((d) => d.description.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (!existing.isSelected) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === existing.id ? { ...d, isSelected: true } : d))
        );
      }
      setCustomDocName('');
      return;
    }
    setDocuments((prev) => [
      ...prev,
      {
        id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        description: trimmed,
        isSelected: true,
        isDelivered: false,
        isCustom: true,
      },
    ]);
    setCustomDocName('');
  };

  const handleSelectAllDocs = () => {
    setDocuments((prev) => prev.map((doc) => ({ ...doc, isSelected: true })));
  };

  const handleDeselectAllDocs = () => {
    setDocuments((prev) => prev.map((doc) => ({ ...doc, isSelected: false })));
  };

  // Sync state when modal opens or user/lawyers change
  useEffect(() => {
    if (isOpen) {
      setCreatedById(currentUser?.id || '');

      if (isManagingPartner) {
        setAssignedLawyerId(currentUser?.id || lawyerOptions[0]?.id || '');
      } else if (currentUser?.memberType === 'LAWYER') {
        setAssignedLawyerId(currentUser.id);
      } else {
        const partner = lawyerOptions.find((l) => l.isAdminLawyer);
        setAssignedLawyerId(partner?.id || lawyerOptions[0]?.id || '');
      }
    }
  }, [isOpen, isManagingPartner, currentUser, lawyerOptions]);

  // Auto-focus on name field when opened & handle Escape key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      setFullName('');
      setPhone('');
      setCpf('');
      setBenefit('Rural Special Retirement');
      setDocuments(getDefaultDocumentsForBenefit('Rural Special Retirement'));
      setCustomDocName('');
      setNotes('');
      setErrorMsg(null);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanCpf = cpf.replace(/\D/g, '');
  const cpfValid = cleanCpf.length === 11 ? isValidCpf(cleanCpf) : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg('O nome completo deve ter pelo menos 3 letras.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('O número de celular ou WhatsApp é obrigatório.');
      return;
    }

    if (cleanCpf.length > 0 && cleanCpf.length !== 11) {
      setErrorMsg('O CPF deve ter 11 dígitos numéricos ou ser deixado em branco.');
      return;
    }

    if (cleanCpf.length === 11 && !isValidCpf(cleanCpf)) {
      setErrorMsg(t.fastIntake.cpfInvalid);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const selectedLawyer = lawyerOptions.find((m) => m.id === assignedLawyerId);
      const attendantName = selectedLawyer?.fullName || currentUser?.fullName || 'Advogado Responsável';
      const creator = isManagingPartner
        ? dbMembers.find((m) => m.id === createdById) || currentUser
        : currentUser;

      const selectedPendingDocs: PendingPhysicalDocument[] = documents
        .filter((d) => d.isSelected)
        .map((d) => ({
          id: d.id,
          description: d.description,
          isDelivered: d.isDelivered,
          deliveredAt: d.isDelivered ? new Date().toISOString() : undefined,
        }));

      await onSubmitSuccess({
        fullName: fullName.trim(),
        phone: phone.trim(),
        cpf: cleanCpf || '',
        benefit: formatBenefitType(benefit, 'pt-BR'),
        notes: notes.trim() || 'Entrada rápida de balcão registrada.',
        registeredBy: creator?.fullName || 'Recepção',
        assignedLawyerName: attendantName,
        pendingDocuments: selectedPendingDocs,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao registrar entrada rápida. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fast-intake-title"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-[#0B192E] text-white p-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <Clock className="w-4 h-4" />
            <span>{t.fastIntake.speedBadge}</span>
          </div>

          <h2 id="fast-intake-title" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t.fastIntake.modalTitle}</span>
          </h2>
          <p className="text-xs text-white/70 mt-0.5">
            {t.fastIntake.modalSubtitle}
          </p>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1-4. Dados do Cliente */}
          <IntakeClientDataSection
            fullName={fullName}
            onFullNameChange={setFullName}
            phone={phone}
            onPhoneChange={setPhone}
            cpf={cpf}
            onCpfChange={setCpf}
            cpfValid={cpfValid}
            benefit={benefit}
            onBenefitChange={handleBenefitChange}
            nameInputRef={nameInputRef}
            t={t}
            locale={locale}
          />

          {/* 5. Documentos do Atendimento (Checklist Dinâmico) */}
          <IntakeDocumentChecklistSection
            documents={documents}
            onToggleSelectDoc={handleToggleSelectDoc}
            onToggleDeliveredDoc={handleToggleDeliveredDoc}
            onRemoveDoc={handleRemoveDoc}
            onSelectAllDocs={handleSelectAllDocs}
            onDeselectAllDocs={handleDeselectAllDocs}
            onAddCustomDoc={handleAddCustomDoc}
            customDocName={customDocName}
            setCustomDocName={setCustomDocName}
            locale={locale}
          />

          {/* 6. Rastreabilidade de Atendimento: Cadastrado por & Advogado Responsável */}
          <IntakeAttendantSection
            isManagingPartner={isManagingPartner}
            createdById={createdById}
            onCreatedByIdChange={setCreatedById}
            assignedLawyerId={assignedLawyerId}
            onAssignedLawyerIdChange={setAssignedLawyerId}
            dbMembers={dbMembers}
            lawyerOptions={lawyerOptions}
            currentUser={currentUser}
            locale={locale}
          />

          {/* 7. Anotação Rápida */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.fastIntake.notesLabel}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.fastIntake.notesPlaceholder}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-[#0B192E] hover:bg-[#142642] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#C89543]" />
              <span>{submitting ? t.fastIntake.btnSubmitting : t.fastIntake.btnSubmit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
