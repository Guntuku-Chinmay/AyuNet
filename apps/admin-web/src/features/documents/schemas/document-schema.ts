import { z } from 'zod';

export const uploadMetadataSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  confidentiality: z.enum(['PUBLIC', 'RESTRICTED', 'CONFIDENTIAL']),
  description: z.string().optional(),
  tags: z.string().optional(),
});

export type UploadMetadataInputs = z.infer<typeof uploadMetadataSchema>;
