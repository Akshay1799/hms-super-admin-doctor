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
  getPaymentGateways: async () => {  return MOCK_PAYMENT_GATEWAYS; },
  getInsuranceProviders: async () => {  return MOCK_INSURANCE_PROVIDERS; },
  getHl7Fhir: async () => {  return MOCK_HL7_FHIR; },
  getWebhooks: async () => {  return MOCK_WEBHOOKS; },
  getWebhookLogs: async () => {  return MOCK_WEBHOOK_LOGS; },
  getEmailProviders: async () => {  return MOCK_EMAIL_PROVIDERS; },
  getSmsProviders: async () => {  return MOCK_SMS_PROVIDERS; },
  getWhatsAppProviders: async () => {  return MOCK_WHATSAPP_PROVIDERS; },
  getStorageProviders: async () => {  return MOCK_STORAGE_PROVIDERS; },
  getApiKeys: async () => {  return MOCK_API_KEYS; },
  getIntegrationHealth: async () => {  return MOCK_INTEGRATION_HEALTH; },
};
