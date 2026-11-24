'use client';

import React, { useState, useTransition, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { AvatarCropModal } from './avatar-crop-modal';
import { LegalPreAnalysisSidebar } from './form-sections/legal-pre-analysis-sidebar';
import { AddressSection } from './form-sections/address-section';
import { InssAccessSection } from './form-sections/inss-access-section';
import { PersonalDataSection } from './form-sections/personal-data-section';
import { ContactSection } from './form-sections/contact-section';
import { BenefitSection } from './form-sections/benefit-section';
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

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleRemovePhoto = () => {
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
          <PersonalDataSection
            t={t}
            fileInputRef={fileInputRef}
            handlePhotoUpload={handlePhotoUpload}
            photoPreview={photoPreview}
            onRemovePhoto={handleRemovePhoto}
            onAdjustPhotoPosition={() => {
              setRawImageForCrop((prev) => prev || photoPreview);
              setCropModalOpen(true);
            }}
            fullName={fullName}
            setFullName={setFullName}
            linkedClientId={linkedClientId}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            nameSuggestions={nameSuggestions}
            onApplyClientData={applyClientData}
            cpf={cpf}
            setCpf={setCpf}
            cpfValid={cpfValid}
            rg={rg}
            setRg={setRg}
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            gender={gender}
            setGender={setGender}
            maritalStatus={maritalStatus}
            setMaritalStatus={setMaritalStatus}
            profession={profession}
            setProfession={setProfession}
            motherName={motherName}
            setMotherName={setMotherName}
            fatherName={fatherName}
            setFatherName={setFatherName}
          />

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
          <ContactSection
            t={t}
            mobilePhone={mobilePhone}
            setMobilePhone={setMobilePhone}
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
          />

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
          <BenefitSection
            t={t}
            benefitType={benefitType}
            setBenefitType={setBenefitType}
            specialCategory={specialCategory}
            setSpecialCategory={setSpecialCategory}
            notes={notes}
            setNotes={setNotes}
          />
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
