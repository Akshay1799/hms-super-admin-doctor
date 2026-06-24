import { useQuery } from '@tanstack/react-query';
import { integrationService } from '../services/integrations.service';

export const useIntegrationStats = () =>
  useQuery({ queryKey: ['integration-stats'], queryFn: integrationService.getStats });

export const useIntegrations = () =>
  useQuery({ queryKey: ['integrations'], queryFn: integrationService.getIntegrations });

export const usePaymentGateways = () =>
  useQuery({ queryKey: ['payment-gateways'], queryFn: integrationService.getPaymentGateways });

export const useInsuranceProviders = () =>
  useQuery({ queryKey: ['insurance-providers'], queryFn: integrationService.getInsuranceProviders });

export const useHl7Fhir = () =>
  useQuery({ queryKey: ['hl7-fhir'], queryFn: integrationService.getHl7Fhir });

export const useWebhooks = () =>
  useQuery({ queryKey: ['webhooks'], queryFn: integrationService.getWebhooks });

export const useWebhookLogs = () =>
  useQuery({ queryKey: ['webhook-logs'], queryFn: integrationService.getWebhookLogs });

export const useEmailProviders = () =>
  useQuery({ queryKey: ['email-providers'], queryFn: integrationService.getEmailProviders });

export const useSmsProviders = () =>
  useQuery({ queryKey: ['sms-providers'], queryFn: integrationService.getSmsProviders });

export const useWhatsAppProviders = () =>
  useQuery({ queryKey: ['whatsapp-providers'], queryFn: integrationService.getWhatsAppProviders });

export const useStorageProviders = () =>
  useQuery({ queryKey: ['storage'], queryFn: integrationService.getStorageProviders });

export const useApiKeys = () =>
  useQuery({ queryKey: ['api-keys'], queryFn: integrationService.getApiKeys });

export const useIntegrationHealth = () =>
  useQuery({ queryKey: ['integration-health'], queryFn: integrationService.getIntegrationHealth });
