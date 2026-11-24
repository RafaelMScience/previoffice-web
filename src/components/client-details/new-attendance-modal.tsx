'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Clock,
  User,
  FileText,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { settingsStore } from '@/lib/data/mock-settings';
import type { TeamMember } from '@/types/settings';
import { createAttendanceInDb } from '@/lib/services/client-service';
import type { Attendance, AttendanceType, PendingPhysicalDocument } from '@/types/attendance';
import { AttendanceAttendantSection } from '@/components/attendances/attendance-attendant-section';
import { AttendanceChecklistSection } from '@/components/attendances/attendance-checklist-section';
import {
  COMMON_DOCUMENT_SHORTCUTS,
  getDefaultDocumentsForBenefit,
  type DocumentChecklistItem,
} from '@/lib/domain/document-presets';
import {
  BENEFIT_TYPES_CATALOG,
  formatBenefitType,
  getCanonicalBenefitKey,
} from '@/lib/utils/benefit-translations';

export interface NewAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientBenefitType?: string;
  defaultObjective?: string;
  existingAttendances?: Attendance[];
  onSave: (attendance: Attendance) => void;
}

const BENEFIT_OPTIONS = [
  { key: 'Rural Special Retirement', label: 'Aposentadoria Rural - Segurado Especial' },
  { key: 'Temporary Disability', label: 'Benefício por Incapacidade Temporária (Auxílio-Doença)' },
  { key: 'Permanent Disability', label: 'Aposentadoria por Incapacidade Permanente (Invalidez)' },
  { key: 'BPC/LOAS Elderly', label: 'BPC / LOAS - Idoso (≥ 65 anos)' },
  { key: 'BPC/LOAS Disability', label: 'BPC / LOAS - Pessoa com Deficiência (PCD)' },
  { key: 'Age Retirement Urban', label: 'Aposentadoria Urbana por Idade' },
  { key: 'Death Pension', label: 'Pensão por Morte' },
  { key: 'Maternity Benefit', label: 'Salário-Maternidade Rural/Urbano' },
  { key: 'General Query', label: 'Consulta Geral / Orientações Gerais' },
  { key: 'OTHER', label: 'Outros / Outro Benefício (Especificar)' },
];

