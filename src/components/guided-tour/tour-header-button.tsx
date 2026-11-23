'use client';

import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { useTour } from './guided-tour-context';

export function TourHeaderButton() {
  const { startTour, isTourActive } = useTour();

  return (
    <button
      type="button"
      onClick={startTour}
      disabled={isTourActive}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
        isTourActive
          ? 'opacity-50 pointer-events-none bg-slate-100 text-slate-400'
          : 'bg-gradient-to-r from-amber-50 to-amber-100/60 hover:from-amber-100 hover:to-amber-200/80 text-[#082A52] border border-[#C89543]/50 hover:border-[#C89543] active:scale-98'
      }`}
      title="Iniciar tour guiado e walkthrough das funcionalidades"
    >
      <Compass className="w-4 h-4 text-[#C89543] transition-transform duration-300" />
      <span className="font-bold">Tour Guiado</span>
      <Sparkles className="w-3 h-3 text-[#C89543] animate-pulse" />
    </button>
  );
}
