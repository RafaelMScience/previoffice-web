'use client';

import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import type { Client } from '@/types/client';
import { maskPhone } from '@/lib/utils/masks';

interface ClientReportAddressSectionProps {
  client: Client;
  includeAddressAndContacts: boolean;
  isEn: boolean;
}

export function ClientReportAddressSection({
  client,
  includeAddressAndContacts,
  isEn,
}: ClientReportAddressSectionProps) {
  if (!includeAddressAndContacts) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
      {/* Endereço */}
      <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1.5">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
          <div className="w-4 h-4 rounded bg-[#EEF6FD] text-[#0B78D0] flex items-center justify-center shrink-0">
            <MapPin className="w-2.5 h-2.5" />
          </div>
          <h3 className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider">
            {isEn ? 'Residential Address' : 'Endereço Residencial'}
          </h3>
        </div>

        <div className="space-y-0.5 text-xs">
          <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
            <span className="text-slate-500 shrink-0">{isEn ? 'Street:' : 'Logradouro:'}</span>
            <span className="font-medium text-[#16324F] text-right truncate pl-2">
              {client.street || (isEn ? 'Not informed' : 'Não informado')}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
            <span className="text-slate-500 shrink-0">{isEn ? 'Number & Compl:' : 'Número e Compl:'}</span>
            <span className="font-medium text-[#16324F] text-right truncate pl-2">
              {client.streetNumber || 'S/N'}{' '}
              {client.complement ? `(${client.complement})` : ''}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
            <span className="text-slate-500 shrink-0">{isEn ? 'Neighborhood:' : 'Bairro:'}</span>
            <span className="font-medium text-[#16324F] text-right truncate pl-2">
              {client.neighborhood || (isEn ? 'Not informed' : 'Não informado')}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
            <span className="text-slate-500 shrink-0">{isEn ? 'City & State:' : 'Cidade e UF:'}</span>
            <span className="font-medium text-[#16324F] text-right truncate pl-2">
              {client.city ? `${client.city} - ${client.state || 'AM'}` : (isEn ? 'Not informed' : 'Não informado')}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500 shrink-0">{isEn ? 'Postal Code (CEP):' : 'CEP:'}</span>
            <span className="font-mono font-medium text-[#16324F] text-right">
              {client.postalCode || (isEn ? 'Not informed' : 'Não informado')}
            </span>
          </div>
        </div>
      </div>

      {/* Contatos */}
      <div className="w-full min-w-0 bg-white border border-[#D8E5EF] rounded-lg p-3 space-y-1.5">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
          <div className="w-4 h-4 rounded bg-[#EEF6FD] text-[#0B78D0] flex items-center justify-center shrink-0">
            <Phone className="w-2.5 h-2.5" />
          </div>
          <h3 className="text-[11px] font-bold text-[#082A52] uppercase tracking-wider">
            {isEn ? 'Contacts & Phone Numbers' : 'Contatos e Telefones'}
          </h3>
        </div>

        <div className="space-y-0.5 text-xs">
          <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
            <span className="text-slate-500 shrink-0">{isEn ? 'Mobile Phone:' : 'Celular e WhatsApp:'}</span>
            <span className="font-medium text-[#16324F] text-right truncate pl-2 font-mono">
              {client.mobilePhone ? maskPhone(client.mobilePhone) : (isEn ? 'Not informed' : 'Não informado')}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
            <span className="text-slate-500 shrink-0">{isEn ? 'Landline Phone:' : 'Telefone Fixo:'}</span>
            <span className="font-medium text-[#16324F] text-right truncate pl-2 font-mono">
              {client.phone ? maskPhone(client.phone) : (isEn ? 'Not informed' : 'Não informado')}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500 shrink-0">{isEn ? 'Email:' : 'E-mail:'}</span>
            <span className="font-medium text-[#16324F] text-right truncate pl-2 lowercase">
              {client.email || (isEn ? 'Not informed' : 'Não informado')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
