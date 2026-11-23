'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useTour } from './guided-tour-context';
import { useAuth } from '@/lib/auth/auth-context';

export function GuidedTourOverlay() {
  const pathname = usePathname();
  const { isAuthenticated, currentUser } = useAuth();
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

  // Strictly ensure overlay never renders if unauthenticated or tour inactive
  const isDisplayable = isAuthenticated && currentUser && isTourActive;

  // Accurate position calculation and viewport tracking with DOMRect memoization
  const updatePosition = useCallback((shouldScroll = false) => {
    if (!currentStep.targetSelector) {
      setTargetRect(null);
      return;
    }

    let el = document.querySelector(currentStep.targetSelector);
    // Robust fallback for Step 7 in case settings link is restricted or within sidebar nav
    if (!el && currentStep.id === 'step-settings-and-audit') {
      el = document.querySelector('#tour-settings-nav-link, aside nav, aside');
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect((prev) => {
        if (
          prev &&
          prev.top === rect.top &&
          prev.left === rect.left &&
          prev.width === rect.width &&
          prev.height === rect.height
        ) {
          return prev;
        }
        return rect;
      });

      // Smoothly scroll element into viewport on step transition (never during user scroll)
      if (shouldScroll) {
        if (el.closest('aside')) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (currentStep.placement === 'top') {
          // Keep element comfortably in lower half of screen so card has top half completely clear
          el.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else if (currentStep.placement === 'bottom') {
          // Keep element near top so card has bottom half completely clear
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep.targetSelector, currentStep.placement, currentStep.id]);

  // Position calculation and scroll to target with route & DOM mutation awareness
  useEffect(() => {
    if (!isDisplayable) {
      setTargetRect(null);
      return;
    }

    updatePosition(true);
    const handleScrollOrResize = () => updatePosition(false);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    // Watch for DOM changes (such as client-side page transitions or asynchronous data loading)
    let observer: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        updatePosition(false);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Staggered timers to catch animations, transitions, and route mounts
    const timers = [
      setTimeout(() => updatePosition(true), 50),
      setTimeout(() => updatePosition(false), 150),
      setTimeout(() => updatePosition(false), 350),
      setTimeout(() => updatePosition(false), 700),
      setTimeout(() => updatePosition(false), 1200),
    ];

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      observer?.disconnect();
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isDisplayable, currentStep, pathname, updatePosition]);

  if (!isDisplayable) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  // Compute exact inline style to prevent any Tailwind translate collision and guarantee unblocked view
  let cardStyle: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '92vw',
    maxWidth: '32rem',
    maxHeight: 'min(82vh, 480px)',
    zIndex: 10000,
  };

  if (targetRect) {
    if (currentStep.placement === 'top') {
      // Step 2 & Top placement: Anchor near top of screen leaving element completely visible below!
      const maxAllowedHeight = Math.max(200, targetRect.top - 24);
      cardStyle = {
        position: 'fixed',
        left: '50%',
        top: '16px',
        transform: 'translateX(-50%)',
        width: '92vw',
        maxWidth: '34rem',
        maxHeight: `${Math.min(maxAllowedHeight, window.innerHeight * 0.44)}px`,
        zIndex: 10000,
      };
    } else if (currentStep.placement === 'bottom') {
      // Steps 1, 3, 4, 5: Placed below the element with guaranteed bottom clearance
      const topPos = targetRect.bottom + 14;
      const maxAllowedHeight = Math.max(200, window.innerHeight - topPos - 24);
      cardStyle = {
        position: 'fixed',
        left: '50%',
        top: `${Math.min(topPos, window.innerHeight - 260)}px`,
        transform: 'translateX(-50%)',
        width: '92vw',
        maxWidth: '32rem',
        maxHeight: `${Math.min(maxAllowedHeight, 460)}px`,
        zIndex: 10000,
      };
    } else if (currentStep.placement === 'right') {
      // Steps 6 & 7 (Sidebar items): On mobile / narrow screens (< 768px), fallback to centered placement
      const isNarrowViewport = typeof window !== 'undefined' && window.innerWidth < 768;
      if (isNarrowViewport) {
        cardStyle = {
          position: 'fixed',
          left: '50%',
          top: `${Math.max(16, Math.min(targetRect.bottom + 14, window.innerHeight - 360))}px`,
          transform: 'translateX(-50%)',
          width: '92vw',
          maxWidth: '32rem',
          maxHeight: 'min(76vh, 420px)',
          zIndex: 10000,
        };
      } else {
        const cardTop = Math.max(16, Math.min(targetRect.top - 20, window.innerHeight - 440));
        cardStyle = {
          position: 'fixed',
          left: `${Math.max(16, Math.min(targetRect.right + 20, window.innerWidth - 460))}px`,
          top: `${cardTop}px`,
          width: 'min(90vw - 280px, 28rem)',
          maxWidth: '28rem',
          maxHeight: 'min(82vh, 460px)',
          zIndex: 10000,
        };
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden animate-in fade-in duration-200">
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
        {/* Shaded backdrop with mask (0.48 opacity lets background remain clearly visible) */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(8, 26, 50, 0.48)"
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

      {/* Luxury Tour Card (Always Interactive with Guaranteed Visible Footer) */}
      <div
        ref={cardRef}
        style={cardStyle}
        className="pointer-events-auto transition-all duration-200 animate-in fade-in zoom-in-95 flex flex-col"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[inherit]">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#082A52] to-[#0D3663] text-white flex items-center justify-between shrink-0">
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
                <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={skipTour}
              className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Fechar tour e limpar dados temporários"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body with guaranteed scrollbar if needed */}
          <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto min-h-0">
            <div className="text-xs font-semibold text-[#082A52]">
              {currentStep.subtitle}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {currentStep.description}
            </p>

            {/* Highlights bullets */}
            {currentStep.highlights && currentStep.highlights.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                {currentStep.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C89543] shrink-0 mt-0.5" />
                    <span className="leading-tight">{highlight}</span>
                  </div>
                ))}
              </div>
            )}

            {currentStep.actionHint && (
              <div className="flex items-center gap-2 text-[11px] font-medium text-amber-800 bg-amber-50/80 border border-amber-200/70 p-2.5 rounded-lg">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{currentStep.actionHint}</span>
              </div>
            )}
          </div>

          {/* Footer Controls (Always Pinned and Visible) */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={skipTour}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Pular tour
            </button>

            {/* Progress Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-5 bg-[#C89543]'
                      : idx < currentStepIndex
                      ? 'w-1.5 bg-[#082A52]'
                      : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
              )}

              <button
                type="button"
                onClick={isLastStep ? completeTour : nextStep}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#082A52] hover:bg-[#0B3A70] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isLastStep ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#C89543]" />
                    <span>Concluir</span>
                  </>
                ) : (
                  <>
                    <span>Próximo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
