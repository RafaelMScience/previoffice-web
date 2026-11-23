/**
 * PreviOffice Guided Tour & Spotlight Walkthrough Types
 */

export type TourStepPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle?: string;
  description: string;
  highlights: string[];
  targetSelector?: string; // CSS selector of DOM element to illuminate with spotlight
  placement: TourStepPlacement;
  requiresDemoData?: boolean;
  actionHint?: string;
}

export interface TourContextState {
  isTourActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep;
  totalSteps: number;
  isFirstLogin: boolean;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: () => void;
  completeTour: () => void;
}
