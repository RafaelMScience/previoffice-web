'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { TOUR_STEPS } from './tour-steps';
import { DEMO_CLIENT } from '@/lib/guided-tour/demo-data';
import type { TourContextState, TourStep } from '@/types/tour';
import type { Client } from '@/types/client';

interface ExtendedTourContextState extends TourContextState {
  demoClient: Client | null;
}

const GuidedTourContext = createContext<ExtendedTourContextState | null>(null);

export function GuidedTourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const autoStartedRef = useRef(false);

  // Synchronize router location with active tour step
  const syncRouteForStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex === 0 || stepIndex === 1) {
        if (pathname !== '/') {
          router.push('/');
        }
      } else if (stepIndex === 2 || stepIndex === 3 || stepIndex === 4) {
        if (pathname !== '/clientes/demo-client-tour-001') {
          router.push('/clientes/demo-client-tour-001');
        }
      } else if (stepIndex === 5 || stepIndex === 6) {
        if (pathname !== '/') {
          router.push('/');
        }
      }
    },
    [pathname, router]
  );

  // Auto-launch on first login or via ?tour=true query parameter
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Force tour if ?tour=true or ?tour=1 is in URL
    const searchParams = new URLSearchParams(window.location.search);
    const forceTour = searchParams.get('tour') === 'true' || searchParams.get('tour') === '1';

    if (forceTour) {
      setIsTourActive(true);
      setCurrentStepIndex(0);
      syncRouteForStep(0);
      return;
    }

    // 2. Auto-launch for user if tour was never completed
    if (!currentUser?.id || autoStartedRef.current) return;

    const tourKey = `previoffice_tour_completed_${currentUser.id}`;
    const hasCompleted = localStorage.getItem(tourKey);

    if (!hasCompleted) {
      autoStartedRef.current = true;
      setIsFirstLogin(true);
      const timer = setTimeout(() => {
        setIsTourActive(true);
        setCurrentStepIndex(0);
        syncRouteForStep(0);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [currentUser?.id, syncRouteForStep]);

  // Global browser console helper for debugging and testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).startPreviOfficeTour = () => {
        if (currentUser?.id) {
          localStorage.removeItem(`previoffice_tour_completed_${currentUser.id}`);
        }
        setCurrentStepIndex(0);
        syncRouteForStep(0);
        setIsTourActive(true);
      };
    }
  }, [currentUser?.id, syncRouteForStep]);

  const startTour = () => {
    setCurrentStepIndex(0);
    syncRouteForStep(0);
    setIsTourActive(true);
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      syncRouteForStep(nextIdx);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      syncRouteForStep(prevIdx);
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index);
      syncRouteForStep(index);
    }
  };

  // Immediate purge of all sandbox state on completion
  const completeTour = () => {
    setIsTourActive(false);
    if (currentUser?.id) {
      localStorage.setItem(`previoffice_tour_completed_${currentUser.id}`, 'true');
    }
    if (pathname === '/clientes/demo-client-tour-001') {
      router.push('/');
    }
  };

  // Immediate purge of all sandbox state on dismissal
  const skipTour = () => {
    setIsTourActive(false);
    if (currentUser?.id) {
      localStorage.setItem(`previoffice_tour_completed_${currentUser.id}`, 'true');
    }
    if (pathname === '/clientes/demo-client-tour-001') {
      router.push('/');
    }
  };

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];

  // Demo client is ONLY exposed while tour is active and at relevant steps
  const demoClient =
    isTourActive && currentStep.requiresDemoData ? DEMO_CLIENT : null;

  return (
    <GuidedTourContext.Provider
      value={{
        isTourActive,
        currentStepIndex,
        currentStep,
        totalSteps: TOUR_STEPS.length,
        isFirstLogin,
        demoClient,
        startTour,
        nextStep,
        prevStep,
        goToStep,
        skipTour,
        completeTour,
      }}
    >
      {children}
    </GuidedTourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(GuidedTourContext);
  if (!context) {
    throw new Error('useTour must be used within a GuidedTourProvider');
  }
  return context;
}
