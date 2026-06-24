import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings.service';

export const useGeneralSettings = () => useQuery({ queryKey: ['settings', 'general'], queryFn: settingsService.getGeneralSettings });
export const useSecurityPolicy = () => useQuery({ queryKey: ['settings', 'security'], queryFn: settingsService.getSecurityPolicy });
export const useFeatureFlags = () => useQuery({ queryKey: ['settings', 'feature-flags'], queryFn: settingsService.getFeatureFlags });
export const useBranding = () => useQuery({ queryKey: ['settings', 'branding'], queryFn: settingsService.getBranding });
export const useStorageSettings = () => useQuery({ queryKey: ['settings', 'storage'], queryFn: settingsService.getStorageSettings });
export const useRetentionPolicies = () => useQuery({ queryKey: ['settings', 'retention'], queryFn: settingsService.getRetentionPolicies });
export const useEnvironment = () => useQuery({ queryKey: ['settings', 'environment'], queryFn: settingsService.getEnvironment });
export const useSystemMetrics = () => useQuery({ queryKey: ['settings', 'system'], queryFn: settingsService.getSystemMetrics });

export const useToggleFeatureFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => settingsService.toggleFeatureFlag(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'feature-flags'] }),
  });
};
