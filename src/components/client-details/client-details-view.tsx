'use client';

import React, { useState } from 'react';
import {
  Clock,
  User,
  FolderOpen,
  Scale,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { ClientDetailHeader } from './client-detail-header';
import { AttendanceTimeline } from './attendance-timeline';
import { NewAttendanceModal } from './new-attendance-modal';
import { DocumentVault } from './document-vault';
import { BenefitDiagnosticCard } from './benefit-diagnostic-card';
import { LegalContractModal } from './legal-contract-modal';
import { InactivateClientModal } from './inactivate-client-modal';
import { MemoryCardModal } from '@/components/memory-card/memory-card-modal';
import { ClientFullForm } from '@/components/client-form/client-full-form';
import type { Client, ClientStatus } from '@/types/client';
import type { Attendance } from '@/types/attendance';
import type { ClientFullRegistrationInput } from '@/lib/schemas/client-schema';

interface ClientDetailsViewProps {
  initialClient: Client;
  initialAttendances: Attendance[];
}

export function ClientDetailsView({
  initialClient,
  initialAttendances,
}: ClientDetailsViewProps) {
  const { t } = useI18n();

  const [client, setClient] = useState<Client>(initialClient);
  const [attendances, setAttendances] = useState<Attendance[]>(initialAttendances);
  const [activeTab, setActiveTab] = useState<'attendances' | 'profile' | 'documents' | 'diagnostic'>('attendances');

  // Modals state
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isMemoryCardOpen, setIsMemoryCardOpen] = useState(false);
  const [isInactivateModalOpen, setIsInactivateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleToggleDocumentDelivered = (attendanceId: string, docId: string) => {
    setAttendances((prev) =>
      prev.map((att) => {
        if (att.id !== attendanceId || !att.pendingDocuments) return att;
        return {
          ...att,
          pendingDocuments: att.pendingDocuments.map((doc) =>
            doc.id === docId ? { ...doc, isDelivered: !doc.isDelivered } : doc
          ),
        };
      })
    );
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
        onOpenNewAttendance={() => setIsAttendanceModalOpen(true)}
        onOpenContracts={() => setIsContractModalOpen(true)}
        onOpenMemoryCard={() => setIsMemoryCardOpen(true)}
        onStatusChange={handleStatusChange}
        onInactivateClick={() => setIsInactivateModalOpen(true)}
        onReactivateClick={handleReactivate}
      />

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
          onOpenNewAttendance={() => setIsAttendanceModalOpen(true)}
          onToggleDocumentDelivered={handleToggleDocumentDelivered}
          onFormalizeContract={handleFormalizeContract}
        />
      )}

      {activeTab === 'profile' && (
        <ClientFullForm
          clientId={client.id}
          initialData={formInitialData}
          onSave={async (data) => {
            setClient((prev) => ({
              ...prev,
              fullName: data.fullName,
              cpf: data.cpf,
              rg: data.rg,
              birthDate: data.birthDate,
              maritalStatus: data.maritalStatus,
              profession: data.profession,
              motherName: data.motherName,
              fatherName: data.fatherName,
              postalCode: data.postalCode,
              street: data.street,
              streetNumber: data.streetNumber,
              complement: data.complement,
              neighborhood: data.neighborhood,
              city: data.city,
              state: data.state,
              mobilePhone: data.mobilePhone,
              phone: data.phone,
              email: data.email,
              benefitType: data.benefitType,
              benefitNumber: data.benefitNumber,
              notes: data.notes,
            }));
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
        defaultObjective={client.benefitType || 'Aposentadoria Rural - Segurado Especial'}
        onSave={handleSaveAttendance}
      />

      <LegalContractModal
        client={client}
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
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
    </div>
  );
}
