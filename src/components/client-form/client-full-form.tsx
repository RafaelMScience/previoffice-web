'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  User,
  MapPin,
  Phone,
  Award,
  Save,
  ArrowLeft,
  CheckCircle,
  Calculator,
  Lock,
} from 'lucide-react';
import { isValidCpf } from '@/lib/domain/cpf-validator';
import { calculateAge, checkRuralRetirementAge } from '@/lib/domain/benefit-rules';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { ClientFullRegistrationInput } from '@/lib/schemas/client-schema';
import type { MaritalStatus, SpecialCategory } from '@/types/client';

interface ClientFullFormProps {
  initialData?: Partial<ClientFullRegistrationInput>;
  clientId?: string;
  onSave?: (data: ClientFullRegistrationInput) => Promise<void>;
}

export function ClientFullForm({ initialData, clientId, onSave }: ClientFullFormProps) {
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [cpf, setCpf] = useState(initialData?.cpf || '');
  const [rg, setRg] = useState(initialData?.rg || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [gender, setGender] = useState<'M' | 'F' | 'OTHER'>('F');
  const [motherName, setMotherName] = useState(initialData?.motherName || '');
  const [fatherName, setFatherName] = useState(initialData?.fatherName || '');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('SINGLE');
  const [profession, setProfession] = useState(initialData?.profession || '');

  // Address
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || '');
  const [street, setStreet] = useState(initialData?.street || '');
  const [streetNumber, setStreetNumber] = useState(initialData?.streetNumber || '');
  const [complement, setComplement] = useState(initialData?.complement || '');
  const [neighborhood, setNeighborhood] = useState(initialData?.neighborhood || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [state, setState] = useState(initialData?.state || 'PB');

  // Contact
  const [mobilePhone, setMobilePhone] = useState(initialData?.mobilePhone || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');

  // Social Security Credentials
  const [benefitNumber, setBenefitNumber] = useState(initialData?.benefitNumber || '');
  const [inssPassword, setInssPassword] = useState(initialData?.inssPassword || '');

  // Benefit specifics
  const [benefitType, setBenefitType] = useState(initialData?.benefitType || 'BPC/LOAS Elderly');
  const [specialCategory, setSpecialCategory] = useState<SpecialCategory>('URBAN_COMMON');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [physicalFileLocation, setPhysicalFileLocation] = useState(initialData?.physicalFileLocation || '');

  // Derived computations
  const ageCalc = birthDate ? calculateAge(birthDate) : null;
  const age = ageCalc ? ageCalc.years : null;
  const cpfValid = cpf && cpf.length === 11 ? isValidCpf(cpf) : null;

  const isLoasElderlyAge = age !== null && age >= 65;
  const genderEnum = gender === 'M' ? 'MALE' : gender === 'F' ? 'FEMALE' : null;
  const ruralRetirementCheck =
    age !== null && genderEnum ? checkRuralRetirementAge(genderEnum, age) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload: ClientFullRegistrationInput = {
        fullName,
        cpf: cpf ? cpf.replace(/\D/g, '') : undefined,
        rg: rg || undefined,
        birthDate: birthDate || undefined,
        maritalStatus,
        profession: profession || undefined,
        nationality: 'Brasileira',
        motherName: motherName || undefined,
        fatherName: fatherName || undefined,
        postalCode: postalCode || undefined,
        street: street || undefined,
        streetNumber: streetNumber || undefined,
        complement: complement || undefined,
        neighborhood: neighborhood || undefined,
        city: city || undefined,
        state: state || undefined,
        mobilePhone,
        phone: phone || undefined,
        email: email || undefined,
        benefitType,
        hasActiveBenefit: false,
        benefitNumber: benefitNumber || undefined,
        specialCategories: [specialCategory],
        dependentCount: 0,
        inssPassword: inssPassword || undefined,
        notes: notes || undefined,
        physicalFileLocation: physicalFileLocation || undefined,
      };

      if (onSave) {
        await onSave(payload);
      }
      setSuccessMessage(t.clientForm.saveSuccess);
      setTimeout(() => setSuccessMessage(null), 4000);
    });
  };

  return (
    <div className="flex gap-8 relative">
      {/* Anchor Navigation Sidebar (Sticky) */}
      <aside className="w-56 hidden xl:block flex-shrink-0 sticky top-20 self-start">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            {t.clientForm.secNav}
          </div>
          <nav className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            <a
              href="#personal"
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#C89543] flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.clientForm.sec1}</span>
            </a>
            <a
              href="#address"
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#C89543] flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.clientForm.sec2}</span>
            </a>
            <a
              href="#contact"
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#C89543] flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t.clientForm.sec3}</span>
            </a>
            <a
              href="#inss"
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#C89543] flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t.clientForm.sec4}</span>
            </a>
            <a
              href="#benefit"
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-[#C89543] flex items-center gap-2"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t.clientForm.sec5}</span>
            </a>
          </nav>

          {/* Quick Legal Pre-Analysis Box */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-[11px] font-bold text-[#0B192E] flex items-center gap-1.5 mb-2">
              <Calculator className="w-3.5 h-3.5 text-[#C89543]" />
              <span>{t.clientForm.rulesEngineTitle}</span>
            </div>
            {age !== null ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>{t.clientForm.computedAgeLabel}</span>
                  <span className="font-bold text-slate-900">{age} {t.clientForm.yearsOld}</span>
                </div>
                {isLoasElderlyAge && (
                  <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-[11px] font-medium border border-emerald-200">
                    {t.clientForm.loasEligibleNotice}
                  </div>
                )}
                {ruralRetirementCheck && ruralRetirementCheck.isEligibleAge && (
                  <div className="bg-amber-50 text-amber-800 p-2 rounded text-[11px] font-medium border border-amber-200">
                    {t.clientForm.ruralEligibleNotice} ({gender === 'F' ? '55' : '60'} {t.clientForm.yearsOld}).
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                {t.clientForm.fillBirthDateHint}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Form Area */}
      <div className="flex-1 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-xl font-bold text-slate-900">
                  {clientId ? t.clientForm.titleEdit : t.clientForm.titleNew}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-7">
                {t.clientForm.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {successMessage && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {successMessage}
                </span>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-lg bg-[#0B192E] text-white font-semibold text-sm hover:bg-[#142642] flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#C89543]" />
                <span>{isPending ? t.clientForm.btnSaving : t.clientForm.btnSave}</span>
              </button>
            </div>
          </div>

          {/* Section 1: Personal Identification */}
          <div id="personal" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-[#C89543]" />
              <h2 className="text-base font-bold text-slate-800">{t.clientForm.sec1}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.clientForm.fullNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.clientForm.fullNamePlaceholder}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.clientForm.cpfLabel}
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.clientForm.cpfPlaceholder}
                  className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 text-slate-900 ${
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

          {/* Section 2: Address & Residence */}
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
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="58000-000"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
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

          {/* Section 3: Contact Details */}
          <div id="contact" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Phone className="w-5 h-5 text-[#C89543]" />
              <h2 className="text-base font-bold text-slate-800">{t.clientForm.sec3}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.clientForm.mobilePhoneLabel}
                </label>
                <input
                  type="text"
                  required
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  placeholder="(83) 98888-0000"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.clientForm.secondaryPhoneLabel}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(83) 99999-1111"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Social Security Credentials */}
          <div id="inss" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock className="w-5 h-5 text-[#C89543]" />
              <h2 className="text-base font-bold text-slate-800">{t.clientForm.sec4}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.benefitNumberLabel}</label>
                <input
                  type="text"
                  value={benefitNumber}
                  onChange={(e) => setBenefitNumber(e.target.value)}
                  placeholder="123.456.789-0"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.clientForm.inssPasswordLabel}
                </label>
                <input
                  type="password"
                  value={inssPassword}
                  onChange={(e) => setInssPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.physicalLocationLabel}</label>
                <input
                  type="text"
                  value={physicalFileLocation}
                  onChange={(e) => setPhysicalFileLocation(e.target.value)}
                  placeholder={t.clientForm.physicalLocationPlaceholder}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Benefit & Special Category */}
          <div id="benefit" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Award className="w-5 h-5 text-[#C89543]" />
              <h2 className="text-base font-bold text-slate-800">{t.clientForm.sec5}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.clientForm.desiredBenefitLabel}
                </label>
                <select
                  value={benefitType}
                  onChange={(e) => setBenefitType(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-medium"
                >
                  <option value="BPC/LOAS Elderly">BPC / LOAS - Idoso (≥ 65 anos)</option>
                  <option value="BPC/LOAS Disability">BPC / LOAS - Pessoa com Deficiência (PCD)</option>
                  <option value="Rural Retirement">Aposentadoria Rural - Segurado Especial</option>
                  <option value="Age Retirement Urban">Aposentadoria Urbana por Idade</option>
                  <option value="Temporary Disability">Benefício por Incapacidade Temporária (Auxílio-Doença)</option>
                  <option value="Permanent Disability">Aposentadoria por Incapacidade Permanente</option>
                  <option value="Death Pension">Pensão por Morte</option>
                  <option value="Maternity Benefit">Salário-Maternidade Rural/Urbano</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.clientForm.specialCategoryLabel}</label>
                <select
                  value={specialCategory}
                  onChange={(e) => setSpecialCategory(e.target.value as SpecialCategory)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
                >
                  <option value="URBAN_COMMON">{t.clientForm.catUrban}</option>
                  <option value="RURAL">{t.clientForm.catRural}</option>
                  <option value="PCD">{t.clientForm.catPcd}</option>
                  <option value="SPECIAL_HAZARDOUS">{t.clientForm.catHazardous}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.clientForm.notesLabel}
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.clientForm.notesPlaceholder}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
