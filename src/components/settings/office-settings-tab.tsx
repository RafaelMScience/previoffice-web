'use client';

import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Save,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  FileText,
  Scale,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { settingsStore } from '@/lib/data/mock-settings';
import type { OfficeSettings } from '@/types/settings';

export function OfficeSettingsTab() {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const [office, setOffice] = useState<OfficeSettings>(() => settingsStore.getOfficeSettings());
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    if (!currentUser?.tenantId) return;
    const supabase = createClient();
    (supabase.from('tenants') as any)
      .select('*')
      .eq('id', currentUser.tenantId)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setOffice((prev) => ({
            ...prev,
            tenantId: data.id,
            officeName: data.office_name || prev.officeName,
            tradeName: data.office_name || prev.tradeName,
            cnpj: data.tax_id || prev.cnpj,
            oabSocietyNumber: data.oab_number || prev.oabSocietyNumber,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            whatsapp: data.whatsapp || prev.whatsapp,
            street: data.address || prev.street,
          }));
        }
      });
  }, [currentUser?.tenantId]);

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    settingsStore.updateOfficeSettings(office);

    if (currentUser?.tenantId) {
      const supabase = createClient();
      const { error } = await (supabase.from('tenants') as any)
        .update({
          office_name: office.officeName,
          tax_id: office.cnpj,
          oab_number: office.oabSocietyNumber,
          email: office.email,
          phone: office.phone,
          whatsapp: office.whatsapp,
          address: office.street,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.tenantId);

      if (error) {
        console.error('Failed to update tenant in Supabase:', error);
        setSaveError('Erro ao salvar no banco de dados: ' + error.message);
        return;
      }
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <form onSubmit={handleSave} className="space-y-8">
        {/* Feedback message */}
        {isSaved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{t.settings.saveSuccess}</span>
          </div>
        )}
        {saveError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <span>{saveError}</span>
          </div>
        )}

        {/* 1. Identificação Jurídica & OAB */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#082A52]/10 text-[#082A52] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#082A52]">{t.settings.officeTitle}</h2>
              <p className="text-xs text-slate-500">{t.settings.officeSubtitle}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblOfficeName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={office.officeName}
                  onChange={(e) => setOffice({ ...office, officeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblTradeName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={office.tradeName}
                  onChange={(e) => setOffice({ ...office, tradeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblCnpj} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={office.cnpj}
                  onChange={(e) => setOffice({ ...office, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblOabSociety} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={office.oabSocietyNumber}
                  onChange={(e) => setOffice({ ...office, oabSocietyNumber: e.target.value })}
                  placeholder="OAB/PB 1.450/2019"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblOfficeEmail} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={office.email}
                    onChange={(e) => setOffice({ ...office, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblOfficePhone}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={office.phone}
                    onChange={(e) => setOffice({ ...office, phone: e.target.value })}
                    placeholder="(83) 3221-5500"
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblOfficeWhatsapp}
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={office.whatsapp}
                    onChange={(e) => setOffice({ ...office, whatsapp: e.target.value })}
                    placeholder="(83) 98877-1122"
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Endereço da Sede */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Endereço da Sede & Foro</h2>
              <p className="text-xs text-slate-500">
                Endereço utilizado nos cabeçalhos e rodapés de petições, contratos e procurações
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblAddress} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={office.street}
                  onChange={(e) => setOffice({ ...office, street: e.target.value })}
                  placeholder="Avenida, Rua, Praça..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblNumber} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={office.streetNumber}
                  onChange={(e) => setOffice({ ...office, streetNumber: e.target.value })}
                  placeholder="1250"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblComplement}
                </label>
                <input
                  type="text"
                  value={office.complement || ''}
                  onChange={(e) => setOffice({ ...office, complement: e.target.value })}
                  placeholder="Salas 401 a 404, Edifício..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblNeighborhood} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={office.neighborhood}
                  onChange={(e) => setOffice({ ...office, neighborhood: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblCity} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={office.city}
                  onChange={(e) => setOffice({ ...office, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblState} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={office.state}
                  onChange={(e) => setOffice({ ...office, state: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 uppercase transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.settings.lblZipCode} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={office.zipCode}
                  onChange={(e) => setOffice({ ...office, zipCode: e.target.value })}
                  placeholder="00000-000"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden font-medium text-slate-800 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Identidade Visual & Timbre */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C89543]/15 text-[#C89543] flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.settings.lblLogoUpload}</h2>
              <p className="text-xs text-slate-500">
                Logotipo oficial da sociedade impresso nas minutas, procurações e contratos
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-200 hover:border-[#C89543] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-[#FDF8ED]/30 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#082A52]/10 text-[#082A52] flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-[#082A52]" />
              </div>
              <span className="text-xs font-bold text-slate-800 mb-1">
                Clique para selecionar ou arraste o logotipo
              </span>
              <span className="text-[11px] text-slate-500">PNG transparente ou SVG (recomendado: 400x120px)</span>
            </div>

            {/* Letterhead Preview */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#C89543]" />
                  Pré-visualização do Timbre Oficial
                </span>
                <span className="text-[10px] font-mono text-slate-400">Padrão A4</span>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#082A52] to-[#0B192E] text-[#C89543] flex items-center justify-center font-serif font-black text-2xl border border-[#C89543]/40 shadow-xs flex-shrink-0">
                  §
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#082A52] uppercase tracking-wide truncate">
                    {office.tradeName || office.officeName}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 truncate">
                    {office.oabSocietyNumber} • CNPJ: {office.cnpj}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {office.street}, {office.streetNumber} - {office.city}/{office.state}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#082A52] text-white hover:bg-[#0B3A70] active:scale-98 transition-all shadow-md"
          >
            <Save className="w-4 h-4 text-[#C89543]" />
            {t.settings.btnSaveOffice}
          </button>
        </div>
      </form>
    </div>
  );
}
