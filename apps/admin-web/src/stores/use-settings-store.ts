import { create } from 'zustand';
import { BrandingConfig, IntegrationConnector } from '../features/settings/services/settings-service';

interface SettingsState {
  branding: BrandingConfig;
  integrations: IntegrationConnector[];
  setBranding: (branding: Partial<BrandingConfig>) => void;
  setIntegrations: (integrations: IntegrationConnector[]) => void;
}

const INITIAL_BRANDING: BrandingConfig = {
  organizationName: 'AyuNet Healthcare Network',
  primaryColor: '#0D9488',
  secondaryColor: '#4F46E5',
  logoUrl: '/images/ayunet-logo.png',
  emailHeaderHtml: '<div style="background:#0D9488;color:#fff;padding:12px;">AyuNet Official Communication</div>',
};

const INITIAL_INTEGRATIONS: IntegrationConnector[] = [
  { id: 'int-1', name: 'FHIR R4 Interoperability Gateway', category: 'FHIR', status: 'CONNECTED', lastPing: '2 mins ago' },
  { id: 'int-2', name: 'HL7 v2 Message Router', category: 'HL7', status: 'CONNECTED', lastPing: '1 min ago' },
  { id: 'int-3', name: 'Twilio SMS Dispatch Service', category: 'SMS', status: 'CONNECTED', lastPing: 'Just now' },
  { id: 'int-4', name: 'Meta WhatsApp Business API', category: 'WHATSAPP', status: 'CONNECTED', lastPing: '5 mins ago' },
  { id: 'int-5', name: 'Razorpay Enterprise Payments', category: 'PAYMENT', status: 'CONNECTED', lastPing: '10 mins ago' },
];

export const useSettingsStore = create<SettingsState>((set) => ({
  branding: INITIAL_BRANDING,
  integrations: INITIAL_INTEGRATIONS,

  setBranding: (partial) =>
    set((state) => ({ branding: { ...state.branding, ...partial } })),
  setIntegrations: (integrations) => set({ integrations }),
}));
