import { z } from 'zod';

export const reportBuilderSchema = z.object({
  dataset: z.string().min(1, 'Dataset selection is required'),
  dateFrom: z.string().min(1, 'Start date is required'),
  dateTo: z.string().min(1, 'End date is required'),
  format: z.enum(['CSV', 'EXCEL', 'PDF']).default('CSV'),
});

export type ReportBuilderInputs = z.infer<typeof reportBuilderSchema>;
