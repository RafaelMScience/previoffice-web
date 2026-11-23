export type WelcomeMockupType =
  | 'reception_intake'
  | 'client_record'
  | 'return_attendance'
  | 'contracts_fee'
  | 'pdf_dossier'
  | 'vade_mecum'
  | 'office_audit'
  | 'financial_returns'
  | (string & {});

export interface WelcomeSlide {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  benefits: string[];
  mockup: {
    type: WelcomeMockupType;
    badge: string;
    previewData: Record<string, any>;
  };
}

export interface WelcomeModalState {
  isOpen: boolean;
  currentSlideIndex: number;
  dontShowAgain: boolean;
}
