import {
  MOCK_GENERAL_SETTINGS, MOCK_SECURITY_POLICY, MOCK_FEATURE_FLAGS,
  MOCK_BRANDING, MOCK_STORAGE, MOCK_RETENTION_POLICIES,
  MOCK_ENVIRONMENT, MOCK_SYSTEM_METRICS
} from '../mocks/settings.mock';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const settingsService = {
  getGeneralSettings: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_settings_general");
      if (saved) return JSON.parse(saved);
    }
    return MOCK_GENERAL_SETTINGS;
  },
  getSecurityPolicy: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_settings_security");
      if (saved) return JSON.parse(saved);
    }
    return MOCK_SECURITY_POLICY;
  },
  getFeatureFlags: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_settings_feature_flags");
      if (saved) return JSON.parse(saved);
    }
    return MOCK_FEATURE_FLAGS;
  },
  getBranding: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_settings_branding");
      if (saved) return JSON.parse(saved);
    }
    return MOCK_BRANDING;
  },
  getStorageSettings: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_settings_storage");
      if (saved) return JSON.parse(saved);
    }
    return MOCK_STORAGE;
  },
  getRetentionPolicies: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_settings_retention");
      if (saved) return JSON.parse(saved);
    }
    return MOCK_RETENTION_POLICIES;
  },
  getEnvironment: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hms_settings_environment");
      if (saved) return JSON.parse(saved);
    }
    return MOCK_ENVIRONMENT;
  },
  getSystemMetrics: async () => { return MOCK_SYSTEM_METRICS; },
  
  updateGeneralSettings: async (data: any) => {
    await delay(300);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_settings_general", JSON.stringify(data));
    }
    return data;
  },
  updateSecurityPolicy: async (data: any) => {
    await delay(300);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_settings_security", JSON.stringify(data));
    }
    return data;
  },
  updateBranding: async (data: any) => {
    await delay(300);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_settings_branding", JSON.stringify(data));
    }
    return data;
  },
  updateStorageSettings: async (data: any) => {
    await delay(300);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_settings_storage", JSON.stringify(data));
    }
    return data;
  },
  updateEnvironment: async (data: any) => {
    await delay(300);
    if (typeof window !== "undefined") {
      localStorage.setItem("hms_settings_environment", JSON.stringify(data));
    }
    return data;
  },
  toggleFeatureFlag: async (id: string, enabled: boolean) => {
    if (typeof window !== "undefined") {
      const current = localStorage.getItem("hms_settings_feature_flags");
      const list = current ? JSON.parse(current) : MOCK_FEATURE_FLAGS;
      const updated = list.map((f: any) => f.id === id ? { ...f, enabled } : f);
      localStorage.setItem("hms_settings_feature_flags", JSON.stringify(updated));
    }
    return { id, enabled };
  },
};
