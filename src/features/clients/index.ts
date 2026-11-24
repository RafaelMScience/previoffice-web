/**
 * Feature Module: Clients & Prontuários (PreviOffice)
 * Encapsulates client registration, legal pre-analysis, INSS credentials management,
 * dossiers, and client details views following Software Engineering principles.
 */

export { ClientFullForm } from '@/components/client-form/client-full-form';
export { ClientDetailsView } from '@/components/client-details/client-details-view';
export { ClientPdfReportModal } from '@/components/client-details/client-pdf-report-modal';
export { LegalContractModal } from '@/components/client-details/legal-contract-modal';

// Subcomponents & Sections
export { LegalPreAnalysisSidebar } from '@/components/client-form/form-sections/legal-pre-analysis-sidebar';
export { PersonalDataSection } from '@/components/client-form/form-sections/personal-data-section';
export { AddressSection } from '@/components/client-form/form-sections/address-section';
export { ContactSection } from '@/components/client-form/form-sections/contact-section';
export { InssAccessSection } from '@/components/client-form/form-sections/inss-access-section';
export { BenefitSection } from '@/components/client-form/form-sections/benefit-section';
export { AvatarCropModal } from '@/components/client-form/avatar-crop-modal';

// Domain Types
export type { Client, SpecialCategory, MaritalStatus } from '@/types/client';
export type { ClientFullRegistrationInput } from '@/lib/schemas/client-schema';
