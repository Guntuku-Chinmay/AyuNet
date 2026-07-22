import { z } from 'zod';

export const globalSearchSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty'),
  filters: z.object({
    type: z.array(z.string()).optional(),
    department: z.string().optional(),
    status: z.string().optional(),
  }).optional(),
});

export type GlobalSearchInput = z.infer<typeof globalSearchSchema>;
