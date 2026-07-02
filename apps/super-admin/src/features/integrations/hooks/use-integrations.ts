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

import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateEmailProviders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => integrationService.saveEmailProviders(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['email-providers'] }),
  });
};

export const useUpdateSmsProviders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => integrationService.saveSmsProviders(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sms-providers'] }),
  });
};

export const useUpdateWhatsAppProviders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => integrationService.saveWhatsAppProviders(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsapp-providers'] }),
  });
};

export const useUpdatePaymentGateways = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => integrationService.savePaymentGateways(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-gateways'] }),
  });
};

export const useUpdateInsuranceProviders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => integrationService.saveInsuranceProviders(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insurance-providers'] }),
  });
};

export const useUpdateHl7Fhir = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => integrationService.saveHl7Fhir(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hl7-fhir'] }),
  });
};

export const useUpdateStorageProviders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => integrationService.saveStorageProviders(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['storage'] }),
  });
};

export const useUpdateApiKeys = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => integrationService.saveApiKeys(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
};

export const useUpdateWebhooks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => integrationService.saveWebhooks(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] }),
  });
};
