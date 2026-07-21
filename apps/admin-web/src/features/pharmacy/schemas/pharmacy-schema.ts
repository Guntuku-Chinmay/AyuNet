import { z } from 'zod';

export const dispenseFormSchema = z.object({
  batchNumber: z.string().min(1, 'Batch selection is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  pharmacistNotes: z.string().optional(),
});

export type DispenseFormInputs = z.infer<typeof dispenseFormSchema>;
