export type IntegrationStatus = "active" | "inactive" | "failed" | "pending";
export type IntegrationEnvironment = "sandbox" | "production";
export type IntegrationType =
  | "payment-gateway"
  | "insurance"
  | "hl7-fhir"
  | "email"
  | "sms"
  | "whatsapp"
  | "storage"
  | "webhook"
  | "api";

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  provider: string;
  status: IntegrationStatus;
  environment: IntegrationEnvironment;
  webhookEnabled: boolean;
  apiCallsToday: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGateway {
  id: string;
  provider: "razorpay" | "stripe" | "paypal" | "cashfree" | "payu";
  environment: IntegrationEnvironment;
  status: IntegrationStatus;
  webhookEnabled: boolean;
  transactionCount: number;
  successRate: number;
  createdAt: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  type: "government" | "private" | "corporate";
  status: IntegrationStatus;
  claimsCount: number;
  successRate: number;
  endpoint?: string;
  createdAt: string;
}

export interface Hl7FhirConfig {
  id: string;
  name: string;
  standard: "HL7" | "FHIR R4";
  endpointUrl: string;
  version: string;
  authentication: "none" | "basic" | "oauth2" | "api-key";
  status: IntegrationStatus;
  lastPing?: string;
  createdAt: string;
}

export type WebhookMethod = "POST" | "PUT" | "PATCH";
export type WebhookStatus = "active" | "inactive" | "failed";
export type WebhookEvent =
  | "patient.created"
  | "appointment.created"
  | "invoice.generated"
  | "claim.approved"
  | "tenant.created"
  | "hospital.added";

export interface Webhook {
  id: string;
  event: WebhookEvent;
  url: string;
  method: WebhookMethod;
  status: WebhookStatus;
  retryCount: number;
  lastTriggered?: string;
  secret?: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  responseCode: number;
  attempts: number;
  status: "success" | "failed" | "retrying";
  createdAt: string;
}

export interface EmailProvider {
  id: string;
  provider: "smtp" | "sendgrid" | "amazon-ses" | "mailgun";
  environment: IntegrationEnvironment;
  status: IntegrationStatus;
  fromAddress: string;
  emailsSentToday: number;
  createdAt: string;
}

export interface SmsProvider {
  id: string;
  provider: "twilio" | "msg91" | "textlocal";
  environment: IntegrationEnvironment;
  status: IntegrationStatus;
  smsSentToday: number;
  createdAt: string;
}

export interface WhatsAppProvider {
  id: string;
  provider: "twilio" | "meta-whatsapp" | "gupshup";
  environment: IntegrationEnvironment;
  status: IntegrationStatus;
  messagesSentToday: number;
  createdAt: string;
}

export interface StorageProvider {
  id: string;
  provider: "aws-s3" | "cloudinary" | "local";
  status: IntegrationStatus;
  totalFiles: number;
  storageUsedGB: number;
  storageLimitGB: number;
  documents: number;
  images: number;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  service: string;
  environment: IntegrationEnvironment;
  status: IntegrationStatus;
  keyMasked: string;
  lastUsed: string;
  createdAt: string;
}

export interface IntegrationHealthItem {
  service: string;
  status: IntegrationStatus;
  latencyMs: number;
  uptime: number;
  lastChecked: string;
}

export interface IntegrationStats {
  connectedIntegrations: number;
  activeIntegrations: number;
  failedIntegrations: number;
  apiCallsToday: number;
  webhookEvents: number;
  storageProviders: number;
}
