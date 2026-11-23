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
  GripHorizontal,
  RotateCcw,
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

  // Draggable positioning state: Defaults to top-right corner ('canto superior')
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  // Drag start handler for header
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Only drag with left mouse button (0) on desktop
    if ('button' in e && e.button !== 0) return;
    // Prevent dragging when clicking interactive buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: rect.left,
      startY: rect.top,
    };
    setIsDragging(true);
  }, []);

  // Global mousemove / mouseup handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartRef.current.mouseX;
      const deltaY = clientY - dragStartRef.current.mouseY;

      const cardWidth = cardRef.current?.offsetWidth || 380;
      const cardHeight = cardRef.current?.offsetHeight || 300;

      const newX = Math.max(10, Math.min(dragStartRef.current.startX + deltaX, window.innerWidth - cardWidth - 10));
      const newY = Math.max(10, Math.min(dragStartRef.current.startY + deltaY, window.innerHeight - cardHeight - 10));

      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging]);

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

  // Fixed top-right corner placement by default ('canto superior'), or freely dragged coordinates
  const isNarrowScreen = typeof window !== 'undefined' && window.innerWidth < 640;
  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    top: position ? `${position.y}px` : '18px',
    right: position ? 'auto' : isNarrowScreen ? '12px' : '24px',
    left: position ? `${position.x}px` : isNarrowScreen ? '12px' : 'auto',
    width: isNarrowScreen && !position ? 'calc(100vw - 24px)' : 'min(92vw, 26rem)',
    maxWidth: '28rem',
    maxHeight: 'min(86vh, 540px)',
    zIndex: 10000,
    cursor: isDragging ? 'grabbing' : 'default',
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden animate-in fade-in duration-200">
      {/* Dark Spotlight Backdrop (Gentle 0.35 scrim keeps whole screen crisp and clearly visible) */}
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
        {/* Shaded backdrop with mask (0.35 opacity lets background remain clearly visible) */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(8, 26, 50, 0.35)"
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

      {/* Draggable Tour Card (Docked in upper corner by default, freely movable by user) */}
      <div
        ref={cardRef}
        style={cardStyle}
        className="pointer-events-auto transition-shadow duration-200 animate-in fade-in zoom-in-95 flex flex-col"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[inherit]">
          {/* Header - Drag Handle Area */}
          <div
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className="px-4 py-3 bg-gradient-to-r from-[#082A52] to-[#0D3663] text-white flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing select-none touch-none"
            title="Clique e arraste para reposicionar o quadro livremente"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-7 h-7 rounded-lg bg-[#C89543] text-[#082A52] flex items-center justify-center font-bold shadow-xs shrink-0">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded-full text-[#F3E5AB]">
                    Passo {currentStepIndex + 1} de {totalSteps}
                  </span>
                  {currentStep.requiresDemoData && (
                    <span className="text-[9px] font-bold bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded font-mono">
                      Exemplo
                    </span>
                  )}
                  <span className="text-[10px] text-white/70 inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                    <GripHorizontal className="w-3 h-3 text-[#F3E5AB]" />
                    <span>Mover</span>
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug truncate">
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {position && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPosition(null);
                  }}
                  className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Restaurar para o canto superior direito"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={skipTour}
                className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Fechar tour e limpar dados temporários"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
