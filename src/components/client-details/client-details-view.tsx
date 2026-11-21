'use client';

import React, { useState } from 'react';
import {
  Clock,
  User,
  FolderOpen,
  Scale,
  Sparkles,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { ClientDetailHeader } from './client-detail-header';
import dynamic from 'next/dynamic';
import { AttendanceTimeline } from './attendance-timeline';
import { DocumentVault } from './document-vault';
import { BenefitDiagnosticCard } from './benefit-diagnostic-card';
import { CaseUpdatesPanel } from './case-updates-panel';
import { ClientFullForm } from '@/components/client-form/client-full-form';
import { useAuth } from '@/lib/auth/auth-context';
import { AccessDeniedBoundary } from '@/components/ui/access-denied-boundary';
import { formatBenefitType } from '@/lib/utils/benefit-translations';

// Dynamic code splitting for client detail modals (Item 22)
const NewAttendanceModal = dynamic(
  () => import('./new-attendance-modal').then((mod) => mod.NewAttendanceModal),
  { ssr: false }
);
const LegalContractModal = dynamic(
  () => import('./legal-contract-modal').then((mod) => mod.LegalContractModal),
  { ssr: false }
);
const ClientPdfReportModal = dynamic(
  () => import('./client-pdf-report-modal').then((mod) => mod.ClientPdfReportModal),
  { ssr: false }
);
const InactivateClientModal = dynamic(
  () => import('./inactivate-client-modal').then((mod) => mod.InactivateClientModal),
  { ssr: false }
);
const NewCaseUpdateModal = dynamic(
  () => import('./new-case-update-modal').then((mod) => mod.NewCaseUpdateModal),
  { ssr: false }
);
const MemoryCardModal = dynamic(
  () => import('@/components/memory-card/memory-card-modal').then((mod) => mod.MemoryCardModal),
  { ssr: false }
);
import type { Client, ClientStatus } from '@/types/client';
import type { Attendance } from '@/types/attendance';
import type { CaseUpdate } from '@/types/case-update';
import type { ClientFullRegistrationInput } from '@/lib/schemas/client-schema';

interface ClientDetailsViewProps {
  initialClient: Client;
  initialAttendances: Attendance[];
  initialCaseUpdates?: CaseUpdate[];
}

export function ClientDetailsView({
  initialClient,
  initialAttendances,
  initialCaseUpdates = [],
}: ClientDetailsViewProps) {
  const { t } = useI18n();
  const { canAccess, currentUser } = useAuth();

  const [client, setClient] = useState<Client>(initialClient);
  const [attendances, setAttendances] = useState<Attendance[]>(initialAttendances);
  const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>(initialCaseUpdates);
  const [activeTab, setActiveTab] = useState<
    'attendances' | 'process' | 'profile' | 'documents' | 'diagnostic'
  >('attendances');

  // Modals state
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isPdfReportModalOpen, setIsPdfReportModalOpen] = useState(false);
  const [isMemoryCardOpen, setIsMemoryCardOpen] = useState(false);
  const [isInactivateModalOpen, setIsInactivateModalOpen] = useState(false);
  const [isDirectInssModalOpen, setIsDirectInssModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Security Gate: Protect dossier access against direct URL tampering
  if (!canAccess('clientsManage') && !canAccess('receptionDesk')) {
    return (
      <AccessDeniedBoundary
        moduleName="Dossiê do Segurado & Histórico de Atendimentos"
        requiredPermissionLabel="Gestão de Clientes e Dossiês (clientsManage)"
      />
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleStatusChange = (newStatus: ClientStatus) => {
    setClient((prev) => ({
      ...prev,
      status: newStatus,
      active: newStatus !== 'INACTIVE',
    }));
    showToast(`Status do cliente alterado para: ${newStatus}`);
  };

  const handleConfirmInactivation = (reason: string, notes: string) => {
    setClient((prev) => ({
      ...prev,
      status: 'INACTIVE',
      active: false,
      inactivationReason: reason,
      inactivatedAt: new Date().toISOString(),
      notes: notes ? `${prev.notes || ''}\n[Encerramento: ${reason}] ${notes}`.trim() : prev.notes,
    }));
    showToast(t.clientDetails.inactivatedSuccessToast);
  };

  const handleReactivate = () => {
    setClient((prev) => ({
      ...prev,
      status: 'PENDING',
      active: true,
      inactivationReason: undefined,
      reactivatedAt: new Date().toISOString(),
    }));
    showToast(t.clientDetails.reactivatedSuccessToast);
  };

  const handleFormalizeContract = () => {
    setClient((prev) => ({
      ...prev,
      status: 'CLOSED',
    }));
    setIsContractModalOpen(true);
    showToast('Documentação completa! Status atualizado para Contrato Fechado.');
  };

  const handleSaveAttendance = (newAttendance: Attendance) => {
    setAttendances((prev) => [newAttendance, ...prev]);

    // Update client visits count and last visit timestamp
    setClient((prev) => ({
      ...prev,
      visitCount: prev.visitCount + 1,
      lastVisitAt: newAttendance.attendedAt,
      lastAttendantName: newAttendance.attendantName,
      status: prev.status === 'PROSPECT' ? 'PENDING' : prev.status,
    }));

    showToast(
      `Retorno registrado com sucesso! O contador de visitas foi atualizado para ${
        client.visitCount + 1
      }ª visita.`
    );
  };

  const handleToggleDocumentDelivered = async (attendanceId: string, docId: string) => {
    const targetAttendance = attendances.find((a) => a.id === attendanceId);
    if (!targetAttendance || !targetAttendance.pendingDocuments) return;

    const updatedDocs = targetAttendance.pendingDocuments.map((doc) =>
      doc.id === docId
        ? {
            ...doc,
            isDelivered: !doc.isDelivered,
            deliveredAt: !doc.isDelivered ? new Date().toISOString() : undefined,
          }
        : doc
    );

    // Optimistic UI update
    setAttendances((prev) =>
      prev.map((att) =>
        att.id === attendanceId ? { ...att, pendingDocuments: updatedDocs } : att
      )
    );

    try {
      const { updateAttendancePendingDocumentsInDb } = await import('@/lib/services/client-service');
      await updateAttendancePendingDocumentsInDb(attendanceId, updatedDocs);
      showToast('Status do documento atualizado com sucesso no banco de dados!');
    } catch (err: any) {
      console.error(err);
      // Rollback on error
      setAttendances((prev) =>
        prev.map((att) => (att.id === attendanceId ? targetAttendance : att))
      );
      showToast('Erro ao atualizar status dos documentos no banco de dados.');
    }
  };

  const handleUpdateClientFromMemory = (updated: Client) => {
    setClient(updated);
    showToast('Ficha do cliente atualizada a partir do Cartão de Memória!');
  };

  // Convert client to ClientFullRegistrationInput for the 32-field form
  const formInitialData: Partial<ClientFullRegistrationInput> = {
    fullName: client.fullName,
    cpf: client.cpf,
    rg: client.rg,
    birthDate: client.birthDate,
    maritalStatus: client.maritalStatus || 'MARRIED',
    profession: client.profession,
    motherName: client.motherName,
    fatherName: client.fatherName,
    postalCode: client.postalCode,
    street: client.street,
    streetNumber: client.streetNumber,
    complement: client.complement,
    neighborhood: client.neighborhood,
    city: client.city,
    state: client.state,
    mobilePhone: client.mobilePhone || client.phone || '',
    phone: client.phone,
    email: client.email,
    benefitNumber: client.benefitNumber,
    benefitType: client.benefitType,
    inssPassword: client.inssPassword || client.encryptedInssPassword,
    photoReference: client.photoReference,
    physicalFileLocation: client.physicalFileLocation,
    notes: client.notes,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Executive Client Header */}
      <ClientDetailHeader
        client={client}
        latestCaseUpdate={caseUpdates[0]}
        onOpenNewAttendance={() => setIsAttendanceModalOpen(true)}
        onOpenContracts={() => setIsContractModalOpen(true)}
        onOpenPdfReport={() => setIsPdfReportModalOpen(true)}
        onOpenMemoryCard={() => setIsMemoryCardOpen(true)}
        onStatusChange={handleStatusChange}
        onInactivateClick={() => setIsInactivateModalOpen(true)}
        onReactivateClick={handleReactivate}
        onSelectProcessTab={() => setActiveTab('process')}
      />

      {/* Closed Contract - Ready to File at INSS Callout */}
      {client.status === 'CLOSED' && caseUpdates.length === 0 && (
        <div className="p-4 bg-linear-to-r from-emerald-50 via-white to-amber-50/50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              🚀
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {t.clientDetails.closedContractCtaTitle}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {t.clientDetails.closedContractCtaSub}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab('process');
              setIsDirectInssModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.clientDetails.btnStartInssProcess}</span>
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex items-center gap-1 overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('attendances')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'attendances'
              ? 'bg-[#0B192E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4 text-[#C89543]" />
          <span>{t.clientDetails.tabAttendances}</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'attendances'
                ? 'bg-[#C89543] text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {attendances.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('process')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'process'
              ? 'bg-[#0B192E] text-white shadow-xs'
              : client.status === 'CLOSED'
              ? 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-4 h-4 text-[#C89543]" />
          <span>{t.clientDetails.tabCaseUpdates}</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'process'
                ? 'bg-[#C89543] text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {caseUpdates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#0B192E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4 text-[#C89543]" />
          <span>{t.clientDetails.tabRegistration}</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'documents'
              ? 'bg-[#0B192E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-[#C89543]" />
          <span>{t.clientDetails.tabDocuments}</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'diagnostic'
              ? 'bg-[#0B192E] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-4 h-4 text-[#C89543]" />
          <span>{t.clientDetails.tabDiagnostic}</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'attendances' && (
        <AttendanceTimeline
          attendances={attendances}
          onOpenNewAttendance={
            canAccess('receptionDesk') ? () => setIsAttendanceModalOpen(true) : undefined
          }
          onToggleDocumentDelivered={handleToggleDocumentDelivered}
          onFormalizeContract={
            canAccess('contractsAndFinancial') ? handleFormalizeContract : undefined
          }
        />
      )}

      {activeTab === 'process' && (
        <CaseUpdatesPanel
          clientId={client.id}
          clientName={client.fullName}
          clientPhone={client.mobilePhone || client.phone}
          initialUpdates={caseUpdates}
          onUpdateAdded={(newUp) => setCaseUpdates((prev) => [newUp, ...prev])}
        />
      )}

      {activeTab === 'profile' && (
        <ClientFullForm
          clientId={client.id}
          initialData={formInitialData}
          onSave={async (data, photoFile) => {
            const { createFullClientInDb, uploadClientPhotoToStorage } = await import('@/lib/services/client-service');

            let photoUrl: string | null | undefined =
              data.photoReference !== undefined ? data.photoReference : client.photoReference;
            if (photoFile && client.tenantId) {
              photoUrl = await uploadClientPhotoToStorage(photoFile, client.tenantId);
            }

            const updated = await createFullClientInDb(
              data,
              client.tenantId,
              {
                id: currentUser?.id || client.id,
                name: currentUser?.fullName || 'Operador',
              },
              photoUrl,
              client.id
            );

            setClient(updated);
            showToast('Dados cadastrais salvos com sucesso!');
          }}
        />
      )}

      {activeTab === 'documents' && (
        <DocumentVault clientId={client.id} clientName={client.fullName} />
      )}

      {activeTab === 'diagnostic' && <BenefitDiagnosticCard client={client} />}

      {/* Modals */}
      <NewAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        clientId={client.id}
        defaultObjective={formatBenefitType(client.benefitType, 'pt-BR') || 'Aposentadoria Rural - Segurado Especial'}
        onSave={handleSaveAttendance}
      />

      <LegalContractModal
        client={client}
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
      />

      <ClientPdfReportModal
        client={client}
        attendances={attendances}
        isOpen={isPdfReportModalOpen}
        onClose={() => setIsPdfReportModalOpen(false)}
      />

      <MemoryCardModal
        client={client}
        isOpen={isMemoryCardOpen}
        onClose={() => setIsMemoryCardOpen(false)}
        onUpdateClient={handleUpdateClientFromMemory}
      />

      <InactivateClientModal
        isOpen={isInactivateModalOpen}
        onClose={() => setIsInactivateModalOpen(false)}
        clientName={client.fullName}
        onConfirm={handleConfirmInactivation}
      />

      <NewCaseUpdateModal
        isOpen={isDirectInssModalOpen}
        onClose={() => setIsDirectInssModalOpen(false)}
        clientId={client.id}
        clientName={client.fullName}
        defaultProcessNumber={client.benefitNumber || 'Protocolo INSS nº 1234567890'}
        initialPreset="INSS_INIT"
        onSave={(newUp) => {
          setCaseUpdates((prev) => [newUp, ...prev]);
          showToast('Requerimento do INSS protocolado com sucesso! Acompanhamento iniciado.');
        }}
      />
    </div>
  );
}
