'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { WELCOME_SLIDES } from './welcome-slides';
import { WelcomeSlidePreview } from './welcome-slide-preview';
import { useAuth } from '@/lib/auth/auth-context';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const { currentUser } = useAuth();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Reset to first slide whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIndex(0);
    }
  }, [isOpen]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const totalSlides = WELCOME_SLIDES.length;
  const currentSlide = WELCOME_SLIDES[currentSlideIndex] || WELCOME_SLIDES[0];
  const isLastSlide = currentSlideIndex === totalSlides - 1;

  // Handle dismissal with persistent checkbox option
  const handleClose = useCallback(() => {
    if (dontShowAgain && currentUser?.id) {
      localStorage.setItem(`previoffice_welcome_dismissed_${currentUser.id}`, 'true');
    }
    onClose();
  }, [dontShowAgain, currentUser?.id, onClose]);

  const handleNext = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation (Arrow keys and Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlideIndex, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#082A52] via-[#0B192E] to-[#0D3663] text-white flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C89543] to-[#dfad5e] text-[#082A52] flex items-center justify-center font-bold shadow-md">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full text-[#F3E5AB]">
                  Passo {currentSlide.stepNumber} de {totalSlides}
                </span>
                <span className="text-xs text-white/60 font-semibold">
                  {currentSlide.category}
                </span>
              </div>
              <h2 id="welcome-modal-title" className="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
                {currentSlide.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer"
            title="Fechar introdução"
            aria-label="Fechar introdução"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 flex-1 overflow-y-auto min-h-0 bg-slate-50/50">
          {/* Left Column: Description & Benefits */}
          <div className="flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="inline-block text-xs font-bold text-[#C89543] uppercase tracking-wider">
                {currentSlide.subtitle}
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {currentSlide.description}
              </p>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Principais Vantagens para o Escritório:
                </div>
                {currentSlide.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-[#C89543] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Interactive Preview */}
          <div className="flex flex-col justify-center">
            <WelcomeSlidePreview slide={currentSlide} />
          </div>
        </div>

        {/* Footer Controls with Checkbox & Step Indicators */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {/* Checkbox: Não visualizar novamente */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-900 transition-colors">
            <input
              type="checkbox"
              id="welcome-modal-dont-show-again"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#C89543] focus:ring-[#C89543] cursor-pointer"
            />
            <span className="font-medium">
              Não exibir esta introdução novamente ao entrar
            </span>
          </label>

          {/* Center: Slide Indicators */}
          <div className="flex items-center gap-1.5">
            {WELCOME_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={`transition-all rounded-full ${
                  idx === currentSlideIndex
                    ? 'w-7 h-2.5 bg-[#C89543]'
                    : 'w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Ir para passo ${idx + 1}: ${slide.title}`}
                aria-label={`Ir para passo ${idx + 1}`}
              />
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                currentSlideIndex === 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer ${
                isLastSlide
                  ? 'bg-gradient-to-r from-[#C89543] to-[#dfad5e] text-[#082A52] hover:opacity-95'
                  : 'bg-[#082A52] text-white hover:bg-[#0D3663]'
              }`}
            >
              <span>{isLastSlide ? 'Concluir e Começar' : 'Próximo'}</span>
              {isLastSlide ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
