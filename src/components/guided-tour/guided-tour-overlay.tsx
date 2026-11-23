'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Compass,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Info,
  HelpCircle,
} from 'lucide-react';
import { useTour } from './guided-tour-context';

export function GuidedTourOverlay() {
  const {
    isTourActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
  } = useTour();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Position calculation and scroll to target
  useEffect(() => {
    if (!isTourActive) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      if (!currentStep.targetSelector) {
        setTargetRect(null);
        return;
      }

      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        // Smoothly scroll element into viewport if outside
        if (rect.top < 80 || rect.bottom > window.innerHeight - 80) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    const timer = setTimeout(updatePosition, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      clearTimeout(timer);
    };
  }, [isTourActive, currentStep]);

  if (!isTourActive) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  // Determine card style position relative to target element or center
  let cardPositionClasses = 'fixed inset-x-4 top-1/2 -translate-y-1/2 md:max-w-lg md:mx-auto';

  if (targetRect) {
    if (currentStep.placement === 'bottom') {
      const topPos = Math.min(targetRect.bottom + 16, window.innerHeight - 340);
      cardPositionClasses = `fixed left-1/2 -translate-x-1/2 md:max-w-lg w-[92vw]`;
    } else if (currentStep.placement === 'top') {
      const bottomPos = Math.max(16, window.innerHeight - targetRect.top + 16);
      cardPositionClasses = `fixed left-1/2 -translate-x-1/2 md:max-w-lg w-[92vw]`;
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden animate-in fade-in duration-200">
      {/* Dark Spotlight Backdrop */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White covers entire viewport */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cut-out hole over target element with padding and rounded corners */}
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - 8)}
                y={Math.max(0, targetRect.top - 8)}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="14"
                ry="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Shaded backdrop with mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(8, 26, 50, 0.78)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Target Element Gold Glow Ring */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            left: Math.max(0, targetRect.left - 8),
            top: Math.max(0, targetRect.top - 8),
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            borderRadius: '14px',
          }}
          className="pointer-events-none ring-2 ring-[#C89543] ring-offset-2 ring-offset-black/20 shadow-[0_0_24px_rgba(200,149,67,0.5)] transition-all duration-300 animate-pulse"
        />
      )}

      {/* Luxury Tour Card */}
      <div
        ref={cardRef}
        className={`${cardPositionClasses} z-10 transition-all duration-300`}
        style={
          targetRect
            ? currentStep.placement === 'top'
              ? { bottom: Math.max(20, window.innerHeight - targetRect.top + 16) }
              : { top: Math.min(targetRect.bottom + 16, window.innerHeight - 420) }
            : { top: '50%', transform: 'translateY(-50%)' }
        }
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#082A52] to-[#0D3663] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C89543] text-[#082A52] flex items-center justify-center font-bold shadow-xs">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded-full text-[#F3E5AB]">
                    Passo {currentStepIndex + 1} de {totalSteps}
                  </span>
                  {currentStep.requiresDemoData && (
                    <span className="text-[9px] font-bold bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded">
                      Modo Exemplo
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5 tracking-tight">
                  {currentStep.title}
                </h3>
              </div>
            </div>
            <button
              onClick={skipTour}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Encerrar tour guiado"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {currentStep.subtitle && (
              <p className="text-xs font-semibold text-[#082A52] border-l-2 border-[#C89543] pl-2.5 py-0.5">
                {currentStep.subtitle}
              </p>
            )}

            <p className="text-xs text-slate-600 leading-relaxed">
              {currentStep.description}
            </p>

            {/* Structured Highlights */}
            {currentStep.highlights && currentStep.highlights.length > 0 && (
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700">
                {currentStep.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C89543] flex-shrink-0 mt-0.5" />
                    <span className="leading-tight">{h}</span>
                  </div>
                ))}
              </div>
            )}

            {currentStep.actionHint && (
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100/60">
                <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>{currentStep.actionHint}</span>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={skipTour}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              Pular Tutorial
            </button>

            {/* Progress Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-5 bg-[#C89543]'
                      : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={prevStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
              )}

              <button
                onClick={isLastStep ? completeTour : nextStep}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#082A52] text-white hover:bg-[#0B3A70] transition-all shadow-xs"
              >
                <span>{isLastStep ? 'Concluir Tour' : 'Próximo'}</span>
                {!isLastStep && <ChevronRight className="w-3.5 h-3.5 text-[#C89543]" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
