'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const { currentUser } = useAuth();
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Auto-launch on first login
  useEffect(() => {
    if (!currentUser?.id) return;
    const tourKey = `previoffice_tour_completed_${currentUser.id}`;
    const hasCompleted = localStorage.getItem(tourKey);

    if (!hasCompleted) {
      setIsFirstLogin(true);
      const timer = setTimeout(() => {
        setIsTourActive(true);
        setCurrentStepIndex(0);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentUser?.id]);

  const startTour = () => {
    setCurrentStepIndex(0);
    setIsTourActive(true);
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index);
    }
  };

  // Immediate purge of all sandbox state on completion
  const completeTour = () => {
    setIsTourActive(false);
    if (currentUser?.id) {
      localStorage.setItem(`previoffice_tour_completed_${currentUser.id}`, 'true');
    }
  };

  // Immediate purge of all sandbox state on dismissal
  const skipTour = () => {
    setIsTourActive(false);
    if (currentUser?.id) {
      localStorage.setItem(`previoffice_tour_completed_${currentUser.id}`, 'true');
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
