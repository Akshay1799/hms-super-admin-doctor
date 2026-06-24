import { Tenant, TenantSubscription, TenantDomain, FeatureFlags, UsageQuota, TenantAuditLog } from "../types/tenant.types";

export const MOCK_TENANTS: Tenant[] = [
  { id: "1", name: "Apollo Health Group", code: "APOLLO", plan: "Enterprise", status: "Active", hospitalCount: 14, branchCount: 28, userCount: 1840, storageUsed: 1420, createdAt: "2026-01-12" },
  { id: "2", name: "CareFirst Clinics", code: "CAREFIRST", plan: "Professional", status: "Trial", hospitalCount: 3, branchCount: 6, userCount: 120, storageUsed: 92, createdAt: "2026-05-20" },
  { id: "3", name: "Sutter Regional Labs", code: "SUTTER", plan: "Basic", status: "Inactive", hospitalCount: 1, branchCount: 2, userCount: 45, storageUsed: 22, createdAt: "2026-04-15" },
  { id: "4", name: "Max Medical Solutions", code: "MAXMED", plan: "Enterprise", status: "Suspended", hospitalCount: 22, branchCount: 44, userCount: 2900, storageUsed: 3100, createdAt: "2025-11-01" },
];

export const MOCK_SUBSCRIPTIONS: Record<string, TenantSubscription> = {
  "1": { plan: "Enterprise", renewalDate: "2027-01-12", billingCycle: "Yearly", status: "Active", amount: 15000 },
  "2": { plan: "Professional", renewalDate: "2026-06-20", billingCycle: "Monthly", status: "Trial", amount: 450 },
  "3": { plan: "Basic", renewalDate: "2026-07-15", billingCycle: "Monthly", status: "Inactive", amount: 150 },
  "4": { plan: "Enterprise", renewalDate: "2026-11-01", billingCycle: "Yearly", status: "Suspended", amount: 12000 },
};

export const MOCK_DOMAINS: Record<string, TenantDomain> = {
  "1": { id: "d-1", primaryDomain: "apollo.medichain.com", customDomain: "portal.apollohospitals.com", sslEnabled: true, verified: true },
  "2": { id: "d-2", primaryDomain: "carefirst.medichain.com", sslEnabled: true, verified: true },
  "3": { id: "d-3", primaryDomain: "sutter.medichain.com", sslEnabled: true, verified: false },
  "4": { id: "d-4", primaryDomain: "maxmed.medichain.com", customDomain: "governance.maxmedical.com", sslEnabled: true, verified: true },
};

export const MOCK_FEATURE_FLAGS: Record<string, FeatureFlags> = {
  "1": { emr: true, appointments: true, billing: true, pharmacy: true, inventory: true, laboratory: true, radiology: true, insurance: true, telemedicine: true, notifications: true, reports: true },
  "2": { emr: true, appointments: true, billing: true, pharmacy: false, inventory: false, laboratory: false, radiology: false, insurance: false, telemedicine: false, notifications: true, reports: true },
  "3": { emr: true, appointments: true, billing: true, pharmacy: false, inventory: false, laboratory: false, radiology: false, insurance: false, telemedicine: false, notifications: false, reports: false },
  "4": { emr: true, appointments: true, billing: true, pharmacy: true, inventory: true, laboratory: true, radiology: true, insurance: true, telemedicine: true, notifications: true, reports: true },
};

export const MOCK_QUOTAS: Record<string, UsageQuota> = {
  "1": {
    hospitals: { current: 14, max: 20 },
    branches: { current: 28, max: 50 },
    doctors: { current: 340, max: 500 },
    staff: { current: 1500, max: 2000 },
    patients: { current: 14205, max: 50000 },
    storage: { current: 1420, max: 5000 },
    apiCalls: { current: 420000, max: 1000000 },
  },
  "2": {
    hospitals: { current: 3, max: 5 },
    branches: { current: 6, max: 10 },
    doctors: { current: 45, max: 100 },
    staff: { current: 75, max: 150 },
    patients: { current: 920, max: 5000 },
    storage: { current: 92, max: 500 },
    apiCalls: { current: 34000, max: 100000 },
  },
  "3": {
    hospitals: { current: 1, max: 2 },
    branches: { current: 2, max: 4 },
    doctors: { current: 10, max: 20 },
    staff: { current: 35, max: 50 },
    patients: { current: 400, max: 1000 },
    storage: { current: 22, max: 100 },
    apiCalls: { current: 9800, max: 20000 },
  },
  "4": {
    hospitals: { current: 22, max: 25 },
    branches: { current: 44, max: 50 },
    doctors: { current: 560, max: 600 },
    staff: { current: 2340, max: 3000 },
    patients: { current: 45600, max: 50000 },
    storage: { current: 3100, max: 5000 },
    apiCalls: { current: 890000, max: 1000000 },
  },
};

export const MOCK_AUDITS: Record<string, TenantAuditLog[]> = {
  "1": [
    { id: "au-1", action: "License Renewal", user: "System Scheduler", timestamp: "2026-06-20 00:00", description: "Standard Enterprise yearly billing cycle processed." },
    { id: "au-2", action: "Domain Verification", user: "Alex Mercer", timestamp: "2026-05-14 14:22", description: "Custom domain verified successfully." },
  ],
  "2": [
    { id: "au-3", action: "Tenant Onboarded", user: "Alex Mercer", timestamp: "2026-05-20 09:30", description: "Tenant created on Growth/Trial tier." },
  ],
};
export const MOCK_SUBSCRIPTION = MOCK_SUBSCRIPTIONS;
export const MOCK_DOMAINS_MAP = MOCK_DOMAINS;
export const MOCK_FEATURE_FLAGS_MAP = MOCK_FEATURE_FLAGS;
export const MOCK_QUOTAS_MAP = MOCK_QUOTAS;
export const MOCK_AUDITS_MAP = MOCK_AUDITS;
