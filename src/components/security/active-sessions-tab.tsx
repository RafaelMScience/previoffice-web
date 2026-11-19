'use client';

import React, { useState } from 'react';
import {
  Laptop,
  Smartphone,
  MapPin,
  Clock,
  LogOut,
  CheckCircle2,
  Wifi,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { ActiveSession } from '@/types/security';

interface ActiveSessionsTabProps {
  sessions: ActiveSession[];
  onTerminateSession: (sessionId: string) => void;
}

export function ActiveSessionsTab({
  sessions,
  onTerminateSession,
}: ActiveSessionsTabProps) {
  const { t, locale } = useI18n();
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  const formatStarted = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRevoke = (id: string) => {
    onTerminateSession(id);
    setConfirmRevokeId(null);
  };

  return (
    <div className="space-y-4">
      {/* Informative Header */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#C89543]" />
            Dispositivos & Sessões Autenticadas
          </h3>
          <p className="text-xs text-slate-500">
            Acompanhe em tempo real quem está conectado na sua banca de advocacia e encerre conexões antigas ou não reconhecidas.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{sessions.length} conexões ativas</span>
        </div>
      </div>

      {/* Grid of Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((sess) => (
          <div
            key={sess.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              sess.isCurrent
                ? 'bg-gradient-to-b from-[#FDF8ED] to-white border-[#C89543]/40 shadow-xs ring-1 ring-[#C89543]/30'
                : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      sess.isCurrent
                        ? 'bg-[#082A52] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {sess.device.toLowerCase().includes('phone') ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{sess.userName}</h4>
                    <p className="text-[10px] text-slate-500">{sess.userRole}</p>
                  </div>
                </div>

                {sess.isCurrent ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C89543]/20 text-[#8C6218] border border-[#C89543]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C89543] animate-pulse"></span>
                    {t.security.currentSessionBadge}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Conectado
                  </span>
                )}
              </div>

              {/* Session Meta */}
              <div className="space-y-2 py-2 border-y border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px]">Dispositivo / SO:</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{sess.device}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px]">Navegador:</span>
                  <span className="font-medium text-slate-700 text-[11px]">{sess.browser}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px]">Endereço IP:</span>
                  <span className="font-mono text-slate-700 text-[11px]">{sess.ipAddress}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Ponto / Local:
                  </span>
                  <span className="font-medium text-slate-700 text-[11px]">{sess.location}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Início da Conexão:
                  </span>
                  <span className="font-mono text-slate-700 text-[11px]">{formatStarted(sess.startedAt)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Última Atividade:
                  </span>
                  <span className="font-medium text-emerald-700 text-[11px]">{sess.lastActivity}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-2">
              {sess.isCurrent ? (
                <div className="text-[11px] text-slate-400 text-center font-medium">
                  Sessão ativa neste navegador
                </div>
              ) : confirmRevokeId === sess.id ? (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-center animate-in fade-in">
                  <p className="text-[11px] font-bold text-rose-800">
                    {t.security.terminateConfirm}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmRevokeId(null)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevoke(sess.id)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-2xs"
                    >
                      Confirmar Encerramento
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRevokeId(sess.id)}
                  className="w-full py-2 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.security.terminateSession}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