export function NewAttendanceModal({
  isOpen,
  onClose,
  clientId,
  clientBenefitType,
  defaultObjective = '',
  existingAttendances = [],
  onSave,
}: NewAttendanceModalProps) {
  const { t } = useI18n();
  const { currentUser } = useAuth();

  const [attendanceType, setAttendanceType] = useState<AttendanceType>('RETURN');

  // =========================================================================
  // 1. USUÁRIO LOGADO E COLABORADORES DO BANCO (PROFILES)
  // =========================================================================
  const [dbMembers, setDbMembers] = useState<TeamMember[]>([]);

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
      .catch((err: any) => console.error('Erro ao carregar colaboradores do banco:', err));
  }, [currentUser?.tenantId, currentUser?.permissions]);

  const teamMembers = useMemo(() => {
    const list = [...dbMembers];
    if (list.length === 0) {
      list.push(...settingsStore.getTeamMembers());
    }
    if (currentUser && !list.some((m) => m.id === currentUser.id)) {
      list.unshift({
        id: currentUser.id,
        tenantId: currentUser.tenantId,
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: '',
        oabNumber: currentUser.oabNumber || undefined,
        memberType: (currentUser as any).memberType || (currentUser.isAdminLawyer ? 'LAWYER' : 'ASSISTANT'),
        isAdminLawyer: currentUser.isAdminLawyer,
        active: true,
        permissions: currentUser.permissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    return list;
  }, [dbMembers, currentUser]);

  const lawyerOptions = useMemo(() => {
    const lawyers = teamMembers.filter((m) => m.memberType === 'LAWYER' || m.isAdminLawyer);
    if (lawyers.length > 0) return lawyers;
    return teamMembers;
  }, [teamMembers]);

  // Pré-seleciona quem está logado
  const [createdById, setCreatedById] = useState<string>(() => currentUser?.id || '');
  const [assignedLawyerId, setAssignedLawyerId] = useState<string>(() => {
    if (currentUser?.isAdminLawyer || currentUser?.oabNumber) {
      return currentUser.id;
    }
    return '';
  });

  useEffect(() => {
    if (!createdById) {
      if (currentUser?.id && teamMembers.some((m) => m.id === currentUser.id)) {
        setCreatedById(currentUser.id);
      } else if (teamMembers[0]?.id) {
        setCreatedById(teamMembers[0].id);
      }
    }

    if (!assignedLawyerId) {
      if (currentUser && lawyerOptions.some((l) => l.id === currentUser.id)) {
        setAssignedLawyerId(currentUser.id);
      } else if (lawyerOptions[0]?.id) {
        setAssignedLawyerId(lawyerOptions[0].id);
      }
    }
  }, [teamMembers, lawyerOptions, currentUser, createdById, assignedLawyerId]);

  // =========================================================================
  // 2. OBJETIVO / BENEFÍCIO TRATADO COM DROPDOWN + CAIXA "OUTROS"
  // =========================================================================
  const initialBenefitResolution = useMemo(() => {
    const raw = (defaultObjective || clientBenefitType || '').trim();
    if (!raw || raw.toLowerCase() === 'não informado' || raw.toLowerCase() === 'not specified') {
      return { key: 'Rural Special Retirement', customText: '' };
    }

    const canonical = getCanonicalBenefitKey(raw);
    const matched = BENEFIT_OPTIONS.find(
      (b) => b.key === canonical || b.label.toLowerCase() === raw.toLowerCase()
    );

    if (matched) {
      return { key: matched.key, customText: '' };
    }

    // Caso não seja um benefício padrão do catálogo, marca "OTHER" e preenche a caixinha
    return { key: 'OTHER', customText: raw };
  }, [defaultObjective, clientBenefitType]);

  const [selectedBenefitKey, setSelectedBenefitKey] = useState<string>(initialBenefitResolution.key);
  const [customBenefitText, setCustomBenefitText] = useState<string>(initialBenefitResolution.customText);

  // =========================================================================
  // 3. DOCUMENTOS DO ATENDIMENTO (IGUAL ENTRADA RÁPIDA + PUXAR ENTREGUES DO BANCO)
  // =========================================================================
  const [documents, setDocuments] = useState<DocumentChecklistItem[]>([]);
  const [customDocName, setCustomDocName] = useState('');
  const [narrativeHistory, setNarrativeHistory] = useState('');
  const [strategyNotes, setStrategyNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNarrativeHistory('');
      setStrategyNotes('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  // Carrega documentos do banco e inicializa checklist inteligente
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const benefitForPresets = selectedBenefitKey === 'OTHER' ? 'General Query' : selectedBenefitKey;
    const basePresets = getDefaultDocumentsForBenefit(benefitForPresets);

    async function loadClientDeliveredDocuments() {
      const deliveredNames = new Set<string>();
      const pendingNames = new Set<string>();

      // A. Coleta do histórico de atendimentos pré-carregados
      if (existingAttendances && existingAttendances.length > 0) {
        for (const att of existingAttendances) {
          if (att.pendingDocuments) {
            for (const doc of att.pendingDocuments) {
              const norm = doc.description.trim().toLowerCase();
              if (doc.isDelivered) {
                deliveredNames.add(norm);
              } else {
                pendingNames.add(norm);
              }
            }
          }
        }
      }

      // B. Busca no Supabase (documentos físicos ou digitalizados no cofre)
      try {
        const supabase = createClient();
        const [docsRes, attsRes] = await Promise.all([
          (supabase.from('documents') as any)
            .select('display_name')
            .eq('client_id', clientId)
            .is('deleted_at', null),
          (supabase.from('attendances') as any)
            .select('pending_documents')
            .eq('client_id', clientId),
        ]);

        if (docsRes.data) {
          for (const d of docsRes.data) {
            if (d.display_name) {
              deliveredNames.add(d.display_name.trim().toLowerCase());
            }
          }
        }

        if (attsRes.data) {
          for (const a of attsRes.data) {
            if (Array.isArray(a.pending_documents)) {
              for (const p of a.pending_documents) {
                if (p.description) {
                  const norm = p.description.trim().toLowerCase();
                  if (p.isDelivered) {
                    deliveredNames.add(norm);
                  } else {
                    pendingNames.add(norm);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Busca de documentos do banco:', err);
      }

      if (!isMounted) return;

      // Monta o checklist:
      // 1. Documentos padrão do benefício (se constarem como entregues no banco, já marca Recebido)
      const mergedList: DocumentChecklistItem[] = basePresets.map((preset) => {
        const norm = preset.description.trim().toLowerCase();
        const wasDelivered = deliveredNames.has(norm);
        return {
          ...preset,
          isSelected: true,
          isDelivered: wasDelivered,
        };
      });

      // 2. Adiciona documentos que já foram entregues no banco mas não faziam parte do preset padrão
      deliveredNames.forEach((delivName) => {
        const alreadyInList = mergedList.some(
          (m) => m.description.trim().toLowerCase() === delivName
        );
        if (!alreadyInList) {
          // Acha a capitalização original no histórico de atalhos ou atendimentos se possível
          const matchingShortcut = COMMON_DOCUMENT_SHORTCUTS.find(
            (s) => s.toLowerCase() === delivName
          );
          mergedList.push({
            id: `doc-db-${Math.random().toString(36).slice(2, 7)}`,
            description: matchingShortcut || delivName.charAt(0).toUpperCase() + delivName.slice(1),
            isSelected: true,
            isDelivered: true,
            isCustom: true,
          });
        }
      });

      // 3. Adiciona documentos que estavam pendentes em atendimentos anteriores
      pendingNames.forEach((pendName) => {
        const alreadyInList = mergedList.some(
          (m) => m.description.trim().toLowerCase() === pendName
        );
        if (!alreadyInList && !deliveredNames.has(pendName)) {
          const matchingShortcut = COMMON_DOCUMENT_SHORTCUTS.find(
            (s) => s.toLowerCase() === pendName
          );
          mergedList.push({
            id: `doc-pend-${Math.random().toString(36).slice(2, 7)}`,
            description: matchingShortcut || pendName.charAt(0).toUpperCase() + pendName.slice(1),
            isSelected: true,
            isDelivered: false,
            isCustom: true,
          });
        }
      });

      setDocuments(mergedList);
    }

    loadClientDeliveredDocuments();

    return () => {
      isMounted = false;
    };
  }, [isOpen, clientId, selectedBenefitKey, existingAttendances]);

  if (!isOpen) return null;

  // Ações de checklist idênticas ao fast-intake-modal
  const handleSelectAllDocs = () => {
    setDocuments((prev) => prev.map((d) => ({ ...d, isSelected: true })));
  };

  const handleDeselectAllDocs = () => {
    setDocuments((prev) => prev.map((d) => ({ ...d, isSelected: false })));
  };

  const handleToggleSelectDoc = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isSelected: !d.isSelected } : d))
    );
  };

  const handleToggleDeliveredDoc = (id: string, isDelivered: boolean) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isDelivered } : d))
    );
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddCustomDoc = (name: string) => {
    if (!name.trim()) return;
    const trimmed = name.trim();
    const existing = documents.find(
      (d) => d.description.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      setDocuments((prev) =>
        prev.map((d) => (d.id === existing.id ? { ...d, isSelected: true } : d))
      );
    } else {
      setDocuments((prev) => [
        ...prev,
        {
          id: `doc-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          description: trimmed,
          isSelected: true,
          isDelivered: false,
          isCustom: true,
        },
      ]);
    }
    setCustomDocName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const creator = teamMembers.find((m) => m.id === createdById);
    const lawyer = lawyerOptions.find((m) => m.id === assignedLawyerId);
    const attendantDisplayName =
      creator?.id === lawyer?.id
        ? lawyer?.fullName || currentUser?.fullName || 'Advogado Titular'
        : `${creator?.fullName || currentUser?.fullName || 'Recepção'} (Atendido por ${lawyer?.fullName || 'Advogado'})`;

    // Resolução do objetivo final
    const finalObjective =
      selectedBenefitKey === 'OTHER'
        ? customBenefitText.trim() || 'Outros / Não Especificado'
        : BENEFIT_OPTIONS.find((b) => b.key === selectedBenefitKey)?.label || selectedBenefitKey;

    // Mapeamento dos documentos do atendimento
    const finalPendingDocs: PendingPhysicalDocument[] = documents
      .filter((d) => d.isSelected)
      .map((d) => ({
        id: d.id,
        description: d.description,
        isDelivered: d.isDelivered,
        deliveredAt: d.isDelivered ? new Date().toISOString() : undefined,
      }));

    try {
      if (currentUser?.tenantId) {
        const created = await createAttendanceInDb(currentUser.tenantId, {
          clientId,
          attendanceType,
          objective: finalObjective,
          narrativeHistory: narrativeHistory.trim() || undefined,
          notes: strategyNotes.trim() || undefined,
          attendantName: attendantDisplayName,
          attendantUserId: currentUser.id,
          pendingDocuments: finalPendingDocs,
        });
        onSave(created);
      } else {
        const newAttendance: Attendance = {
          id: `att-${Date.now()}`,
          tenantId: 'tenant-default',
          clientId,
          attendanceType,
          attendedAt: new Date().toISOString(),
          objective: finalObjective,
          narrativeHistory: narrativeHistory.trim() || undefined,
          notes: strategyNotes.trim() || undefined,
          attendantName: attendantDisplayName,
          pendingDocuments: finalPendingDocs,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        onSave(newAttendance);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving attendance in modal:', err);
      setErrorMsg(err?.message || 'Falha ao salvar atendimento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalExigidos = documents.filter((d) => d.isSelected).length;
  const totalPendentes = documents.filter((d) => d.isSelected && !d.isDelivered).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0B192E] text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <Clock className="w-4 h-4" />
            <span>{t.clientDetails.modalAttendanceTitle}</span>
          </div>

          <p className="text-xs text-slate-300">
            {t.clientDetails.modalAttendanceSubtitle}
          </p>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Attendant & Lawyer Assignment Section */}
          <AttendanceAttendantSection
            t={t}
            attendanceType={attendanceType}
            setAttendanceType={setAttendanceType}
            createdById={createdById}
            setCreatedById={setCreatedById}
            assignedLawyerId={assignedLawyerId}
            setAssignedLawyerId={setAssignedLawyerId}
            teamMembers={teamMembers}
            lawyerOptions={lawyerOptions}
            currentUserId={currentUser?.id}
          />

          {/* Objetivo / Benefício Tratado (Dropdown + Campo Outros) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>{t.clientDetails.objectiveLabel} *</span>
              {selectedBenefitKey === 'OTHER' && (
                <span className="text-[10px] text-[#C89543] font-bold">{t.clientDetails.customModeBadge}</span>
              )}
            </label>
            <select
              value={selectedBenefitKey}
              onChange={(e) => setSelectedBenefitKey(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-semibold text-[#0B192E]"
            >
              {BENEFIT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Caixinha liberada quando seleciona "Outros" */}
            {selectedBenefitKey === 'OTHER' && (
              <div className="mt-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <label className="block text-[11px] font-bold text-[#C89543]">
                  {t.clientDetails.customBenefitLabel}
                </label>
                <input
                  type="text"
                  required
                  value={customBenefitText}
                  onChange={(e) => setCustomBenefitText(e.target.value)}
                  placeholder={t.clientDetails.customBenefitPlaceholder}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#C89543] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] text-slate-900 font-medium shadow-xs"
                />
              </div>
            )}
          </div>

          {/* Narrative */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.clientDetails.narrativeLabel}
            </label>
            <textarea
              rows={3}
              value={narrativeHistory}
              onChange={(e) => setNarrativeHistory(e.target.value)}
              placeholder={t.clientDetails.narrativeNotesPlaceholder}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
            />
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C89543]" />
              <span>{t.clientDetails.strategyLabel}</span>
            </label>
            <textarea
              rows={2}
              value={strategyNotes}
              onChange={(e) => setStrategyNotes(e.target.value)}
              placeholder={t.clientDetails.strategyNotesPlaceholder}
              className="w-full px-3.5 py-2 text-sm bg-amber-50/50 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
            />
          </div>

          {/* Checklist de Documentos do Atendimento */}
          <AttendanceChecklistSection
            t={t}
            documents={documents}
            onSelectAll={handleSelectAllDocs}
            onDeselectAll={handleDeselectAllDocs}
            onToggleSelectDoc={handleToggleSelectDoc}
            onToggleDeliveredDoc={handleToggleDeliveredDoc}
            onRemoveDoc={handleRemoveDoc}
            onAddCustomDoc={handleAddCustomDoc}
            customDocName={customDocName}
            setCustomDocName={setCustomDocName}
          />

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              {t.clientDetails.btnClose}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B192E] hover:bg-[#142642] rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.clientDetails.btnSavingAttendance}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C89543]" />
                  <span>{t.clientDetails.btnSaveAttendance}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewAttendanceModal;
