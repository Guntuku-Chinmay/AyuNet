import { z } from 'zod';

export const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  strength: z.string().min(1, 'Strength is required'),
  dosage: z.string().default('1 Tablet'),
  frequency: z.string().min(1, 'Frequency (e.g. 1-0-1) is required'),
  route: z.string().default('Oral'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day'),
  foodTiming: z.string().default('After Food'),
});

export type MedicationInputs = z.infer<typeof medicationSchema>;
