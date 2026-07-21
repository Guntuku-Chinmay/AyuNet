import { z } from 'zod';

export const patientRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  bloodGroup: z.string().optional(),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  emergencyContactRelationship: z.string().default('Family'),
  isEmergency: z.boolean().default(false),
  chiefComplaint: z.string().optional(),
});

export type PatientRegistrationInputs = z.infer<typeof patientRegistrationSchema>;
