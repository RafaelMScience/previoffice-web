'use client';

import React, { useState, useTransition, useEffect, useCallback } from 'react';
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
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  Camera,
  AlertCircle,
  Search,
  Sparkles,
  Move,
  Loader2,
} from 'lucide-react';
import { AvatarCropModal } from './avatar-crop-modal';
import { LegalPreAnalysisSidebar } from './form-sections/legal-pre-analysis-sidebar';
import { AddressSection } from './form-sections/address-section';
import { InssAccessSection } from './form-sections/inss-access-section';
import { isValidCpf } from '@/lib/domain/cpf-validator';
import { maskCpf, maskPhone, maskCep, maskBenefitNumber } from '@/lib/utils/masks';
import { compressAvatarPhoto } from '@/lib/utils/image-compressor';
import { calculateAge, checkRuralRetirementAge } from '@/lib/domain/benefit-rules';
import { formatBenefitType, getCanonicalBenefitKey } from '@/lib/utils/benefit-translations';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { securityStore } from '@/lib/data/mock-security';
import type { ClientFullRegistrationInput } from '@/lib/schemas/client-schema';
import type { MaritalStatus, SpecialCategory } from '@/types/client';

interface ClientFullFormProps {
  initialData?: Partial<ClientFullRegistrationInput>;
  clientId?: string;
  onSave?: (data: ClientFullRegistrationInput, photoFile?: File, linkedClientId?: string) => Promise<void>;
}

