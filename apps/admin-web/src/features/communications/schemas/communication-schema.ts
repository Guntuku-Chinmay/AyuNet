import { z } from 'zod';

export const messageComposerSchema = z.object({
  recipient: z.string().min(1, 'Recipient is required'),
  channel: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'IN_APP_PUSH']),
  subject: z.string().optional(),
  content: z.string().min(1, 'Message content is required'),
});

export type MessageComposerInputs = z.infer<typeof messageComposerSchema>;
