'use client';

import React, { useState } from 'react';
import { LegalContractModal } from '@/components/client-details/legal-contract-modal';
import type { Client } from '@/types/client';
import { Eye, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const MOCK_PREVIEW_CLIENT: Client = {
  id: '00000000-0000-0000-0000-000000000001',
  tenantId: '00000000-0000-0000-0000-000000000001',
  fullName: 'Maria Francisca da Silva',
  normalizedName: 'MARIA FRANCISCA DA SILVA',
  cpf: '123.456.789-09',
  normalizedCpf: '12345678909',
  rg: '1.234.567 SSP/PB',
  birthDate: '1965-04-12',
  maritalStatus: 'MARRIED',
  profession: 'Agricultora / Segurada Especial',
  nationality: 'Brasileira',
  street: 'Sítio Boa Esperança, Zona Rural',
  streetNumber: 'S/N',
  neighborhood: 'Área Rural',
  city: 'Campina Grande',
  state: 'PB',
  postalCode: '58400-000',
  phone: '(83) 98765-4321',
  mobilePhone: '(83) 98765-4321',
  email: 'maria.francisca@exemplo.com',
  physicalFileLocation: 'Armário B - Gaveta 03 - Pasta 42',
  benefitType: 'Aposentadoria Rural - Segurado Especial',
  visitCount: 1,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function PreviewContratoPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/contracts"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                Ambiente de Visualização — Emissão de Procuração e Contrato OAB
              </h1>
              <p className="text-xs text-slate-400">
                Modelo temporário para homologação visual de rolagem, responsividade e minutas.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg shadow transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reabrir Modal
          </button>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Cliente em Homologação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-500 block">Nome Completo</span>
              <span className="font-semibold text-slate-200">{MOCK_PREVIEW_CLIENT.fullName}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-500 block">CPF / RG</span>
              <span className="font-semibold text-slate-200">
                {MOCK_PREVIEW_CLIENT.cpf} • {MOCK_PREVIEW_CLIENT.rg}
              </span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-500 block">Benefício / Objeto</span>
              <span className="font-semibold text-amber-400">{MOCK_PREVIEW_CLIENT.benefitType}</span>
            </div>
          </div>
        </div>

        {/* Modal de Contrato e Procuração */}
        <LegalContractModal
          client={MOCK_PREVIEW_CLIENT}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onContractIssued={(num) => {
            alert(`Contrato formalizado com sucesso: ${num}`);
            setIsModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}
