import { z } from 'zod';

export const brandingSchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required'),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color'),
  secondaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color'),
});

export type BrandingInputs = z.infer<typeof brandingSchema>;
