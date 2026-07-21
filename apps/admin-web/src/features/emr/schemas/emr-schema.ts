import { z } from 'zod';

export const emrFormSchema = z.object({
  subjective: z.string().min(1, 'Subjective chief complaint is required'),
  objective: z.string().min(1, 'Objective examination notes are required'),
  assessment: z.string().min(1, 'Clinical assessment is required'),
  plan: z.string().min(1, 'Treatment plan is required'),
});

export type EmrFormInputs = z.infer<typeof emrFormSchema>;
