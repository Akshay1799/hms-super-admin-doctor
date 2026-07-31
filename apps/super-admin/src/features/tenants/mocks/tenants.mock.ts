import { Tenant, TenantSubscription, TenantDomain, FeatureFlags, UsageQuota, TenantAuditLog } from "../types/tenant.types";

export const MOCK_TENANTS: Tenant[] = [
  { id: "1", name: "Apollo Health Group", code: "APOLLO", plan: "Enterprise", status: "Active", hospitalCount: 2, branchCount: 2, userCount: 57, storageUsed: 1420, createdAt: "2026-01-12" },
  { id: "2", name: "CareFirst Clinics", code: "CAREFIRST", plan: "Professional", status: "Trial", hospitalCount: 1, branchCount: 1, userCount: 8, storageUsed: 92, createdAt: "2026-05-20" },
  { id: "3", name: "Sutter Regional Labs", code: "SUTTER", plan: "Basic", status: "Inactive", hospitalCount: 1, branchCount: 1, userCount: 5, storageUsed: 22, createdAt: "2026-04-15" },
  { id: "4", name: "Max Medical Solutions", code: "MAXMED", plan: "Enterprise", status: "Active", hospitalCount: 1, branchCount: 1, userCount: 95, storageUsed: 3100, createdAt: "2025-11-01" },
  { id: "5", name: "Fortis Healthcare Network", code: "FORTIS", plan: "Enterprise", status: "Active", hospitalCount: 3, branchCount: 3, userCount: 120, storageUsed: 2400, createdAt: "2026-02-10" },
  { id: "6", name: "CityCare Hospital System", code: "CITYCARE", plan: "Professional", status: "Active", hospitalCount: 2, branchCount: 2, userCount: 40, storageUsed: 310, createdAt: "2026-03-15" },
  { id: "7", name: "Metro Health Institute", code: "METRO", plan: "Professional", status: "Active", hospitalCount: 2, branchCount: 2, userCount: 35, storageUsed: 215, createdAt: "2026-03-28" },
];

export const MOCK_SUBSCRIPTIONS: Record<string, TenantSubscription> = {
  "1": { plan: "Enterprise", renewalDate: "2027-01-12", billingCycle: "Yearly", status: "Active", amount: 15000 },
  "2": { plan: "Professional", renewalDate: "2026-06-20", billingCycle: "Monthly", status: "Trial", amount: 450 },
  "3": { plan: "Basic", renewalDate: "2026-07-15", billingCycle: "Monthly", status: "Inactive", amount: 150 },
  "4": { plan: "Enterprise", renewalDate: "2026-11-01", billingCycle: "Yearly", status: "Active", amount: 12000 },
  "5": { plan: "Enterprise", renewalDate: "2027-02-10", billingCycle: "Yearly", status: "Active", amount: 14000 },
  "6": { plan: "Professional", renewalDate: "2026-09-15", billingCycle: "Monthly", status: "Active", amount: 650 },
  "7": { plan: "Professional", renewalDate: "2026-09-28", billingCycle: "Monthly", status: "Active", amount: 550 },
};

export const MOCK_DOMAINS: Record<string, TenantDomain> = {
  "1": { id: "d-1", primaryDomain: "apollo.medichain.com", customDomain: "portal.apollohospitals.com", sslEnabled: true, verified: true },
  "2": { id: "d-2", primaryDomain: "carefirst.medichain.com", sslEnabled: true, verified: true },
  "3": { id: "d-3", primaryDomain: "sutter.medichain.com", sslEnabled: true, verified: false },
  "4": { id: "d-4", primaryDomain: "maxmed.medichain.com", customDomain: "governance.maxmedical.com", sslEnabled: true, verified: true },
  "5": { id: "d-5", primaryDomain: "fortis.medichain.com", customDomain: "portal.fortishealthcare.com", sslEnabled: true, verified: true },
  "6": { id: "d-6", primaryDomain: "citycare.medichain.com", sslEnabled: true, verified: true },
  "7": { id: "d-7", primaryDomain: "metrohealth.medichain.com", sslEnabled: true, verified: true },
};

