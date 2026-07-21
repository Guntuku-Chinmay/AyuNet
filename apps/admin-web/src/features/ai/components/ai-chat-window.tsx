'use client';

import React, { useState } from 'react';
import { Bot, Send, User, ThumbsUp, ThumbsDown, BookOpen, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { useAiStore } from '../../../stores/use-ai-store';

export function AiChatWindow() {
  const { messages, addMessage, selectedModel } = useAiStore();
  const [inputPrompt, setInputPrompt] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, string>>({});

  const handleSend = () => {
    if (!inputPrompt.trim()) return;

    addMessage({
      id: `usr-${Date.now()}`,
      sender: 'USER',
      content: inputPrompt,
      timestamp: new Date().toLocaleTimeString(),
    });

    const userText = inputPrompt;
    setInputPrompt('');

    setTimeout(() => {
      addMessage({
        id: `ai-${Date.now()}`,
        sender: 'ASSISTANT',
        content: `Regarding your query "${userText}": Based on current clinical guidelines, I have analyzed the patient's record. Patient exhibits elevated serum potassium levels. Recommended action: Order repeat STAT electrolyte panel & ECG monitoring.`,
        citations: ['ACC/AHA 2026 Clinical Practice Guideline on Electrolyte Abnormalities'],
        requiresReview: true,
        timestamp: new Date().toLocaleTimeString(),
      });
    }, 1000);
  };

  const handleActionClick = (actionText: string) => {
    setInputPrompt(actionText);
  };

  return (
    <Card className="flex flex-col h-[700px] border-slate-200 dark:border-slate-800">
      <CardHeader className="py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-teal-600" />
            <div>
              <CardTitle className="text-sm font-bold">AyuNet Clinical AI Copilot</CardTitle>
              <CardDescription className="text-[11px]">Provider: {selectedModel}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            CONTEXT: PATIENT (RAHUL SHARMA)
          </Badge>
        </div>
      </CardHeader>

      {/* Message Feed Container */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex space-x-3 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ASSISTANT' && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div className={`max-w-xl rounded-xl p-3.5 space-y-2 ${
              msg.sender === 'USER'
                ? 'bg-teal-600 text-white'
                : 'border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
            }`}>
              <p className="leading-relaxed">{msg.content}</p>

              {msg.citations && msg.citations.length > 0 && (
                <div className="rounded bg-teal-50/80 p-2 text-[10px] border border-teal-200 dark:border-teal-900 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 space-y-1">
                  <p className="font-bold flex items-center">
                    <BookOpen className="mr-1 h-3 w-3" /> Medical Literature Citations:
                  </p>
                  {msg.citations.map((c) => (
                    <p key={c} className="font-mono">{c}</p>
                  ))}
                </div>
              )}

              {msg.requiresReview && (
                <div className="rounded bg-amber-100 p-2 text-[10px] text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  <span>AI-GENERATED DRAFT - MANDATORY CLINICIAN REVIEW REQUIRED</span>
                </div>
              )}

              {msg.sender === 'ASSISTANT' && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setFeedbackGiven((prev) => ({ ...prev, [msg.id]: 'UP' }))} className="hover:text-teal-600">
                      <ThumbsUp className={`h-3 w-3 ${feedbackGiven[msg.id] === 'UP' ? 'text-teal-600' : ''}`} />
                    </button>
                    <button onClick={() => setFeedbackGiven((prev) => ({ ...prev, [msg.id]: 'DOWN' }))} className="hover:text-rose-600">
                      <ThumbsDown className={`h-3 w-3 ${feedbackGiven[msg.id] === 'DOWN' ? 'text-rose-600' : ''}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>

      {/* Suggested Action Chips */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex space-x-2 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleActionClick('Draft SOAP Note for Rahul Sharma based on today’s visit.')}
          className="rounded-full border border-teal-300 bg-white px-3 py-1 text-teal-800 font-medium hover:bg-teal-50 transition-colors whitespace-nowrap dark:border-teal-900 dark:bg-slate-800 dark:text-teal-300"
        >
          <Sparkles className="inline mr-1 h-3 w-3" /> Draft SOAP Note
        </button>
        <button
          onClick={() => handleActionClick('Explain Serum Potassium 6.8 mmol/L lab result for patient education.')}
          className="rounded-full border border-teal-300 bg-white px-3 py-1 text-teal-800 font-medium hover:bg-teal-50 transition-colors whitespace-nowrap dark:border-teal-900 dark:bg-slate-800 dark:text-teal-300"
        >
          <Sparkles className="inline mr-1 h-3 w-3" /> Explain Lab Result
        </button>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex space-x-2">
        <Input
          placeholder="Ask AI Copilot (e.g. 'Summarize patient medical history', 'Draft referral letter')..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} className="bg-teal-600 hover:bg-teal-700">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
