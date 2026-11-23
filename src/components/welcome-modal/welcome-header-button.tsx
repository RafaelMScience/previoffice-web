'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { useWelcomeModal } from './welcome-modal-context';

export function WelcomeHeaderButton() {
  const { openWelcomeModal } = useWelcomeModal();

  return (
    <button
      type="button"
      onClick={openWelcomeModal}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#8C6218] bg-[#FDF8ED] hover:bg-[#faedd1] border border-[#C89543]/40 shadow-2xs transition-all cursor-pointer"
      title="Apresentação interativa do PreviOffice com exemplos práticos"
    >
      <Compass className="w-3.5 h-3.5 text-[#C89543]" />
      <span>Guia do Sistema</span>
    </button>
  );
}
