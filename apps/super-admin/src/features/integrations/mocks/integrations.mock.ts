import {
  Integration, PaymentGateway, InsuranceProvider, Hl7FhirConfig,
  Webhook, WebhookLog, EmailProvider, SmsProvider, WhatsAppProvider,
  StorageProvider, ApiKey, IntegrationHealthItem, IntegrationStats,
} from '../types/integrations.types';

export const MOCK_INTEGRATION_STATS: IntegrationStats = {
  connectedIntegrations: 14,
  activeIntegrations: 11,
  failedIntegrations: 2,
  apiCallsToday: 4823,
  webhookEvents: 312,
  storageProviders: 2,
};

export const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int-1', name: 'Stripe Production', type: 'payment-gateway', provider: 'stripe', status: 'active', environment: 'production', webhookEnabled: true, apiCallsToday: 1240, createdAt: '2026-01-10T09:00:00Z', updatedAt: '2026-06-20T10:00:00Z' },
  { id: 'int-2', name: 'Razorpay Sandbox', type: 'payment-gateway', provider: 'razorpay', status: 'active', environment: 'sandbox', webhookEnabled: true, apiCallsToday: 320, createdAt: '2026-02-15T09:00:00Z', updatedAt: '2026-06-18T10:00:00Z' },
  { id: 'int-3', name: 'SendGrid Email', type: 'email', provider: 'sendgrid', status: 'active', environment: 'production', webhookEnabled: false, apiCallsToday: 890, createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-06-22T10:00:00Z' },
  { id: 'int-4', name: 'Twilio SMS', type: 'sms', provider: 'twilio', status: 'active', environment: 'production', webhookEnabled: false, apiCallsToday: 450, createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-06-21T10:00:00Z' },
  { id: 'int-5', name: 'AWS S3 Storage', type: 'storage', provider: 'aws-s3', status: 'active', environment: 'production', webhookEnabled: false, apiCallsToday: 1100, createdAt: '2026-01-05T09:00:00Z', updatedAt: '2026-06-23T10:00:00Z' },
  { id: 'int-6', name: 'Meta WhatsApp', type: 'whatsapp', provider: 'meta-whatsapp', status: 'failed', environment: 'production', webhookEnabled: true, apiCallsToday: 0, createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-06-22T15:00:00Z' },
  { id: 'int-7', name: 'FHIR R4 Apollo', type: 'hl7-fhir', provider: 'fhir-r4', status: 'active', environment: 'production', webhookEnabled: false, apiCallsToday: 823, createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-06-23T08:00:00Z' },
];

export const MOCK_PAYMENT_GATEWAYS: PaymentGateway[] = [
  { id: 'pg-1', provider: 'stripe', environment: 'production', status: 'active', webhookEnabled: true, transactionCount: 4521, successRate: 98.2, createdAt: '2026-01-10T09:00:00Z' },
  { id: 'pg-2', provider: 'razorpay', environment: 'sandbox', status: 'active', webhookEnabled: true, transactionCount: 892, successRate: 97.5, createdAt: '2026-02-15T09:00:00Z' },
  { id: 'pg-3', provider: 'paypal', environment: 'production', status: 'inactive', webhookEnabled: false, transactionCount: 210, successRate: 95.0, createdAt: '2026-03-01T09:00:00Z' },
  { id: 'pg-4', provider: 'cashfree', environment: 'sandbox', status: 'pending', webhookEnabled: false, transactionCount: 0, successRate: 0, createdAt: '2026-06-20T09:00:00Z' },
  { id: 'pg-5', provider: 'payu', environment: 'production', status: 'failed', webhookEnabled: true, transactionCount: 1200, successRate: 91.3, createdAt: '2026-01-25T09:00:00Z' },
];

export const MOCK_INSURANCE_PROVIDERS: InsuranceProvider[] = [
  { id: 'ins-1', name: 'BlueCross BlueShield', type: 'private', status: 'active', claimsCount: 1240, successRate: 94.2, endpoint: 'https://api.bcbs.com/claims/v2', createdAt: '2026-01-10T09:00:00Z' },
  { id: 'ins-2', name: 'Aetna', type: 'private', status: 'active', claimsCount: 880, successRate: 91.5, endpoint: 'https://api.aetna.com/v1', createdAt: '2026-02-05T09:00:00Z' },
  { id: 'ins-3', name: 'Government PMJAY', type: 'government', status: 'active', claimsCount: 3200, successRate: 88.0, endpoint: 'https://pmjay.gov.in/api', createdAt: '2026-01-01T09:00:00Z' },
  { id: 'ins-4', name: 'Cigna Corporate', type: 'corporate', status: 'inactive', claimsCount: 450, successRate: 96.0, createdAt: '2026-03-15T09:00:00Z' },
];

export const MOCK_HL7_FHIR: Hl7FhirConfig[] = [
  { id: 'hl7-1', name: 'Apollo FHIR Gateway', standard: 'FHIR R4', endpointUrl: 'https://fhir.apollo.com/r4', version: 'R4 (4.0.1)', authentication: 'oauth2', status: 'active', lastPing: '2026-06-23T07:00:00Z', createdAt: '2026-03-10T09:00:00Z' },
  { id: 'hl7-2', name: 'Fortis HL7 Interface', standard: 'HL7', endpointUrl: 'hl7://fortis.internal:2575', version: 'v2.5', authentication: 'basic', status: 'active', lastPing: '2026-06-23T06:45:00Z', createdAt: '2026-04-01T09:00:00Z' },
];

export const MOCK_WEBHOOKS: Webhook[] = [
  { id: 'wh-1', event: 'patient.created', url: 'https://hooks.tenant1.com/patient', method: 'POST', status: 'active', retryCount: 3, lastTriggered: '2026-06-23T06:55:00Z' },
  { id: 'wh-2', event: 'invoice.generated', url: 'https://billing.example.com/webhook', method: 'POST', status: 'active', retryCount: 3, lastTriggered: '2026-06-23T05:30:00Z' },
  { id: 'wh-3', event: 'claim.approved', url: 'https://insurance.corp.com/notify', method: 'POST', status: 'failed', retryCount: 5, lastTriggered: '2026-06-22T12:00:00Z' },
  { id: 'wh-4', event: 'tenant.created', url: 'https://crm.hms.com/onboard', method: 'POST', status: 'active', retryCount: 2, lastTriggered: '2026-06-20T09:00:00Z' },
  { id: 'wh-5', event: 'appointment.created', url: 'https://calendar.app.com/sync', method: 'PUT', status: 'inactive', retryCount: 0 },
];

export const MOCK_WEBHOOK_LOGS: WebhookLog[] = [
  { id: 'wl-1', webhookId: 'wh-1', event: 'patient.created', responseCode: 200, attempts: 1, status: 'success', createdAt: '2026-06-23T06:55:00Z' },
  { id: 'wl-2', webhookId: 'wh-2', event: 'invoice.generated', responseCode: 200, attempts: 1, status: 'success', createdAt: '2026-06-23T05:30:00Z' },
  { id: 'wl-3', webhookId: 'wh-3', event: 'claim.approved', responseCode: 503, attempts: 5, status: 'failed', createdAt: '2026-06-22T12:00:00Z' },
  { id: 'wl-4', webhookId: 'wh-3', event: 'claim.approved', responseCode: 504, attempts: 3, status: 'retrying', createdAt: '2026-06-22T11:00:00Z' },
  { id: 'wl-5', webhookId: 'wh-4', event: 'tenant.created', responseCode: 201, attempts: 1, status: 'success', createdAt: '2026-06-20T09:00:00Z' },
];

export const MOCK_EMAIL_PROVIDERS: EmailProvider[] = [
  { id: 'ep-1', provider: 'sendgrid', environment: 'production', status: 'active', fromAddress: 'no-reply@hms.com', emailsSentToday: 890, createdAt: '2026-01-20T09:00:00Z' },
  { id: 'ep-2', provider: 'amazon-ses', environment: 'sandbox', status: 'active', fromAddress: 'test@hms-dev.com', emailsSentToday: 45, createdAt: '2026-03-10T09:00:00Z' },
  { id: 'ep-3', provider: 'mailgun', environment: 'production', status: 'inactive', fromAddress: 'noreply@hms.io', emailsSentToday: 0, createdAt: '2026-02-01T09:00:00Z' },
];

export const MOCK_SMS_PROVIDERS: SmsProvider[] = [
  { id: 'sp-1', provider: 'twilio', environment: 'production', status: 'active', smsSentToday: 450, createdAt: '2026-02-01T09:00:00Z' },
  { id: 'sp-2', provider: 'msg91', environment: 'production', status: 'active', smsSentToday: 210, createdAt: '2026-04-10T09:00:00Z' },
  { id: 'sp-3', provider: 'textlocal', environment: 'sandbox', status: 'inactive', smsSentToday: 0, createdAt: '2026-05-01T09:00:00Z' },
];

export const MOCK_WHATSAPP_PROVIDERS: WhatsAppProvider[] = [
  { id: 'wa-1', provider: 'twilio', environment: 'production', status: 'active', messagesSentToday: 312, createdAt: '2026-03-01T09:00:00Z' },
  { id: 'wa-2', provider: 'meta-whatsapp', environment: 'production', status: 'failed', messagesSentToday: 0, createdAt: '2026-04-01T09:00:00Z' },
  { id: 'wa-3', provider: 'gupshup', environment: 'sandbox', status: 'active', messagesSentToday: 58, createdAt: '2026-05-15T09:00:00Z' },
];

export const MOCK_STORAGE_PROVIDERS: StorageProvider[] = [
  { id: 'str-1', provider: 'aws-s3', status: 'active', totalFiles: 48200, storageUsedGB: 128.4, storageLimitGB: 500, documents: 28000, images: 20200, createdAt: '2026-01-05T09:00:00Z' },
  { id: 'str-2', provider: 'cloudinary', status: 'active', totalFiles: 12400, storageUsedGB: 24.8, storageLimitGB: 100, documents: 2400, images: 10000, createdAt: '2026-02-10T09:00:00Z' },
];

export const MOCK_API_KEYS: ApiKey[] = [
  { id: 'ak-1', service: 'Stripe', environment: 'production', status: 'active', keyMasked: 'sk_live_••••••••••••••••••••••••Xq9R', lastUsed: '2026-06-23T07:00:00Z', createdAt: '2026-01-10T09:00:00Z' },
  { id: 'ak-2', service: 'Razorpay', environment: 'sandbox', status: 'active', keyMasked: 'rzp_test_••••••••••••••••••••••••Ab3K', lastUsed: '2026-06-23T06:30:00Z', createdAt: '2026-02-15T09:00:00Z' },
  { id: 'ak-3', service: 'SendGrid', environment: 'production', status: 'active', keyMasked: 'SG.••••••••••••••••••••••••••••••••Wm7Z', lastUsed: '2026-06-23T05:00:00Z', createdAt: '2026-01-20T09:00:00Z' },
  { id: 'ak-4', service: 'Twilio', environment: 'production', status: 'active', keyMasked: 'AC••••••••••••••••••••••••••••••••1c4F', lastUsed: '2026-06-22T22:00:00Z', createdAt: '2026-02-01T09:00:00Z' },
  { id: 'ak-5', service: 'Meta WhatsApp', environment: 'production', status: 'inactive', keyMasked: 'EAA••••••••••••••••••••••••••••••••9kP', lastUsed: '2026-06-20T10:00:00Z', createdAt: '2026-04-01T09:00:00Z' },
  { id: 'ak-6', service: 'AWS S3', environment: 'production', status: 'active', keyMasked: 'AKIA••••••••••••••••••••Lz9Q', lastUsed: '2026-06-23T07:05:00Z', createdAt: '2026-01-05T09:00:00Z' },
];

export const MOCK_INTEGRATION_HEALTH: IntegrationHealthItem[] = [
  { service: 'Payment Gateway (Stripe)', status: 'active', latencyMs: 124, uptime: 99.98, lastChecked: '2026-06-23T07:09:00Z' },
  { service: 'Email Provider (SendGrid)', status: 'active', latencyMs: 88, uptime: 99.95, lastChecked: '2026-06-23T07:09:00Z' },
  { service: 'SMS Provider (Twilio)', status: 'active', latencyMs: 145, uptime: 99.90, lastChecked: '2026-06-23T07:09:00Z' },
  { service: 'WhatsApp (Meta)', status: 'failed', latencyMs: 9999, uptime: 82.30, lastChecked: '2026-06-23T07:09:00Z' },
  { service: 'Storage (AWS S3)', status: 'active', latencyMs: 56, uptime: 100.00, lastChecked: '2026-06-23T07:09:00Z' },
  { service: 'FHIR Gateway (Apollo)', status: 'active', latencyMs: 210, uptime: 99.70, lastChecked: '2026-06-23T07:09:00Z' },
  { service: 'Insurance (BlueCross)', status: 'active', latencyMs: 340, uptime: 98.50, lastChecked: '2026-06-23T07:09:00Z' },
];
