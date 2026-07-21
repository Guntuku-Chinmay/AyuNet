import { z } from 'zod';

export const labResultSchema = z.object({
  resultValue: z.string().min(1, 'Result value is required'),
  referenceRange: z.string().optional(),
  unit: z.string().optional(),
  isCritical: z.boolean().default(false),
  comments: z.string().optional(),
});

export type LabResultInputs = z.infer<typeof labResultSchema>;
