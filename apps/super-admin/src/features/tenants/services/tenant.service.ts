import { Tenant, TenantSubscription, TenantDomain, FeatureFlags, UsageQuota, TenantAuditLog } from "../types/tenant.types";
import { CreateTenantInput } from "../schemas/tenant.schema";
import {
  MOCK_TENANTS,
  MOCK_SUBSCRIPTIONS,
  MOCK_DOMAINS,
  MOCK_FEATURE_FLAGS,
  MOCK_QUOTAS,
  MOCK_AUDITS,
} from "../mocks/tenants.mock";

// In-memory data store for the application session
let tenantsData = [...MOCK_TENANTS];
const subscriptionsData = { ...MOCK_SUBSCRIPTIONS };
const domainsData = { ...MOCK_DOMAINS };
const featureFlagsData = { ...MOCK_FEATURE_FLAGS };
const quotasData = { ...MOCK_QUOTAS };
const auditsData = { ...MOCK_AUDITS };

export interface TenantDetails {
  tenant: Tenant;
  subscription: TenantSubscription;
  domain: TenantDomain;
  featureFlags: FeatureFlags;
  quota: UsageQuota;
  auditLogs: TenantAuditLog[];
}

export const tenantService = {
  async getTenants(filters?: {
    search?: string;
    status?: string;
    plan?: string;
  }): Promise<Tenant[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let result = [...tenantsData];

    if (filters?.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.code.toLowerCase().includes(query)
      );
    }

    if (filters?.status && filters.status !== "All") {
      result = result.filter(
        (t) => t.status.toLowerCase() === filters.status?.toLowerCase()
      );
    }

    if (filters?.plan && filters.plan !== "All") {
      result = result.filter(
        (t) => t.plan.toLowerCase() === filters.plan?.toLowerCase()
      );
    }

    // Return sorted by creation date descending or id
    return result.sort((a, b) => b.id.localeCompare(a.id));
  },

  async getTenantById(id: string): Promise<TenantDetails> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const tenant = tenantsData.find((t) => t.id === id);
    if (!tenant) {
      throw new Error(`Tenant with ID ${id} not found.`);
    }

    return {
      tenant,
      subscription: subscriptionsData[id] || {
        plan: tenant.plan,
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        billingCycle: "Yearly",
        status: tenant.status,
        amount: 0,
      },
      domain: domainsData[id] || {
        id: `d-${id}`,
        primaryDomain: `${tenant.code.toLowerCase()}.medichain.com`,
        sslEnabled: true,
        verified: false,
      },
      featureFlags: featureFlagsData[id] || {
        emr: true,
        appointments: true,
        billing: true,
        pharmacy: false,
        inventory: false,
        laboratory: false,
        radiology: false,
        insurance: false,
        telemedicine: false,
        notifications: true,
        reports: true,
      },
      quota: quotasData[id] || {
        hospitals: { current: tenant.hospitalCount, max: 10 },
        branches: { current: tenant.branchCount, max: 20 },
        doctors: { current: 10, max: 50 },
        staff: { current: 30, max: 150 },
        patients: { current: 100, max: 5000 },
        storage: { current: tenant.storageUsed, max: 100 },
        apiCalls: { current: 1000, max: 10000 },
      },
      auditLogs: auditsData[id] || [],
    };
  },

  async createTenant(input: CreateTenantInput): Promise<Tenant> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Check if code is already used
    if (tenantsData.some((t) => t.code === input.code.toUpperCase())) {
      throw new Error(`Tenant code "${input.code.toUpperCase()}" is already in use.`);
    }

    const newId = (Math.max(...tenantsData.map((t) => parseInt(t.id) || 0)) + 1).toString();
    
    const newTenant: Tenant = {
      id: newId,
      name: input.name,
      code: input.code.toUpperCase(),
      plan: input.plan,
      status: input.status,
      hospitalCount: 0,
      branchCount: 0,
      userCount: 0,
      storageUsed: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    tenantsData.push(newTenant);

    // Set Subscription
    subscriptionsData[newId] = {
      plan: input.plan,
      renewalDate: new Date(Date.now() + (input.trialPeriod || 365) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      billingCycle: input.billingCycle,
      status: input.status,
      amount: input.plan === "Basic" ? 150 : input.plan === "Professional" ? 450 : 1500,
    };

    // Set Domain
    domainsData[newId] = {
      id: `d-${newId}`,
      primaryDomain: input.primaryDomain,
      customDomain: input.customDomain || undefined,
      sslEnabled: input.sslEnabled,
      verified: false,
    };

    // Set Feature Flags
    featureFlagsData[newId] = {
      emr: input.emr,
      appointments: input.appointments,
      billing: input.billing,
      pharmacy: input.pharmacy,
      inventory: input.inventory,
      laboratory: input.laboratory,
      radiology: input.radiology,
      insurance: input.insurance,
      telemedicine: input.telemedicine,
      notifications: input.notifications,
      reports: input.reports,
    };

    // Set Quotas
    quotasData[newId] = {
      hospitals: { current: 0, max: input.maxHospitals },
      branches: { current: 0, max: input.maxBranches },
      doctors: { current: 0, max: input.maxDoctors },
      staff: { current: 0, max: input.maxStaff },
      patients: { current: 0, max: input.maxPatients },
      storage: { current: 0, max: input.maxStorage },
      apiCalls: { current: 0, max: input.maxApiCalls },
    };

    // Set Initial Audit Log
    auditsData[newId] = [
      {
        id: `au-${Date.now()}`,
        action: "Tenant Created",
        user: "Super Admin",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        description: `Tenant ${input.name} (${input.code}) was created.`,
      },
    ];

    return newTenant;
  },

  async updateTenant(id: string, input: Partial<CreateTenantInput>): Promise<Tenant> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const idx = tenantsData.findIndex((t) => t.id === id);
    if (idx === -indexOrNotFound(idx)) {
      throw new Error(`Tenant with ID ${id} not found.`);
    }

    function indexOrNotFound(i: number) {
      return i === -1 ? 1 : -1;
    }

    const existing = tenantsData[idx];

    // Update basic tenant fields
    const updatedTenant = {
      ...existing,
      name: input.name ?? existing.name,
      plan: input.plan ?? existing.plan,
      status: input.status ?? existing.status,
    };

    tenantsData[idx] = updatedTenant;

    // Update Subscription
    if (subscriptionsData[id]) {
      subscriptionsData[id] = {
        ...subscriptionsData[id],
        plan: input.plan ?? subscriptionsData[id].plan,
        billingCycle: input.billingCycle ?? subscriptionsData[id].billingCycle,
        status: input.status ?? subscriptionsData[id].status,
      };
    }

    // Update Domain
    if (domainsData[id]) {
      domainsData[id] = {
        ...domainsData[id],
        primaryDomain: input.primaryDomain ?? domainsData[id].primaryDomain,
        customDomain: input.customDomain ?? domainsData[id].customDomain,
        sslEnabled: input.sslEnabled ?? domainsData[id].sslEnabled,
      };
    }

    // Update Feature Flags
    if (featureFlagsData[id]) {
      featureFlagsData[id] = {
        emr: input.emr ?? featureFlagsData[id].emr,
        appointments: input.appointments ?? featureFlagsData[id].appointments,
        billing: input.billing ?? featureFlagsData[id].billing,
        pharmacy: input.pharmacy ?? featureFlagsData[id].pharmacy,
        inventory: input.inventory ?? featureFlagsData[id].inventory,
        laboratory: input.laboratory ?? featureFlagsData[id].laboratory,
        radiology: input.radiology ?? featureFlagsData[id].radiology,
        insurance: input.insurance ?? featureFlagsData[id].insurance,
        telemedicine: input.telemedicine ?? featureFlagsData[id].telemedicine,
        notifications: input.notifications ?? featureFlagsData[id].notifications,
        reports: input.reports ?? featureFlagsData[id].reports,
      };
    }

    // Update Quotas
    if (quotasData[id]) {
      quotasData[id] = {
        hospitals: { ...quotasData[id].hospitals, max: input.maxHospitals ?? quotasData[id].hospitals.max },
        branches: { ...quotasData[id].branches, max: input.maxBranches ?? quotasData[id].branches.max },
        doctors: { ...quotasData[id].doctors, max: input.maxDoctors ?? quotasData[id].doctors.max },
        staff: { ...quotasData[id].staff, max: input.maxStaff ?? quotasData[id].staff.max },
        patients: { ...quotasData[id].patients, max: input.maxPatients ?? quotasData[id].patients.max },
        storage: { ...quotasData[id].storage, max: input.maxStorage ?? quotasData[id].storage.max },
        apiCalls: { ...quotasData[id].apiCalls, max: input.maxApiCalls ?? quotasData[id].apiCalls.max },
      };
    }

    // Append Audit Log
    if (!auditsData[id]) auditsData[id] = [];
    auditsData[id].unshift({
      id: `au-${Date.now()}`,
      action: "Tenant Updated",
      user: "Super Admin",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      description: `Tenant settings updated: ${Object.keys(input).join(", ")}`,
    });

    return updatedTenant;
  },

  async updateFeatureFlags(id: string, flags: FeatureFlags): Promise<FeatureFlags> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    featureFlagsData[id] = flags;

    if (!auditsData[id]) auditsData[id] = [];
    auditsData[id].unshift({
      id: `au-${Date.now()}`,
      action: "Feature Flags Updated",
      user: "Super Admin",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      description: "Feature flags configuration modified.",
    });

    return flags;
  },

  async updateQuotas(id: string, quotas: UsageQuota): Promise<UsageQuota> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    quotasData[id] = quotas;

    if (!auditsData[id]) auditsData[id] = [];
    auditsData[id].unshift({
      id: `au-${Date.now()}`,
      action: "Quotas Updated",
      user: "Super Admin",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      description: "Resource usage limits updated.",
    });

    return quotas;
  },

  async updateSubscription(id: string, subscription: TenantSubscription): Promise<TenantSubscription> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    subscriptionsData[id] = subscription;

    // Update status in tenant list too
    const tenant = tenantsData.find((t) => t.id === id);
    if (tenant) {
      tenant.plan = subscription.plan;
      tenant.status = subscription.status;
    }

    if (!auditsData[id]) auditsData[id] = [];
    auditsData[id].unshift({
      id: `au-${Date.now()}`,
      action: "Subscription Updated",
      user: "Super Admin",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      description: `Subscription updated to ${subscription.plan} (${subscription.status}).`,
    });

    return subscription;
  },

  async verifyDomain(id: string): Promise<TenantDomain> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (!domainsData[id]) {
      throw new Error("Domain record not found");
    }
    domainsData[id].verified = true;

    if (!auditsData[id]) auditsData[id] = [];
    auditsData[id].unshift({
      id: `au-${Date.now()}`,
      action: "Domain Verified",
      user: "Super Admin",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      description: `Domain verified successfully: ${domainsData[id].primaryDomain}`,
    });

    return domainsData[id];
  },

  async suspendTenant(id: string): Promise<Tenant> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const tenant = tenantsData.find((t) => t.id === id);
    if (!tenant) throw new Error("Tenant not found");
    tenant.status = "Suspended";
    if (subscriptionsData[id]) subscriptionsData[id].status = "Suspended";

    if (!auditsData[id]) auditsData[id] = [];
    auditsData[id].unshift({
      id: `au-${Date.now()}`,
      action: "Tenant Suspended",
      user: "Super Admin",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      description: "Tenant account suspended.",
    });

    return tenant;
  },

  async activateTenant(id: string): Promise<Tenant> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const tenant = tenantsData.find((t) => t.id === id);
    if (!tenant) throw new Error("Tenant not found");
    tenant.status = "Active";
    if (subscriptionsData[id]) subscriptionsData[id].status = "Active";

    if (!auditsData[id]) auditsData[id] = [];
    auditsData[id].unshift({
      id: `au-${Date.now()}`,
      action: "Tenant Activated",
      user: "Super Admin",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      description: "Tenant account activated.",
    });

    return tenant;
  },

  async deleteTenant(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    tenantsData = tenantsData.filter((t) => t.id !== id);
    delete subscriptionsData[id];
    delete domainsData[id];
    delete featureFlagsData[id];
    delete quotasData[id];
    delete auditsData[id];
  },
};
