'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Mail, MessageSquare, Bell, CheckCircle2 } from 'lucide-react';
import { messageComposerSchema, MessageComposerInputs } from '../schemas/communication-schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useCommunicationStore } from '../../../stores/use-communication-store';

export function MessageComposer() {
  const { addMessage } = useCommunicationStore();
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MessageComposerInputs>({
    resolver: zodResolver(messageComposerSchema),
    defaultValues: {
      recipient: 'rahul.sharma@gmail.com',
      channel: 'WHATSAPP',
      subject: 'Follow-up Consultation Reminder',
      content: '',
    },
  });

  const selectedChannel = watch('channel');

  const onSubmit = async (data: MessageComposerInputs) => {
    addMessage({
      id: `msg-${Date.now()}`,
      senderName: 'System Administrator',
      recipientName: data.recipient,
      recipientEmail: data.recipient,
      channel: data.channel,
      subject: data.subject || 'Direct Message',
      content: data.content,
      status: 'DELIVERED',
      sentAt: new Date().toLocaleTimeString(),
    });
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      reset();
    }, 2000);
  };

  return (
    <Card className="max-w-3xl mx-auto border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5 text-teal-600" />
          <span>Multi-Channel Message & Broadcast Composer</span>
        </CardTitle>
        <CardDescription>Dispatch patient notifications, doctor alerts, and tenant broadcasts.</CardDescription>
      </CardHeader>
      <CardContent>
        {isSent ? (
          <div className="space-y-3 rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
            <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">Message Dispatched Successfully!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">Sent via {selectedChannel} channel.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Dispatch Channel *</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(['WHATSAPP', 'SMS', 'EMAIL', 'IN_APP_PUSH'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setValue('channel', ch)}
                    className={`rounded-lg p-2.5 font-semibold text-xs border transition-all ${
                      selectedChannel === ch
                        ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Recipient Email / Phone / Group *" error={errors.recipient?.message} {...register('recipient')} />

            {selectedChannel === 'EMAIL' && (
              <Input label="Email Subject Line *" error={errors.subject?.message} {...register('subject')} />
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Message Content Body *</label>
              <textarea
                rows={4}
                placeholder="Type your message content or paste notification variables e.g. {{patientName}}..."
                {...register('content')}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
              {errors.content && <p className="text-xs text-red-500 font-medium">{errors.content.message}</p>}
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" isLoading={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
                <Send className="mr-1.5 h-4 w-4" /> Dispatch Notification
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
