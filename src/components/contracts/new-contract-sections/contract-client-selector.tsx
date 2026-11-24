'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';
import { formatBenefitType } from '@/lib/utils/benefit-translations';

export interface ClientOption {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  location: string;
  benefit: string;
}

interface ContractClientSelectorProps {
  clientOptions: ClientOption[];
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
  locale: string;
}

export function ContractClientSelector({
  clientOptions,
  selectedClientId,
  onClientChange,
  locale,
}: ContractClientSelectorProps) {
  const isEn = locale === 'en-US';

  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
        <UserCheck className="w-3.5 h-3.5 text-[#0B78D0]" />
        <span>{isEn ? '1. Select Law Firm Client *' : '1. Selecionar Cliente da Banca *'}</span>
      </label>
      {clientOptions.length === 0 ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          {isEn
            ? 'No clients registered in this law firm. Please register a client before drafting a contract.'
            : 'Nenhum cliente cadastrado neste escritório. Cadastre um cliente antes de formalizar um contrato.'}
        </div>
      ) : (
        <select
          value={selectedClientId}
          onChange={(e) => onClientChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 font-medium"
        >
          {clientOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} • {isEn ? 'Tax ID' : 'CPF'}: {c.cpf}{' '}
              {c.benefit ? `(${formatBenefitType(c.benefit, isEn ? 'en-US' : 'pt-BR')})` : ''}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
