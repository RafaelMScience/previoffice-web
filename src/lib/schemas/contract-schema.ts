import { z } from 'zod';

export const InstallmentPaymentSchema = z.object({
  installmentId: z.string().min(1, 'Installment ID is required'),
  paidAt: z.string().default(() => new Date().toISOString()),
  paymentMethod: z.enum([
    'PIX',
    'BOLETO',
    'CASH',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'RPV_PRECATORIO_RETENTION',
  ]),
  receiptReference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const PhysicalAttachmentUploadSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  fileName: z.string().min(3, 'File name is required'),
  fileSizeFormatted: z.string(),
  fileType: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
  physicalCabinetLocation: z.string().min(3, 'Cabinet location is mandatory for paper archiving'),
  signerType: z.enum(['CLIENT_SIGNATURE', 'ROGO_WITNESSES', 'LEGAL_REPRESENTATIVE']),
  notes: z.string().max(1000).optional(),
});

export const NewContractSchema = z.object({
  clientId: z.string().min(1, 'Client selection is required'),
  clientName: z.string().min(2, 'Client name is required'),
  clientCpf: z.string().min(11, 'Valid CPF is required'),
  clientPhone: z.string().optional(),
  benefitSpecies: z.string().min(2, 'Benefit species is required'),
  templateId: z.string().optional(),
  feeModel: z.enum(['QUOTA_LITIS', 'FIXED_INSTALLMENT', 'HYBRID']),
  quotaLitisPercentage: z.number().min(0).max(50).default(30),
  estimatedRetroactiveAmount: z.number().min(0).optional(),
  fixedTotalAmount: z.number().min(0).optional(),
  downPaymentAmount: z.number().min(0).optional(),
  installmentCount: z.number().int().min(1).max(24).optional(),
  firstDueDate: z.string().optional(),
  physicalFileLocation: z.string().min(2, 'Folder location is required'),
  notes: z.string().max(1000).optional(),
});

export const ContractTemplateSchema = z.object({
  title: z.string().min(3, 'Template title is required'),
  benefitSpecies: z.string().min(2, 'Benefit species is required'),
  description: z.string().min(5, 'Description is required'),
  defaultFeeModel: z.enum(['QUOTA_LITIS', 'FIXED_INSTALLMENT', 'HYBRID']).default('QUOTA_LITIS'),
  defaultQuotaLitisPercentage: z.number().min(0).max(50).default(30),
  contentBody: z.string().min(50, 'Template clauses must be at least 50 characters'),
});

export type InstallmentPaymentInput = z.infer<typeof InstallmentPaymentSchema>;
export type PhysicalAttachmentUploadInput = z.infer<typeof PhysicalAttachmentUploadSchema>;
export type NewContractInput = z.infer<typeof NewContractSchema>;
export type ContractTemplateInput = z.infer<typeof ContractTemplateSchema>;
