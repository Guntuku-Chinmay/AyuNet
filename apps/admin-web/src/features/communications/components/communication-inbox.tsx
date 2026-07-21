'use client';

import React from 'react';
import { Mail, MessageSquare, Send, CheckCheck, Clock, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useCommunicationStore } from '../../../stores/use-communication-store';

export function CommunicationInbox() {
  const { messages, selectedMessage, setSelectedMessage } = useCommunicationStore();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Messages List */}
      <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-bold flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-teal-600" />
            <span>Communication Inbox Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelectedMessage(msg)}
              className={`rounded-xl border p-3 cursor-pointer transition-all ${
                selectedMessage?.id === msg.id
                  ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100">{msg.recipientName}</span>
                <span className="font-mono text-[10px] text-slate-400">{msg.sentAt}</span>
              </div>
              <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 truncate mt-0.5">{msg.subject}</p>
              <div className="flex items-center justify-between pt-2">
                <Badge variant={msg.channel === 'WHATSAPP' ? 'success' : 'primary'} className="text-[9px]">
                  {msg.channel}
                </Badge>
                <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
                  <CheckCheck className="h-3 w-3 text-teal-600" />
                  <span>{msg.status}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Right Column: Selected Conversation Detail */}
      <Card className="lg:col-span-7 border-slate-200 dark:border-slate-800">
        <CardHeader className="py-3 border-b border-slate-200 dark:border-slate-800">
          {selectedMessage ? (
            <div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedMessage.subject}
                </CardTitle>
                <Badge variant="primary" className="font-mono">{selectedMessage.channel}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Recipient: <span className="font-semibold">{selectedMessage.recipientName}</span> ({selectedMessage.recipientEmail})
              </p>
            </div>
          ) : (
            <CardTitle className="text-sm">Select a message thread</CardTitle>
          )}
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          {selectedMessage && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {selectedMessage.content}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
