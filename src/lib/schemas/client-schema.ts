import { z } from 'zod';
import { isValidCpf } from '../domain/cpf-validator';

export const ClientQuickIntakeSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Full name must have at least 3 characters')
    .max(150, 'Full name cannot exceed 150 characters'),
  mobilePhone: z
    .string()
    .min(8, 'Phone number must have at least 8 digits')
    .max(25, 'Phone number format too long'),
  cpf: z
    .string()
    .optional()
    .refine((val) => !val || isValidCpf(val), {
      message: 'Invalid CPF digits according to Brazilian Federal Revenue',
    }),
  benefitType: z
    .string()
    .min(2, 'Please indicate the desired benefit type'),
  notes: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .default('Initial reception intake'),
  status: z
    .enum(['PROSPECT', 'PENDING', 'CLOSED'])
    .default('PROSPECT'),
});

export const ClientFullRegistrationSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  cpf: z.string().optional().refine((val) => !val || isValidCpf(val), 'Invalid CPF'),
  rg: z.string().optional(),
  birthDate: z.string().optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'STABLE_UNION', 'DIVORCED', 'SEPARATED', 'WIDOWED', 'OTHER']).optional(),
  profession: z.string().optional(),
  nationality: z.string().default('Brasileira'),
  placeOfBirth: z.string().optional(),
  motherName: z.string().optional(),
  fatherName: z.string().optional(),

  // Address
  postalCode: z.string().optional(),
  street: z.string().optional(),
  streetNumber: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),

  // Contacts
  phone: z.string().optional(),
  mobilePhone: z.string().min(8, 'Mobile phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),

  // Benefit
  benefitType: z.string().min(2, 'Benefit type is required'),
  hasActiveBenefit: z.boolean().default(false),
  benefitNumber: z.string().max(20).optional(),
  specialCategories: z.array(z.string()).default([]),
  monthlyIncome: z.number().min(0).optional(),
  dependentCount: z.number().int().min(0).default(0),

  // Sensitive & Security
  inssPassword: z.string().optional(),
  photoReference: z.string().optional(),
  notes: z.string().optional(),
  physicalFileLocation: z.string().optional(),
});

export type ClientQuickIntakeInput = z.infer<typeof ClientQuickIntakeSchema>;
export type ClientFullRegistrationInput = z.infer<typeof ClientFullRegistrationSchema>;
