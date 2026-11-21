'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  PlusCircle,
  User,
  Phone,
  CreditCard,
  Award,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Scale,
  Trash2,
  Plus,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { isValidCpf } from '@/lib/domain/cpf-validator';
import { maskCpf, maskPhone } from '@/lib/utils/masks';
import type { TeamMember } from '@/types/settings';
import type { PendingPhysicalDocument } from '@/types/attendance';
import {
  getDefaultDocumentsForBenefit,
  COMMON_DOCUMENT_SHORTCUTS,
  type DocumentChecklistItem,
} from '@/lib/domain/document-presets';
import { formatBenefitType } from '@/lib/utils/benefit-translations';

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
  const { t } = useI18n();
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
        // If Managing Partner, defaults to himself
        setAssignedLawyerId(currentUser?.id || lawyerOptions[0]?.id || '');
      } else if (currentUser?.memberType === 'LAWYER') {
        // If Associate Lawyer, defaults to himself
        setAssignedLawyerId(currentUser.id);
      } else {
        // If Assistant/Receptionist, pick the titular partner or first lawyer
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
      // Reset form state on close
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
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
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
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Nome Completo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.fastIntake.fullNameLabel}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={nameInputRef}
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fastIntake.fullNamePlaceholder}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all font-medium"
              />
            </div>
          </div>

          {/* 2. Celular / WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.fastIntake.phoneLabel}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                maxLength={15}
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder={t.fastIntake.phonePlaceholder}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all font-mono"
              />
            </div>
          </div>

          {/* 3. CPF (Opcional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                {t.fastIntake.cpfLabel}
              </label>
              <span className="text-[10px] text-slate-400">
                {t.fastIntake.cpfOptionalNote}
              </span>
            </div>
            <div className="relative">
              <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                maxLength={14}
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                placeholder={t.fastIntake.cpfPlaceholder}
                className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 text-slate-900 transition-all font-mono ${
                  !cpfValid
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-[#C89543] focus:bg-white'
                }`}
              />
            </div>
            {!cpfValid && (
              <span className="text-[11px] text-red-600 font-medium block mt-1">
                {t.fastIntake.cpfInvalid}
              </span>
            )}
          </div>

          {/* 4. Benefício Almejado */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.fastIntake.benefitLabel}
            </label>
            <div className="relative">
              <Award className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={benefit}
                onChange={(e) => handleBenefitChange(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 transition-all font-medium"
              >
                <option value="Rural Special Retirement">Aposentadoria Rural - Segurado Especial</option>
                <option value="BPC/LOAS Elderly">BPC / LOAS - Idoso (≥ 65 anos)</option>
                <option value="BPC/LOAS Disability">BPC / LOAS - Pessoa com Deficiência (PCD)</option>
                <option value="Age Retirement Urban">Aposentadoria Urbana por Idade</option>
                <option value="Temporary Disability">Benefício por Incapacidade (Auxílio-Doença)</option>
                <option value="Death Pension">Pensão por Morte</option>
                <option value="Maternity Benefit">Salário-Maternidade Rural/Urbano</option>
                <option value="General Query">Consulta Geral / Outros</option>
              </select>
            </div>
          </div>

          {/* 5. Documentos do Atendimento (Checklist Dinâmico) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C89543]" />
                <span className="text-xs font-bold text-slate-800">
                  Documentos do Atendimento
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {documents.filter((d) => d.isSelected).length} exigido(s)
                  {documents.some((d) => d.isSelected && !d.isDelivered)
                    ? ` • ${documents.filter((d) => d.isSelected && !d.isDelivered).length} pendente(s)`
                    : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllDocs}
                  className="text-[11px] font-medium text-blue-700 hover:text-blue-900 transition-colors"
                >
                  Marcar Todos
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllDocs}
                  className="text-[11px] font-medium text-rose-600 hover:text-rose-800 transition-colors"
                >
                  Nenhum Documento
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              Marque os documentos que serão cobrados neste atendimento. Defina como <strong>Recebido</strong> se o cliente já trouxe, ou <strong>Pendente</strong> caso precise entregar depois.
            </p>

            {/* Checklist items list */}
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
              {documents.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  Nenhum documento adicionado para este atendimento.
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`pt-2 first:pt-0 flex items-center justify-between gap-2 p-2 rounded-lg transition-all ${
                      doc.isSelected
                        ? 'bg-white border border-slate-200 shadow-2xs'
                        : 'bg-slate-100/70 border border-dashed border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Checkbox + Label */}
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={doc.isSelected}
                        onChange={() => handleToggleSelectDoc(doc.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 shrink-0 cursor-pointer"
                      />
                      <span
                        className={`text-xs truncate ${
                          doc.isSelected
                            ? 'font-semibold text-slate-800'
                            : 'text-slate-400 line-through'
                        }`}
                        title={doc.description}
                      >
                        {doc.description}
                      </span>
                    </label>

                    {/* Action / Status Toggle & Remove */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {doc.isSelected ? (
                        <div className="inline-flex rounded-md shadow-2xs border border-slate-200 overflow-hidden bg-slate-50 p-0.5 text-[11px]">
                          <button
                            type="button"
                            aria-pressed={doc.isDelivered}
                            onClick={() => handleToggleDeliveredDoc(doc.id, true)}
                            className={`px-2 py-0.5 rounded font-bold transition-all ${
                              doc.isDelivered
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                          >
                            ✓ Recebido
                          </button>
                          <button
                            type="button"
                            aria-pressed={!doc.isDelivered}
                            onClick={() => handleToggleDeliveredDoc(doc.id, false)}
                            className={`px-2 py-0.5 rounded font-bold transition-all ${
                              !doc.isDelivered
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                          >
                            ⏳ Pendente
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic px-1.5">
                          Não exigido
                        </span>
                      )}

                      {/* Trash button to completely remove from list */}
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)}
                        aria-label={`Remover documento ${doc.description} da lista`}
                        title="Remover documento da lista"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Document Shortcuts */}
            <div className="pt-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Atalhos rápidos para adicionar:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DOCUMENT_SHORTCUTS.map((shortcut) => {
                  const isAlreadyAdded = documents.some(
                    (d) => d.description.toLowerCase() === shortcut.toLowerCase() && d.isSelected
                  );
                  return (
                    <button
                      key={shortcut}
                      type="button"
                      onClick={() => handleAddCustomDoc(shortcut)}
                      disabled={isAlreadyAdded}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                        isAlreadyAdded
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      + {shortcut}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input to type custom document */}
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={customDocName}
                aria-label="Digitar outro documento"
                onChange={(e) => setCustomDocName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomDoc(customDocName);
                  }
                }}
                placeholder="Digitar outro documento (ex: Certidão de Casamento)..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#C89543]"
              />
              <button
                type="button"
                onClick={() => handleAddCustomDoc(customDocName)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Rastreabilidade de Atendimento: Cadastrado por & Advogado Responsável */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Cadastrado por
                </label>
                {isManagingPartner ? (
                  <select
                    value={createdById}
                    onChange={(e) => setCreatedById(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-[#C89543]"
                  >
                    {dbMembers.length > 0 ? (
                      dbMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} {m.id === currentUser?.id ? '(Você)' : ''}
                        </option>
                      ))
                    ) : (
                      <option value={currentUser?.id || ''}>{currentUser?.fullName || 'Você'}</option>
                    )}
                  </select>
                ) : (
                  <div className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-semibold flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{currentUser?.fullName || 'Operador Logado'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Advogado que irá atender <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignedLawyerId}
                  onChange={(e) => setAssignedLawyerId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#082A52] rounded-lg font-bold text-[#082A52] focus:ring-1 focus:ring-[#C89543]"
                >
                  {lawyerOptions.map((lawyer) => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.fullName} {lawyer.oabNumber ? `(${lawyer.oabNumber})` : ''} {lawyer.id === currentUser?.id ? '(Você)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {isManagingPartner
                ? 'Como Sócio, você pode escolher o cadastrador e definir qualquer advogado para o atendimento.'
                : 'Cadastrador fixo com seu login. Você pode escolher qual advogado da banca irá realizar o atendimento.'}
            </p>
          </div>

          {/* 5. Anotação Rápida */}
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
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-[#0B192E] hover:bg-[#142642] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
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
