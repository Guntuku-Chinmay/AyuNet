import { z } from 'zod';

export const caregiverInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  relationship: z.string().min(1, 'Relationship designation is required'),
  permissions: z.array(z.string()).min(1, 'Select at least one caregiver permission'),
});

export type CaregiverInviteInputs = z.infer<typeof caregiverInviteSchema>;
