'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  MessageCircle,
  KeyRound,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TeamMember } from '@/types/settings';

interface ShareCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  temporaryPassword: string;
}

export function ShareCredentialsModal({
  isOpen,
  onClose,
  member,
  temporaryPassword,
}: ShareCredentialsModalProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !member) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://previoffice.adv.br';
  const loginUrl = `${appUrl}/login`;

  const roleName =
    member.memberType === 'LAWYER'
      ? 'Advogado(a)'
      : member.memberType === 'ASSISTANT'
      ? 'Assistente de Atendimento'
      : 'Estagiário(a) de Direito';

  const shareText = `🏛️ *PreviOffice - Alexandre Pontes Advocacia*
Olá, ${member.fullName}! Seu acesso ao sistema do escritório foi criado com sucesso:

🔗 *Link de Acesso:* ${loginUrl}
👤 *Usuário:* ${member.email}
🔑 *Senha Provisória:* ${temporaryPassword}

⚠️ *Atenção:* No seu primeiro login, o sistema exigirá que você cadastre sua senha definitiva pessoal para garantir o sigilo das informações do escritório.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const cleanPhone = (member.phone || '').replace(/\D/g, '');
  const whatsappUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(shareText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#082A52] to-[#0B192E] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Acesso Criado com Sucesso</span>
              </h3>
              <p className="text-xs text-slate-300">
                Compartilhe os dados de acesso provisório com custo R$ 0,00
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Info Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">{member.fullName}</div>
              <div className="text-[11px] text-slate-500">{member.email} • {roleName}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Senha Provisória</span>
              <span className="text-xs font-mono font-extrabold text-[#082A52] bg-white px-2.5 py-1 rounded-md border border-slate-300 inline-block shadow-2xs">
                {temporaryPassword}
              </span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <span className="font-bold">Troca Obrigatória Ativada: </span>
              Ao logar com essa senha provisória, o colaborador será bloqueado até que cadastre sua senha definitiva pessoal.
            </p>
          </div>

          {/* WhatsApp Message Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Mensagem Pronta para WhatsApp</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Prévia formatada</span>
            </div>
            <pre className="p-3.5 bg-slate-100/80 rounded-xl text-[11px] font-sans text-slate-700 border border-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-medium">
              {shareText}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Texto para WhatsApp</span>
                  </>
                )}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#128C7E] hover:bg-[#075E54] text-white flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Abrir WhatsApp Web</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            >
              Concluir e Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
