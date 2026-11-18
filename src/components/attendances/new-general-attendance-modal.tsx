'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Clock,
  User,
  FileText,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { MOCK_CLIENTS_MAP, type AttendanceWithClient } from '@/lib/data/mock-clients';
import type { AttendanceType, PendingPhysicalDocument } from '@/types/attendance';

interface NewGeneralAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attendance: AttendanceWithClient) => void;
}

export function NewGeneralAttendanceModal({
  isOpen,
  onClose,
  onSave,
}: NewGeneralAttendanceModalProps) {
  const { t } = useI18n();

  const clientOptions = Object.values(MOCK_CLIENTS_MAP).filter(
    (b, idx, arr) => arr.findIndex((x) => x.client.id === b.client.id) === idx
  );

  const [selectedClientId, setSelectedClientId] = useState(clientOptions[0]?.client.id || 'cli-001');
  const [attendanceType, setAttendanceType] = useState<AttendanceType>('RETURN_DOCUMENTS');
  const [attendantName, setAttendantName] = useState('Dr. Alexandre Pontes');
  const [objective, setObjective] = useState('Aposentadoria Rural - Entrega de Documentos e ITR');
  const [narrativeHistory, setNarrativeHistory] = useState('');
  const [strategyNotes, setStrategyNotes] = useState('');
  const [pendingDocs, setPendingDocs] = useState<PendingPhysicalDocument[]>([
    { id: '1', description: 'Extrato Previdenciário do CNIS atualizado', isDelivered: false },
    { id: '2', description: 'Comprovante de residência no meio rural recente', isDelivered: true },
  ]);
  const [newDocText, setNewDocText] = useState('');
  const [physicalFileLocation, setPhysicalFileLocation] = useState('Armário B - Gaveta 03 - Pasta 2026-042');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddDoc = () => {
    if (!newDocText.trim()) return;
    setPendingDocs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        description: newDocText.trim(),
        isDelivered: false,
      },
    ]);
    setNewDocText('');
  };

  const handleRemoveDoc = (id: string) => {
    setPendingDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleToggleDoc = (id: string) => {
    setPendingDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isDelivered: !d.isDelivered } : d))
    );
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const bundle = MOCK_CLIENTS_MAP[clientId];
    if (bundle) {
      setObjective(bundle.client.benefitType || 'Benefício Previdenciário');
      setPhysicalFileLocation(bundle.client.physicalFileLocation || 'Arquivo Geral - Pasta Principal');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const clientBundle = MOCK_CLIENTS_MAP[selectedClientId];
    const client = clientBundle?.client;

    const newAttendance: AttendanceWithClient = {
      id: `att-${Date.now()}`,
      tenantId: 'tenant-default',
      clientId: selectedClientId,
      clientName: client?.fullName || 'Cliente do Escritório',
      clientCpf: client?.cpf || '000.000.000-00',
      clientPhone: client?.mobilePhone || client?.phone,
      clientBenefitType: client?.benefitType,
      attendanceType,
      attendedAt: new Date().toISOString(),
      objective: objective.trim() || 'Atendimento de Balcão',
      narrativeHistory: narrativeHistory.trim() || undefined,
      notes: strategyNotes.trim() || undefined,
      attendantName,
      pendingDocuments: pendingDocs,
      physicalFileLocation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newAttendance);
    setIsSubmitting(false);
    onClose();
  };

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
            <span>Registro de Atendimento Presencial</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            Novo Atendimento / Retorno de Cliente
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Registre o cliente atendido hoje, os fatos relatados, documentos entregues e orientações dadas.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Row 1: Client Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cliente Atendido *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-bold"
            >
              {clientOptions.map((opt) => (
                <option key={opt.client.id} value={opt.client.id}>
                  {opt.client.fullName} — CPF: {opt.client.cpf} ({opt.client.benefitType})
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: Attendant & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Advogado / Responsável pelo Atendimento *
              </label>
              <select
                value={attendantName}
                onChange={(e) => setAttendantName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white"
              >
                <option value="Dr. Alexandre Pontes">Dr. Alexandre Pontes (Advogado Titular)</option>
                <option value="Dra. Camila Vasconcelos">Dra. Camila Vasconcelos (Advogada Associada)</option>
                <option value="Camila Recepção">Camila Recepção (Triagem e Balcão)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Atendimento *
              </label>
              <select
                value={attendanceType}
                onChange={(e) => setAttendanceType(e.target.value as AttendanceType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white font-medium"
              >
                <option value="RETURN_DOCUMENTS">Retorno para Entrega de Documentos</option>
                <option value="RETURN">Retorno para Consulta / Andamento</option>
                <option value="FIRST_CONSULTATION">1ª Consulta / Triagem Inicial</option>
                <option value="CONTRACT_SIGNING">Assinatura de Contrato e Procuração</option>
                <option value="GUIDANCE">Orientação Jurídica Geral</option>
              </select>
            </div>
          </div>

          {/* Row 3: Objective & Physical File Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objetivo / Benefício Tratado *
              </label>
              <input
                type="text"
                required
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Localização da Pasta no Arquivo
              </label>
              <input
                type="text"
                value={physicalFileLocation}
                onChange={(e) => setPhysicalFileLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Narrative History */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Relato dos Fatos Narrados pelo Segurado
            </label>
            <textarea
              rows={3}
              value={narrativeHistory}
              onChange={(e) => setNarrativeHistory(e.target.value)}
              placeholder="Descreva o que o cliente relatou hoje nesta visita (ex: novos vínculos, período rural trabalhado, testemunhas, problemas médicos)..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white resize-none"
            />
          </div>

          {/* Legal Strategy */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Orientação Jurídica & Próximos Passos
            </label>
            <textarea
              rows={2}
              value={strategyNotes}
              onChange={(e) => setStrategyNotes(e.target.value)}
              placeholder="Qual foi a conduta definida? Ex: Aguardar perícia médica, requerer retificação de CNIS no Meu INSS..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white resize-none"
            />
          </div>

          {/* Document Checklist */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="block text-xs font-bold text-slate-800">
              Checklist de Documentos da Visita
            </span>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {pendingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={doc.isDelivered}
                      onChange={() => handleToggleDoc(doc.id)}
                      className="rounded text-[#C89543] focus:ring-[#C89543]"
                    />
                    <span className={doc.isDelivered ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'}>
                      {doc.description}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newDocText}
                onChange={(e) => setNewDocText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDoc();
                  }
                }}
                placeholder="Adicionar documento (ex: ITR 2023, Certidão de Casamento)..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543]"
              />
              <button
                type="button"
                onClick={handleAddDoc}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B192E] hover:bg-[#142642] rounded-xl shadow-xs transition-colors"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
