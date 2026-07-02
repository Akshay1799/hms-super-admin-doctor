import {
  MOCK_INTEGRATION_STATS, MOCK_INTEGRATIONS, MOCK_PAYMENT_GATEWAYS,
  MOCK_INSURANCE_PROVIDERS, MOCK_HL7_FHIR, MOCK_WEBHOOKS, MOCK_WEBHOOK_LOGS,
  MOCK_EMAIL_PROVIDERS, MOCK_SMS_PROVIDERS, MOCK_WHATSAPP_PROVIDERS,
  MOCK_STORAGE_PROVIDERS, MOCK_API_KEYS, MOCK_INTEGRATION_HEALTH,
} from '../mocks/integrations.mock';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const integrationService = {
  getStats: async () => {  return MOCK_INTEGRATION_STATS; },
  
  getIntegrations: async () => {  return MOCK_INTEGRATIONS; },
  
  getPaymentGateways: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_int_payments");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_int_payments", JSON.stringify(MOCK_PAYMENT_GATEWAYS));
    }
    return MOCK_PAYMENT_GATEWAYS;
  },
  savePaymentGateways: async (data: any[]) => {
    await delay(200);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_int_payments", JSON.stringify(data));
    }
    return data;
  },

  getInsuranceProviders: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_int_insurance");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_int_insurance", JSON.stringify(MOCK_INSURANCE_PROVIDERS));
    }
    return MOCK_INSURANCE_PROVIDERS;
  },
  saveInsuranceProviders: async (data: any[]) => {
    await delay(200);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_int_insurance", JSON.stringify(data));
    }
    return data;
  },

  getHl7Fhir: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_int_hl7");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_int_hl7", JSON.stringify(MOCK_HL7_FHIR));
    }
    return MOCK_HL7_FHIR;
  },
  saveHl7Fhir: async (data: any[]) => {
    await delay(200);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_int_hl7", JSON.stringify(data));
    }
    return data;
  },

  getWebhooks: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_int_webhooks");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_int_webhooks", JSON.stringify(MOCK_WEBHOOKS));
    }
    return MOCK_WEBHOOKS;
  },
  saveWebhooks: async (data: any[]) => {
    await delay(200);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_int_webhooks", JSON.stringify(data));
    }
    return data;
  },

  getWebhookLogs: async () => {  return MOCK_WEBHOOK_LOGS; },

  getEmailProviders: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_int_email");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_int_email", JSON.stringify(MOCK_EMAIL_PROVIDERS));
    }
    return MOCK_EMAIL_PROVIDERS;
  },
  saveEmailProviders: async (data: any[]) => {
    await delay(200);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_int_email", JSON.stringify(data));
    }
    return data;
  },

  getSmsProviders: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_int_sms");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_int_sms", JSON.stringify(MOCK_SMS_PROVIDERS));
    }
    return MOCK_SMS_PROVIDERS;
  },
  saveSmsProviders: async (data: any[]) => {
    await delay(200);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_int_sms", JSON.stringify(data));
    }
    return data;
  },

  getWhatsAppProviders: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_int_whatsapp");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_int_whatsapp", JSON.stringify(MOCK_WHATSAPP_PROVIDERS));
    }
    return MOCK_WHATSAPP_PROVIDERS;
  },
  saveWhatsAppProviders: async (data: any[]) => {
    await delay(200);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_int_whatsapp", JSON.stringify(data));
    }
    return data;
  },

  getStorageProviders: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_int_storage");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_int_storage", JSON.stringify(MOCK_STORAGE_PROVIDERS));
    }
    return MOCK_STORAGE_PROVIDERS;
  },
  saveStorageProviders: async (data: any[]) => {
    await delay(200);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_int_storage", JSON.stringify(data));
    }
    return data;
  },

  getApiKeys: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_int_apikeys");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("hms_int_apikeys", JSON.stringify(MOCK_API_KEYS));
    }
    return MOCK_API_KEYS;
  },
  saveApiKeys: async (data: any[]) => {
    await delay(200);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_int_apikeys", JSON.stringify(data));
    }
    return data;
  },

  getIntegrationHealth: async () => {  return MOCK_INTEGRATION_HEALTH; },
};
