import { z } from 'zod';

export const customPromptSchema = z.object({
  title: z.string().min(1, 'Prompt title is required'),
  category: z.enum(['CLINICAL', 'ADMINISTRATIVE', 'PATIENT_EDUCATION']),
  promptText: z.string().min(1, 'Prompt content is required'),
});

export type CustomPromptInputs = z.infer<typeof customPromptSchema>;