export const MOCK_FEATURE_FLAGS: Record<string, FeatureFlags> = {
  "1": { emr: true, appointments: true, billing: true, pharmacy: true, inventory: true, laboratory: true, radiology: true, insurance: true, telemedicine: true, notifications: true, reports: true },
  "2": { emr: true, appointments: true, billing: true, pharmacy: false, inventory: false, laboratory: false, radiology: false, insurance: false, telemedicine: false, notifications: true, reports: true },
  "3": { emr: true, appointments: true, billing: true, pharmacy: false, inventory: false, laboratory: false, radiology: false, insurance: false, telemedicine: false, notifications: false, reports: false },
  "4": { emr: true, appointments: true, billing: true, pharmacy: true, inventory: true, laboratory: true, radiology: true, insurance: true, telemedicine: true, notifications: true, reports: true },
  "5": { emr: true, appointments: true, billing: true, pharmacy: true, inventory: true, laboratory: true, radiology: true, insurance: true, telemedicine: true, notifications: true, reports: true },
  "6": { emr: true, appointments: true, billing: true, pharmacy: true, inventory: true, laboratory: true, radiology: false, insurance: true, telemedicine: false, notifications: true, reports: true },
  "7": { emr: true, appointments: true, billing: true, pharmacy: true, inventory: true, laboratory: true, radiology: false, insurance: true, telemedicine: true, notifications: true, reports: true },
};

export const MOCK_QUOTAS: Record<string, UsageQuota> = {
  "1": {
    hospitals: { current: 2, max: 10 },
    branches: { current: 2, max: 10 },
    doctors: { current: 57, max: 100 },
    staff: { current: 120, max: 250 },
    patients: { current: 1540, max: 10000 },
    storage: { current: 1420, max: 5000 },
    apiCalls: { current: 420000, max: 1000000 },
  },
  "2": {
    hospitals: { current: 1, max: 5 },
    branches: { current: 1, max: 5 },
    doctors: { current: 8, max: 30 },
    staff: { current: 25, max: 80 },
    patients: { current: 950, max: 5000 },
    storage: { current: 92, max: 500 },
    apiCalls: { current: 34000, max: 100000 },
  },
  "3": {
    hospitals: { current: 1, max: 2 },
    branches: { current: 1, max: 2 },
    doctors: { current: 5, max: 10 },
    staff: { current: 15, max: 30 },
    patients: { current: 120, max: 500 },
    storage: { current: 22, max: 100 },
    apiCalls: { current: 9800, max: 20000 },
  },
  "4": {
    hospitals: { current: 1, max: 10 },
    branches: { current: 1, max: 10 },
    doctors: { current: 95, max: 200 },
    staff: { current: 280, max: 500 },
    patients: { current: 4500, max: 10000 },
    storage: { current: 3100, max: 5000 },
    apiCalls: { current: 780000, max: 1000000 },
  },
  "5": {
    hospitals: { current: 3, max: 10 },
    branches: { current: 3, max: 10 },
    doctors: { current: 120, max: 200 },
    staff: { current: 380, max: 600 },
    patients: { current: 9600, max: 20000 },
    storage: { current: 2400, max: 4000 },
    apiCalls: { current: 620000, max: 800000 },
  },
  "6": {
    hospitals: { current: 2, max: 5 },
    branches: { current: 2, max: 5 },
    doctors: { current: 40, max: 80 },
    staff: { current: 120, max: 200 },
    patients: { current: 2800, max: 6000 },
    storage: { current: 310, max: 1000 },
    apiCalls: { current: 110000, max: 250000 },
  },
  "7": {
    hospitals: { current: 2, max: 5 },
    branches: { current: 2, max: 5 },
    doctors: { current: 65, max: 120 },
    staff: { current: 225, max: 300 },
    patients: { current: 4800, max: 8000 },
    storage: { current: 215, max: 800 },
    apiCalls: { current: 89000, max: 200000 },
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
