/**
 * Feature Module: Attendances & Atendimentos Previdenciários (PreviOffice)
 * Encapsulates attendance registration, attendant/lawyer assignment,
 * document checklist requirements, narrative histories, and strategy notes.
 */

export { NewAttendanceModal } from '@/components/client-details/new-attendance-modal';
export { AttendanceAttendantSection } from '@/components/attendances/attendance-attendant-section';
export { AttendanceChecklistSection } from '@/components/attendances/attendance-checklist-section';

// Types
export type { Attendance, AttendanceType, PendingPhysicalDocument } from '@/types/attendance';
export type { DocumentChecklistItem } from '@/lib/domain/document-presets';
export { COMMON_DOCUMENT_SHORTCUTS, getDefaultDocumentsForBenefit } from '@/lib/domain/document-presets';
