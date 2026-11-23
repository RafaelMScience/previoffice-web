'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { useTour } from './guided-tour-context';

export function TourHeaderButton() {
  const { startTour, isTourActive } = useTour();

  return (
    <button
      type="button"
      onClick={startTour}
      disabled={isTourActive}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-[#082A52] hover:text-white border border-slate-200 transition-all shadow-2xs group"
      title="Iniciar tour guiado e walkthrough das funcionalidades"
    >
      <Compass className="w-3.5 h-3.5 text-[#C89543] group-hover:rotate-45 transition-transform duration-300" />
      <span className="hidden sm:inline">Tour Guiado</span>
    </button>
  );
}
