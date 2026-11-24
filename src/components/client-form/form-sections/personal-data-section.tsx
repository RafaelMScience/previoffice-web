'use client';

import React from 'react';
import { User, Camera, Move } from 'lucide-react';
import type { Translations } from '@/lib/i18n/types';
import type { MaritalStatus } from '@/types/client';
import { maskCpf, maskPhone } from '@/lib/utils/masks';

export interface PersonalDataSectionProps {
  t: Translations;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  photoPreview: string | null;
  onRemovePhoto: () => void;
  onAdjustPhotoPosition?: () => void;
  fullName: string;
  setFullName: (val: string) => void;
  linkedClientId: string | null | undefined;
  showSuggestions: boolean;
  setShowSuggestions: (val: boolean) => void;
  nameSuggestions: any[];
  onApplyClientData: (item: any) => void;
  cpf: string;
  setCpf: (val: string) => void;
  cpfValid: boolean | null;
  rg: string;
  setRg: (val: string) => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
  gender: 'M' | 'F' | 'OTHER';
  setGender: (val: 'M' | 'F' | 'OTHER') => void;
  maritalStatus: MaritalStatus;
  setMaritalStatus: (val: MaritalStatus) => void;
  profession: string;
  setProfession: (val: string) => void;
  motherName: string;
  setMotherName: (val: string) => void;
  fatherName: string;
  setFatherName: (val: string) => void;
}

export function PersonalDataSection({
  t,
  fileInputRef,
  handlePhotoUpload,
  photoPreview,
  onRemovePhoto,
  onAdjustPhotoPosition,
  fullName,
  setFullName,
  linkedClientId,
  showSuggestions,
  setShowSuggestions,
  nameSuggestions,
  onApplyClientData,
  cpf,
  setCpf,
  cpfValid,
  rg,
  setRg,
  birthDate,
  setBirthDate,
  gender,
  setGender,
  maritalStatus,
  setMaritalStatus,
  profession,
  setProfession,
  motherName,
  setMotherName,
  fatherName,
  setFatherName,
}: PersonalDataSectionProps) {
  return (
    <div id="personal" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <User className="w-5 h-5 text-[#C89543]" />
        <h2 className="text-base font-bold text-slate-800">{t.clientForm.sec1}</h2>
      </div>

      {/* Modern Avatar / Photo Upload Block with Camera Action */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-full border-2 border-[#C89543]/40 bg-white overflow-hidden flex items-center justify-center shadow-xs">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Foto do cliente"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-slate-300" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-[#082A52] text-white rounded-full hover:bg-[#0c396d] shadow-md transition-all cursor-pointer border-2 border-white"
            title="Tirar foto ou carregar arquivo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <h3 className="text-sm font-bold text-slate-800">
            {photoPreview ? 'Fotografia Cadastrada' : 'Foto Oficial do Cliente'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Formatos aceitos: JPG, PNG ou WEBP. A imagem passará por enquadramento guiado e será comprimida para menos de 100KB antes de ser arquivada no prontuário.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-[#082A52] hover:bg-[#0c396d] text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-[#C89543]" />
              <span>{photoPreview ? 'Alterar Fotografia' : 'Carregar Imagem'}</span>
            </button>

            {photoPreview && (
              <>
                {onAdjustPhotoPosition && (
                  <button
                    type="button"
                    onClick={onAdjustPhotoPosition}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium shadow-2xs transition-all"
                    title="Ajustar posição e zoom da foto"
                  >
                    <Move className="w-3.5 h-3.5 text-[#C89543]" />
                    <span>Ajustar posição</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onRemovePhoto}
                  className="px-2.5 py-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-all"
                >
                  Remover foto
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.clientForm.fullNameLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.clientForm.fullNamePlaceholder}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
            />
            {linkedClientId && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                Vinculado
              </span>
            )}
          </div>

          {/* Suggestions drop-down for matching prospects from fast intake */}
          {showSuggestions && nameSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden divide-y divide-slate-100">
              <div className="p-2 bg-slate-50 text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                <span>Cadastros encontrados na recepção rápida:</span>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              {nameSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onApplyClientData(item)}
                  className="w-full p-2.5 text-left hover:bg-amber-50 flex items-center justify-between transition-colors group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#C89543]">
                      {item.full_name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {item.cpf ? `CPF: ${maskCpf(item.cpf)}` : 'Sem CPF informado'} • {maskPhone(item.mobile_phone)}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#082A52] bg-slate-100 group-hover:bg-[#C89543]/20 px-2 py-1 rounded">
                    Puxar Dados &rarr;
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.clientForm.cpfLabel}
          </label>
          <input
            type="text"
            maxLength={14}
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            placeholder={t.clientForm.cpfPlaceholder}
            className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 text-slate-900 font-mono ${
              cpfValid === false
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-200 focus:ring-[#C89543] focus:bg-white'
            }`}
          />
          {cpfValid === false && (
            <span className="text-[11px] text-red-600 font-medium">{t.clientForm.cpfInvalid}</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.rgLabel}</label>
          <input
            type="text"
            value={rg}
            onChange={(e) => setRg(e.target.value)}
            placeholder={t.clientForm.rgPlaceholder}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.birthDateLabel}</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.genderLabel}</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          >
            <option value="F">{t.clientForm.genderFemale}</option>
            <option value="M">{t.clientForm.genderMale}</option>
            <option value="OTHER">{t.clientForm.genderOther}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.maritalStatusLabel}</label>
          <select
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          >
            <option value="SINGLE">{t.clientForm.statusSingle}</option>
            <option value="MARRIED">{t.clientForm.statusMarried}</option>
            <option value="STABLE_UNION">{t.clientForm.statusStableUnion}</option>
            <option value="DIVORCED">{t.clientForm.statusDivorced}</option>
            <option value="WIDOWED">{t.clientForm.statusWidowed}</option>
            <option value="SEPARATED">{t.clientForm.statusSeparated}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.professionLabel}</label>
          <input
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder={t.clientForm.professionPlaceholder}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.motherNameLabel}</label>
          <input
            type="text"
            value={motherName}
            onChange={(e) => setMotherName(e.target.value)}
            placeholder={t.clientForm.motherNamePlaceholder}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.fatherNameLabel}</label>
          <input
            type="text"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
            placeholder={t.clientForm.fatherNamePlaceholder}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
        </div>
      </div>
    </div>
  );
}
