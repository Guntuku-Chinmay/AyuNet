import { create } from 'zustand';
import { CommunicationMessage, NotificationTemplate } from '../features/communications/services/communication-service';

interface CommunicationState {
  messages: CommunicationMessage[];
  templates: NotificationTemplate[];
  selectedMessage: CommunicationMessage | null;
  addMessage: (message: CommunicationMessage) => void;
  setSelectedMessage: (message: CommunicationMessage | null) => void;
}

const INITIAL_MESSAGES: CommunicationMessage[] = [
  {
    id: 'msg-101',
    senderName: 'Dr. Priya Mehta',
    recipientName: 'Rahul Sharma',
    recipientEmail: 'rahul.sharma@gmail.com',
    channel: 'WHATSAPP',
    subject: 'Appointment Follow-up Reminder',
    content: 'Hi Rahul, this is a reminder for your upcoming Cardiology follow-up visit on Aug 4th at 10:00 AM.',
    status: 'DELIVERED',
    sentAt: '2026-07-21 10:30 AM',
  },
  {
    id: 'msg-102',
    senderName: 'AyuNet Diagnostic Lab',
    recipientName: 'Ananya Patel',
    recipientEmail: 'ananya.p@gmail.com',
    channel: 'SMS',
    subject: 'Pathology Report Ready',
    content: 'Dear Ananya, your Serum HbA1c test report is ready for download in your patient portal.',
    status: 'READ',
    sentAt: '2026-07-21 09:45 AM',
  },
];

const INITIAL_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tpl-101',
    code: 'APT_REMINDER_SMS',
    name: 'Appointment Reminder SMS',
    channel: 'SMS',
    bodyTemplate: 'Dear {{patientName}}, your appointment with {{doctorName}} is scheduled for {{appointmentTime}}.',
  },
  {
    id: 'tpl-102',
    code: 'LAB_REPORT_WHATSAPP',
    name: 'Lab Report Ready WhatsApp',
    channel: 'WHATSAPP',
    bodyTemplate: 'Hello {{patientName}}, your {{testName}} diagnostic report is ready for download: {{downloadUrl}}.',
  },
];

export const useCommunicationStore = create<CommunicationState>((set) => ({
  messages: INITIAL_MESSAGES,
  templates: INITIAL_TEMPLATES,
  selectedMessage: INITIAL_MESSAGES[0],

  addMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),
  setSelectedMessage: (selectedMessage) => set({ selectedMessage }),
}));
