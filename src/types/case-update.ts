/**
 * Case Update & Procedural Tracking Domain Types
 * Captures internal legal steps, INSS requirements, court hearings, medical exams,
 * and client WhatsApp status notifications without requiring a physical office visit.
 */

export type CaseStage =
  | 'ADMINISTRATIVE_INSS'   // INSS APS / Administrative claim
  | 'CRPS_APPEAL'           // Social Security Appeals Council
  | 'JUDICIAL_FIRST_DEGREE' // Federal Court / Small Claims Court (JEF)
  | 'JUDICIAL_APPEAL'       // Regional Federal Court (TRF)
  | 'EXECUTION_PAYMENT';    // Payment orders (RPV / Precatório)

export type CaseEventKind =
  | 'REQUIREMENT_FILED'      // Claim protocol issued
  | 'INSS_EXIGENCE'          // Exigência requiring additional proof
  | 'MEDICAL_EXAM_SCHEDULED' // Perícia médica SABI / Judicial exam
  | 'MEDICAL_REPORT_FILED'   // Perito report filed
  | 'DECISION_GRANTED'       // Favorable decision / Benefit granted
  | 'DECISION_DENIED'        // Denial / Appeal required
  | 'PAYMENT_ISSUED'         // RPV / Precatório payment order
  | 'GENERAL_UPDATE';        // General procedural step

export interface CaseUpdate {
  id: string; // UUID
  tenantId: string;
  clientId: string;
  processNumber?: string; // 20-digit CNJ or 10-digit NB
  forumOrAgency: string; // e.g. "INSS - Agência Manaus/AM" or "Vara Federal de Manaus"
  stage: CaseStage;
  eventKind: CaseEventKind;
  eventDate: string; // ISO datetime
  title: string;
  description: string;
  actionDeadline?: string; // Optional procedural deadline date
  notifyClientText?: string; // Friendly non-jargon message for WhatsApp
  recordedBy: string; // Lawyer name
  createdAt: string;
  updatedAt: string;
}
