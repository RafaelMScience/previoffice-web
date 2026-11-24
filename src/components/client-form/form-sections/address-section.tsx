'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { maskCep } from '@/lib/utils/masks';

export interface AddressSectionProps {
  t: any;
  postalCode: string;
  setPostalCode: (val: string) => void;
  street: string;
  setStreet: (val: string) => void;
  streetNumber: string;
  setStreetNumber: (val: string) => void;
  complement: string;
  setComplement: (val: string) => void;
  neighborhood: string;
  setNeighborhood: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  state: string;
  setState: (val: string) => void;
}

export function AddressSection({
  t,
  postalCode,
  setPostalCode,
  street,
  setStreet,
  streetNumber,
  setStreetNumber,
  complement,
  setComplement,
  neighborhood,
  setNeighborhood,
  city,
  setCity,
  state,
  setState,
}: AddressSectionProps) {
  return (
    <div id="address" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <MapPin className="w-5 h-5 text-[#C89543]" />
        <h2 className="text-base font-bold text-slate-800">{t.clientForm.sec2}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.zipCodeLabel}</label>
          <input
            type="text"
            maxLength={9}
            value={postalCode}
            onChange={(e) => setPostalCode(maskCep(e.target.value))}
            placeholder="58000-000"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-mono"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.streetLabel}</label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder={t.clientForm.streetPlaceholder}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.numberLabel}</label>
          <input
            type="text"
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            placeholder="123 or S/N"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.complementLabel}</label>
          <input
            type="text"
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
            placeholder="Apt 201, Bloco B"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.neighborhoodLabel}</label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Centro, Zona Rural..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.cityLabel}</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="João Pessoa, Campina Grande..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.stateLabel}</label>
          <input
            type="text"
            value={state}
            maxLength={2}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>
      </div>
    </div>
  );
}
