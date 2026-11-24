'use client';

import React from 'react';
import { KeyRound, ShieldAlert, MessageCircle, X, Check, Copy } from 'lucide-react';

interface AdminShareCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyerName: string;
  lawyerEmail: string;
  lawyerPassword: string;
  shareText: string;
  whatsAppUrl: string;
  onCopyCredentials: () => void;
  copiedShareText: boolean;
}

export function AdminShareCredentialsModal({
  isOpen,
  onClose,
  lawyerName,
  lawyerEmail,
  lawyerPassword,
  shareText,
  whatsAppUrl,
  onCopyCredentials,
  copiedShareText,
}: AdminShareCredentialsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Compartilhar Senha Inicial de Acesso</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Envie as credenciais com custo R$ 0,00 via WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
            <div>
              <div className="font-bold text-white">{lawyerName.trim() || 'Advogado Titular'}</div>
              <div className="text-[11px] text-slate-400">{lawyerEmail.trim() || 'E-mail não informado'}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Senha Inicial</span>
              <span className="font-mono font-extrabold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                {lawyerPassword}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-300/90 leading-relaxed">
              <strong className="text-amber-200">Troca Obrigatória:</strong> No primeiro acesso, o advogado será forçado a definir uma senha definitiva pessoal.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Mensagem Pronta para WhatsApp</span>
            </label>
            <pre className="p-3.5 bg-slate-950 rounded-xl text-[11px] font-sans text-slate-300 border border-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {shareText}
            </pre>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar via WhatsApp (R$ 0,00)</span>
            </a>

            <button
              type="button"
              onClick={onCopyCredentials}
              className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {copiedShareText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedShareText ? 'Mensagem Copiada!' : 'Copiar Mensagem'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
