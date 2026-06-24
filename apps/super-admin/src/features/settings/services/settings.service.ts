import {
  MOCK_GENERAL_SETTINGS, MOCK_SECURITY_POLICY, MOCK_FEATURE_FLAGS,
  MOCK_BRANDING, MOCK_STORAGE, MOCK_RETENTION_POLICIES,
  MOCK_ENVIRONMENT, MOCK_SYSTEM_METRICS
} from '../mocks/settings.mock';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const settingsService = {
  getGeneralSettings: async () => {  return MOCK_GENERAL_SETTINGS; },
  getSecurityPolicy: async () => {  return MOCK_SECURITY_POLICY; },
  getFeatureFlags: async () => {  return MOCK_FEATURE_FLAGS; },
  getBranding: async () => {  return MOCK_BRANDING; },
  getStorageSettings: async () => {  return MOCK_STORAGE; },
  getRetentionPolicies: async () => {  return MOCK_RETENTION_POLICIES; },
  getEnvironment: async () => {  return MOCK_ENVIRONMENT; },
  getSystemMetrics: async () => {  return MOCK_SYSTEM_METRICS; },
  
  updateGeneralSettings: async (data: any) => {  return data; },
  updateSecurityPolicy: async (data: any) => {  return data; },
  toggleFeatureFlag: async (id: string, enabled: boolean) => {  return { id, enabled }; },
};
