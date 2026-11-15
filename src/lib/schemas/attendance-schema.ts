import { z } from 'zod';

export const PendingDocumentItemSchema = z.object({
  id: z.string(),
  description: z.string().min(2),
  isDelivered: z.boolean().default(false),
});

export const AttendanceCreateSchema = z.object({
  clientId: z.string().uuid('Invalid client UUID'),
  attendanceType: z.enum([
    'FIRST_CONSULTATION',
    'BENEFIT_ANALYSIS',
    'PROCESS_TRACKING',
    'GUIDANCE',
    'RETURN',
    'OTHER',
  ]),
  objective: z.string().min(2, 'Objective or benefit required'),
  notes: z.string().optional(),
  narrativeHistory: z.string().optional(),
  pendingDocuments: z.array(PendingDocumentItemSchema).optional(),
  physicalFileLocation: z.string().optional(),
});

export type AttendanceCreateInput = z.infer<typeof AttendanceCreateSchema>;