export function ClientFullForm({ initialData, clientId, onSave }: ClientFullFormProps) {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkedClientId, setLinkedClientId] = useState<string | undefined>(clientId);
  const [fastIntakeNotice, setFastIntakeNotice] = useState<string | null>(null);

  // Autocomplete / Search suggestions by name
  const [nameSuggestions, setNameSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Photo upload and cropping state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoReference || null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [rawFileName, setRawFileName] = useState<string>('avatar.webp');

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (rawImageForCrop?.startsWith('blob:')) {
        URL.revokeObjectURL(rawImageForCrop);
      }
      if (photoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [rawImageForCrop, photoPreview]);

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    if (photoPreview?.startsWith('blob:') && photoPreview !== previewUrl) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(croppedFile);
    setPhotoPreview(previewUrl);
  };

  // Form state
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [cpf, setCpf] = useState(initialData?.cpf ? maskCpf(initialData.cpf) : '');
  const [rg, setRg] = useState(initialData?.rg || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [gender, setGender] = useState<'M' | 'F' | 'OTHER'>('F');
  const [motherName, setMotherName] = useState(initialData?.motherName || '');
  const [fatherName, setFatherName] = useState(initialData?.fatherName || '');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('SINGLE');
  const [profession, setProfession] = useState(initialData?.profession || '');

  // Address
  const [postalCode, setPostalCode] = useState(initialData?.postalCode ? maskCep(initialData.postalCode) : '');
  const [street, setStreet] = useState(initialData?.street || '');
  const [streetNumber, setStreetNumber] = useState(initialData?.streetNumber || '');
  const [complement, setComplement] = useState(initialData?.complement || '');
  const [neighborhood, setNeighborhood] = useState(initialData?.neighborhood || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [state, setState] = useState(initialData?.state || 'AM');

  // Contact
  const [mobilePhone, setMobilePhone] = useState(initialData?.mobilePhone ? maskPhone(initialData.mobilePhone) : '');
  const [phone, setPhone] = useState(initialData?.phone ? maskPhone(initialData.phone) : '');
  const [email, setEmail] = useState(initialData?.email || '');

  // Social Security Credentials
  const [benefitNumber, setBenefitNumber] = useState(initialData?.benefitNumber ? maskBenefitNumber(initialData.benefitNumber) : '');
  const [inssPassword, setInssPassword] = useState(
    initialData?.inssPassword || ''
  );
  const [showInssPassword, setShowInssPassword] = useState(false);
  const [isCopiedInss, setIsCopiedInss] = useState(false);
  const [isRevealingInss, setIsRevealingInss] = useState(false);

  // Sync initial INSS password whenever initialData updates
  useEffect(() => {
    if (initialData?.inssPassword) {
      setInssPassword(initialData.inssPassword);
    }
  }, [initialData?.inssPassword]);

  // Sync initial photoPreview whenever initialData updates
  useEffect(() => {
    if (initialData?.photoReference) {
      setPhotoPreview(initialData.photoReference);
    }
  }, [initialData?.photoReference]);

  // Controlled auto-hide with React lifecycle cleanup
  useEffect(() => {
    if (!showInssPassword) return;
    const timer = setTimeout(() => {
      setShowInssPassword(false);
      if (initialData?.inssPassword && (clientId || (initialData as any)?.id)) {
        setInssPassword('••••••••');
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [showInssPassword, initialData?.inssPassword, clientId, (initialData as any)?.id]);

  const toggleShowInssPassword = async () => {
    if (!showInssPassword) {
      const targetId = clientId || (initialData as any)?.id;
      // If password is masked, fetch decrypted plaintext on-demand via authenticated API
      if (inssPassword === '••••••••' && targetId) {
        try {
          setIsRevealingInss(true);
          const res = await fetch(`/api/clients/${targetId}/inss-password`, {
            method: 'POST',
          });
          const data = await res.json();
          if (data.success) {
            setInssPassword(data.password || '');
            setShowInssPassword(true);
          } else {
            setErrorMessage(data.error || 'Não foi possível revelar a senha do INSS.');
          }
        } catch (err) {
          console.error('Failed to reveal INSS password:', err);
          setErrorMessage('Erro de conexão ao revelar a senha do INSS.');
        } finally {
          setIsRevealingInss(false);
        }
      } else {
        setShowInssPassword(true);
      }

      if (inssPassword && inssPassword !== '••••••••') {
        securityStore.logEvent({
          actorId: currentUser?.id || 'usr-001',
          actorName: currentUser?.fullName || 'Operador',
          actorRole: currentUser?.memberType || 'LAWYER',
          action: 'VIEW_INSS_PASSWORD',
          actionDescription: `Visualizou a senha do Meu INSS do cliente ${fullName || initialData?.fullName || 'Cadastro'}`,
          targetResource: `Cliente ${clientId || initialData?.cpf || 'Novo'} - Credenciais Meu INSS`,
          clientId: clientId,
          ipAddress: '127.0.0.1 (Local)',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
          severity: 'WARNING',
        });
      }
    } else {
      setShowInssPassword(false);
      if (initialData?.inssPassword && (clientId || (initialData as any)?.id)) {
        setInssPassword('••••••••');
      }
    }
  };

  const handleCopyInssPassword = async () => {
    let passwordToCopy = inssPassword;
    const targetId = clientId || (initialData as any)?.id;

    if (passwordToCopy === '••••••••' && targetId) {
      try {
        setIsRevealingInss(true);
        const res = await fetch(`/api/clients/${targetId}/inss-password`, {
          method: 'POST',
        });
        const data = await res.json();
        if (data.success && data.password) {
          passwordToCopy = data.password;
          // Security: do not mutate inssPassword state to plaintext; keep field safely masked
        } else {
          setErrorMessage(data.error || 'Não foi possível obter a senha do INSS para cópia.');
          return;
        }
      } catch (err) {
        console.error('Failed to fetch password for copy:', err);
        setErrorMessage('Erro de rede ao buscar senha do INSS.');
        return;
      } finally {
        setIsRevealingInss(false);
      }
    }

    if (!passwordToCopy || passwordToCopy === '••••••••') return;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(passwordToCopy);
        setIsCopiedInss(true);

        // VULN-06: Persist audit log to PostgreSQL audit_logs table via /api/audit/log
        fetch('/api/audit/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'VIEW_INSS_PASSWORD',
            actionDescription: `Copiou a senha do Meu INSS do cliente ${fullName || initialData?.fullName || 'Cadastro'} para a área de transferência`,
            targetResource: `Cliente ${targetId || initialData?.cpf || 'Novo'} - Credenciais Meu INSS (Clipboard)`,
            clientId: targetId,
            severity: 'WARNING',
          }),
        }).catch((err) => console.warn('Failed to record copy audit log:', err));

        securityStore.logEvent({
          actorId: currentUser?.id || 'usr-001',
          actorName: currentUser?.fullName || 'Operador',
          actorRole: currentUser?.memberType || 'LAWYER',
          action: 'VIEW_INSS_PASSWORD',
          actionDescription: `Copiou a senha do Meu INSS do cliente ${fullName || initialData?.fullName || 'Cadastro'} para a área de transferência`,
          targetResource: `Cliente ${targetId || initialData?.cpf || 'Novo'} - Credenciais Meu INSS (Clipboard)`,
          clientId: targetId,
          ipAddress: '127.0.0.1 (Local)',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
          severity: 'WARNING',
        });

        setTimeout(() => setIsCopiedInss(false), 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  // Benefit specifics
  const [benefitType, setBenefitType] = useState(initialData?.benefitType || 'BPC/LOAS Elderly');
  const [specialCategory, setSpecialCategory] = useState<SpecialCategory>('URBAN_COMMON');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [physicalFileLocation, setPhysicalFileLocation] = useState(initialData?.physicalFileLocation || '');

  // Derived computations
  const ageCalc = birthDate ? calculateAge(birthDate) : null;
  const age = ageCalc ? ageCalc.years : null;
  const cleanCpf = cpf.replace(/\D/g, '');
  const cpfValid = cleanCpf.length === 11 ? isValidCpf(cleanCpf) : null;

  const isLoasElderlyAge = age !== null && age >= 65;
  const genderEnum = gender === 'M' ? 'MALE' : gender === 'F' ? 'FEMALE' : null;
  const ruralRetirementCheck =
    age !== null && genderEnum ? checkRuralRetirementAge(genderEnum, age) : null;

  // Populate form from existing prospect data
  const applyClientData = useCallback((foundClient: any) => {
    setLinkedClientId(foundClient.id);
    setFullName(foundClient.full_name || foundClient.fullName || '');
    if (foundClient.cpf || foundClient.normalized_cpf) {
      setCpf(maskCpf(foundClient.cpf || foundClient.normalized_cpf));
    }
    if (foundClient.mobile_phone || foundClient.mobilePhone) {
      setMobilePhone(maskPhone(foundClient.mobile_phone || foundClient.mobilePhone));
    }
    if (foundClient.benefit_type || foundClient.benefitType) {
      setBenefitType(foundClient.benefit_type || foundClient.benefitType);
    }
    if (foundClient.notes) {
      setNotes(foundClient.notes);
    }
    if (foundClient.rg) setRg(foundClient.rg);
    if (foundClient.birth_date) setBirthDate(foundClient.birth_date);
    if (foundClient.postal_code) setPostalCode(maskCep(foundClient.postal_code));
    if (foundClient.street) setStreet(foundClient.street);
    if (foundClient.street_number) setStreetNumber(foundClient.street_number);
    if (foundClient.complement) setComplement(foundClient.complement);
    if (foundClient.neighborhood) setNeighborhood(foundClient.neighborhood);
    if (foundClient.city) setCity(foundClient.city);
    if (foundClient.state) setState(foundClient.state);
    if (foundClient.email) setEmail(foundClient.email);
    if (foundClient.encrypted_inss_password || foundClient.encryptedInssPassword) {
      setInssPassword('••••••••');
    }

    setFastIntakeNotice(
      `Dados vinculados com sucesso da entrada rápida de "${foundClient.full_name || foundClient.fullName}". Complete os campos restantes.`
    );
    setShowSuggestions(false);
  }, []);

  // Lookup by CPF on complete 11 digits
  useEffect(() => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length === 11 && isValidCpf(digits) && currentUser?.tenantId && !clientId) {
      const supabase = createClient();
      (supabase.from('clients') as any)
        .select('*')
        .eq('tenant_id', currentUser.tenantId)
        .eq('normalized_cpf', digits)
        .is('deleted_at', null)
        .maybeSingle()
        .then(({ data }: any) => {
          if (data && data.id !== linkedClientId) {
            applyClientData(data);
          }
        });
    }
  }, [cpf, currentUser?.tenantId, clientId, linkedClientId, applyClientData]);

  // Search by name suggestions when typing
  useEffect(() => {
    const trimmed = fullName.trim();
    if (trimmed.length >= 3 && currentUser?.tenantId && !clientId && !linkedClientId) {
      const supabase = createClient();
      const timer = setTimeout(() => {
        (supabase.from('clients') as any)
          .select('id, full_name, cpf, mobile_phone, benefit_type, notes')
          .eq('tenant_id', currentUser.tenantId)
          .ilike('full_name', `%${trimmed}%`)
          .is('deleted_at', null)
          .limit(5)
          .then(({ data }: any) => {
            if (data && data.length > 0) {
              setNameSuggestions(data);
              setShowSuggestions(true);
            } else {
              setNameSuggestions([]);
              setShowSuggestions(false);
            }
          });
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowSuggestions(false);
    }
  }, [fullName, currentUser?.tenantId, clientId, linkedClientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      try {
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
          benefitType: formatBenefitType(benefitType, 'pt-BR'),
          hasActiveBenefit: false,
          benefitNumber: benefitNumber || undefined,
          specialCategories: [specialCategory],
          dependentCount: 0,
          inssPassword: inssPassword || undefined,
          photoReference: photoPreview === null ? null : (photoPreview || undefined),
          notes: notes || undefined,
          physicalFileLocation: physicalFileLocation || undefined,
        };

        if (onSave) {
          await onSave(payload, photoFile || undefined, linkedClientId);
        }
        setSuccessMessage(t.clientForm.saveSuccess);
        setTimeout(() => setSuccessMessage(null), 4000);
      } catch (err: any) {
        setErrorMessage(
          err?.message || 'Erro ao salvar cliente no banco de dados. Verifique os dados informados.'
        );
      }
    });
  };

  return (
    <div className="flex gap-8 relative">
      {/* Anchor Navigation Sidebar (Sticky) */}
      <LegalPreAnalysisSidebar
        t={t}
        age={age}
        isLoasElderlyAge={isLoasElderlyAge}
        ruralRetirementCheck={ruralRetirementCheck}
        gender={gender}
      />

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

          {/* Fast Intake Auto-link Notice Banner */}
          {fastIntakeNotice && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3 animate-in fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#C89543] shrink-0" />
                <span className="font-semibold">{fastIntakeNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setFastIntakeNotice(null)}
                className="text-amber-700 hover:text-amber-950 text-xs font-bold underline shrink-0"
              >
                Dispensar
              </button>
            </div>
          )}

          {/* Validation / Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3 animate-in fade-in shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Section 1: Personal Identification */}
          <div id="personal" className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-[#C89543]" />
              <h2 className="text-base font-bold text-slate-800">{t.clientForm.sec1}</h2>
            </div>

            {/* Photo / Avatar Upload */}
            <div className="flex items-center gap-4 p-3.5 bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
              <div className="w-14 h-14 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto do cliente" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <User className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Foto ou Imagem do Cliente
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 shadow-2xs transition-all">
                    <Camera className="w-3.5 h-3.5 text-[#C89543]" />
                    <span>{photoFile ? photoFile.name : 'Selecionar imagem (PNG/JPG/WebP)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setRawFileName(file.name);
                          if (rawImageForCrop?.startsWith('blob:')) {
                            URL.revokeObjectURL(rawImageForCrop);
                          }
                          const objectUrl = URL.createObjectURL(file);
                          setRawImageForCrop(objectUrl);
                          setCropModalOpen(true);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                  {photoPreview && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setRawImageForCrop((prev) => prev || photoPreview);
                          setCropModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium shadow-2xs transition-all"
                        title="Ajustar posição e zoom da foto"
                      >
                        <Move className="w-3.5 h-3.5 text-[#C89543]" />
                        <span>Ajustar posição</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Deseja remover a foto selecionada deste cadastro?')) {
                            if (photoPreview?.startsWith('blob:')) {
                              URL.revokeObjectURL(photoPreview);
                            }
                            if (rawImageForCrop?.startsWith('blob:')) {
                              URL.revokeObjectURL(rawImageForCrop);
                            }
                            setPhotoFile(null);
                            setPhotoPreview(null);
                            setRawImageForCrop(null);
                          }
                        }}
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
                        onClick={() => applyClientData(item)}
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

          {/* Section 2: Address & Residence */}
          <AddressSection
            t={t}
            postalCode={postalCode}
            setPostalCode={setPostalCode}
            street={street}
            setStreet={setStreet}
            streetNumber={streetNumber}
            setStreetNumber={setStreetNumber}
            complement={complement}
            setComplement={setComplement}
            neighborhood={neighborhood}
            setNeighborhood={setNeighborhood}
            city={city}
            setCity={setCity}
            state={state}
            setState={setState}
          />

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
                  maxLength={15}
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(maskPhone(e.target.value))}
                  placeholder="(83) 98888-0000"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.clientForm.secondaryPhoneLabel}
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(83) 99999-1111"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-mono"
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
          <InssAccessSection
            t={t}
            benefitNumber={benefitNumber}
            setBenefitNumber={setBenefitNumber}
            inssPassword={inssPassword}
            setInssPassword={setInssPassword}
            showInssPassword={showInssPassword}
            toggleShowInssPassword={toggleShowInssPassword}
            isRevealingInss={isRevealingInss}
            handleCopyInssPassword={handleCopyInssPassword}
            isCopiedInss={isCopiedInss}
            physicalFileLocation={physicalFileLocation}
            setPhysicalFileLocation={setPhysicalFileLocation}
          />

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
                  value={getCanonicalBenefitKey(benefitType)}
                  onChange={(e) => setBenefitType(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900 font-medium"
                >
                  <option value="BPC/LOAS Elderly">BPC / LOAS - Idoso (≥ 65 anos)</option>
                  <option value="BPC/LOAS Disability">BPC / LOAS - Pessoa com Deficiência (PCD)</option>
                  <option value="Rural Special Retirement">Aposentadoria Rural - Segurado Especial</option>
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

      {/* Interactive Avatar Crop Modal */}
      <AvatarCropModal
        isOpen={cropModalOpen}
        imageSrc={rawImageForCrop}
        fileName={rawFileName}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
