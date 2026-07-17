import { Tenant, TenantSubscription, TenantDomain, FeatureFlags, UsageQuota, TenantAuditLog } from "../types/tenant.types";
import { CreateTenantInput } from "../schemas/tenant.schema";
import { apiClient } from "@/lib/api-client";
import {
  MOCK_TENANTS,
  MOCK_SUBSCRIPTIONS,
  MOCK_DOMAINS,
  MOCK_FEATURE_FLAGS,
  MOCK_QUOTAS,
  MOCK_AUDITS,
} from "../mocks/tenants.mock";

// In-memory data store for the application session (fallback)
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
    try {
      const params: Record<string, string> = {};
      if (filters?.search) params.search = filters.search;
      if (filters?.status && filters.status !== "All") params.status = filters.status;
      if (filters?.plan && filters.plan !== "All") params.plan = filters.plan;

      const res = await apiClient.get("/tenants", { params });
      
      // Map mongoose object _id to id string for UI compatibility
      return res.data.data.map((t: any) => ({
        id: t._id,
        name: t.name,
        code: t.code,
        plan: t.plan,
        status: t.status,
        hospitalCount: t.hospitalCount || 0,
        branchCount: t.branchCount || 0,
        userCount: t.userCount || 0,
        storageUsed: t.storageUsed || 0,
        createdAt: new Date(t.createdAt).toISOString().split("T")[0],
      }));
    } catch (error) {
      // Offline fallback
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

      return result.sort((a, b) => b.id.localeCompare(a.id));
    }
  },

  async getTenantById(id: string): Promise<TenantDetails> {
    try {
      const res = await apiClient.get(`/tenants/${id}`);
      const t = res.data.data;
      
      const mappedTenant: Tenant = {
        id: t._id,
        name: t.name,
        code: t.code,
        plan: t.plan,
        status: t.status,
        hospitalCount: t.hospitalCount || 0,
        branchCount: t.branchCount || 0,
        userCount: t.userCount || 0,
        storageUsed: t.storageUsed || 0,
        createdAt: new Date(t.createdAt).toISOString().split("T")[0],
      };

      return {
        tenant: mappedTenant,
        subscription: {
          plan: t.plan,
          renewalDate: t.subscriptionEnd ? new Date(t.subscriptionEnd).toISOString().split("T")[0] : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          billingCycle: "Yearly",
          status: t.status,
          amount: t.plan === "starter" ? 150 : t.plan === "professional" ? 450 : 1500,
        },
        domain: {
          id: `d-${t._id}`,
          primaryDomain: t.domain || `${t.code.toLowerCase()}.medichain.com`,
          sslEnabled: true,
          verified: true,
        },
        featureFlags: t.featureFlags || {
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
        quota: {
          hospitals: { current: t.hospitalCount || 0, max: t.quotas?.maxHospitals || 10 },
          branches: { current: t.branchCount || 0, max: t.quotas?.maxBranches || 20 },
          doctors: { current: 10, max: t.quotas?.maxDoctors || 50 },
          staff: { current: 30, max: t.quotas?.maxStaff || 150 },
          patients: { current: 100, max: t.quotas?.maxPatients || 5000 },
          storage: { current: t.storageUsed || 0, max: t.quotas?.maxStorageGb || 100 },
          apiCalls: { current: 1000, max: t.quotas?.maxApiCallsPerDay || 10000 },
        },
        auditLogs: [],
      };
    } catch {
      // Fallback
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
    }
  },

  async createTenant(input: CreateTenantInput): Promise<Tenant> {
    try {
      const res = await apiClient.post("/tenants", {
        name: input.name,
        code: input.code.toUpperCase(),
        plan: input.plan,
        status: input.status,
        domain: input.primaryDomain,
        featureFlags: {
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
        },
        quotas: {
          maxHospitals: input.maxHospitals,
          maxBranches: input.maxBranches,
          maxDoctors: input.maxDoctors,
          maxStaff: input.maxStaff,
          maxPatients: input.maxPatients,
          maxStorageGb: input.maxStorage,
          maxApiCallsPerDay: input.maxApiCalls,
        },
      });

      const t = res.data.data;
      return {
        id: t._id,
        name: t.name,
        code: t.code,
        plan: t.plan,
        status: t.status,
        hospitalCount: 0,
        branchCount: 0,
        userCount: 0,
        storageUsed: 0,
        createdAt: new Date(t.createdAt).toISOString().split("T")[0],
      };
    } catch (error) {
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

      subscriptionsData[newId] = {
        plan: input.plan,
        renewalDate: new Date(Date.now() + (input.trialPeriod || 365) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        billingCycle: input.billingCycle,
        status: input.status,
        amount: input.plan === "Basic" ? 150 : input.plan === "Professional" ? 450 : 1500,
      };

      domainsData[newId] = {
        id: `d-${newId}`,
        primaryDomain: input.primaryDomain,
        customDomain: input.customDomain || undefined,
        sslEnabled: input.sslEnabled,
        verified: false,
      };

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

      quotasData[newId] = {
        hospitals: { current: 0, max: input.maxHospitals },
        branches: { current: 0, max: input.maxBranches },
        doctors: { current: 0, max: input.maxDoctors },
        staff: { current: 0, max: input.maxStaff },
        patients: { current: 0, max: input.maxPatients },
        storage: { current: 0, max: input.maxStorage },
        apiCalls: { current: 0, max: input.maxApiCalls },
      };

      return newTenant;
    }
  },

  async updateTenant(id: string, input: Partial<CreateTenantInput>): Promise<Tenant> {
    try {
      const res = await apiClient.patch(`/tenants/${id}`, {
        name: input.name,
        plan: input.plan,
        status: input.status,
      });

      const t = res.data.data;
      return {
        id: t._id,
        name: t.name,
        code: t.code,
        plan: t.plan,
        status: t.status,
        hospitalCount: t.hospitalCount || 0,
        branchCount: t.branchCount || 0,
        userCount: t.userCount || 0,
        storageUsed: t.storageUsed || 0,
        createdAt: new Date(t.createdAt).toISOString().split("T")[0],
      };
    } catch {
      const idx = tenantsData.findIndex((t) => t.id === id);
      if (idx === -1) {
        throw new Error(`Tenant with ID ${id} not found.`);
      }

      const existing = tenantsData[idx];

      const updatedTenant = {
        ...existing,
        name: input.name ?? existing.name,
        plan: input.plan ?? existing.plan,
        status: input.status ?? existing.status,
      };

      tenantsData[idx] = updatedTenant;

      if (subscriptionsData[id]) {
        subscriptionsData[id] = {
          ...subscriptionsData[id],
          plan: input.plan ?? subscriptionsData[id].plan,
          billingCycle: input.billingCycle ?? subscriptionsData[id].billingCycle,
          status: input.status ?? subscriptionsData[id].status,
        };
      }

      return updatedTenant;
    }
  },

  async updateFeatureFlags(id: string, flags: FeatureFlags): Promise<FeatureFlags> {
    try {
      await apiClient.patch(`/tenants/${id}/feature-flags`, flags);
      return flags;
    } catch {
      featureFlagsData[id] = flags;
      return flags;
    }
  },

  async updateQuotas(id: string, quotas: UsageQuota): Promise<UsageQuota> {
    try {
      await apiClient.patch(`/tenants/${id}/quotas`, {
        maxHospitals: quotas.hospitals.max,
        maxBranches: quotas.branches.max,
        maxDoctors: quotas.doctors.max,
        maxStaff: quotas.staff.max,
        maxPatients: quotas.patients.max,
        maxStorageGb: quotas.storage.max,
        maxApiCallsPerDay: quotas.apiCalls.max,
      });
      return quotas;
    } catch {
      quotasData[id] = quotas;
      return quotas;
    }
  },

  async updateSubscription(id: string, subscription: TenantSubscription): Promise<TenantSubscription> {
    try {
      await apiClient.patch(`/tenants/${id}`, {
        plan: subscription.plan,
        status: subscription.status,
      });
      return subscription;
    } catch {
      subscriptionsData[id] = subscription;
      const tenant = tenantsData.find((t) => t.id === id);
      if (tenant) {
        tenant.plan = subscription.plan;
        tenant.status = subscription.status;
      }
      return subscription;
    }
  },

  async verifyDomain(id: string): Promise<TenantDomain> {
    try {
      // Simulate real domain verification
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: `d-${id}`,
        primaryDomain: "verified-domain.com",
        sslEnabled: true,
        verified: true,
      };
    } catch {
      if (!domainsData[id]) {
        throw new Error("Domain record not found");
      }
      domainsData[id].verified = true;
      return domainsData[id];
    }
  },

  async suspendTenant(id: string): Promise<Tenant> {
    try {
      const res = await apiClient.patch(`/tenants/${id}`, { status: "Suspended" });
      const t = res.data.data;
      return {
        id: t._id,
        name: t.name,
        code: t.code,
        plan: t.plan,
        status: t.status,
        hospitalCount: t.hospitalCount || 0,
        branchCount: t.branchCount || 0,
        userCount: t.userCount || 0,
        storageUsed: t.storageUsed || 0,
        createdAt: new Date(t.createdAt).toISOString().split("T")[0],
      };
    } catch {
      const tenant = tenantsData.find((t) => t.id === id);
      if (!tenant) throw new Error("Tenant not found");
      tenant.status = "Suspended";
      if (subscriptionsData[id]) subscriptionsData[id].status = "Suspended";
      return tenant;
    }
  },

  async activateTenant(id: string): Promise<Tenant> {
    try {
      const res = await apiClient.patch(`/tenants/${id}`, { status: "Active" });
      const t = res.data.data;
      return {
        id: t._id,
        name: t.name,
        code: t.code,
        plan: t.plan,
        status: t.status,
        hospitalCount: t.hospitalCount || 0,
        branchCount: t.branchCount || 0,
        userCount: t.userCount || 0,
        storageUsed: t.storageUsed || 0,
        createdAt: new Date(t.createdAt).toISOString().split("T")[0],
      };
    } catch {
      const tenant = tenantsData.find((t) => t.id === id);
      if (!tenant) throw new Error("Tenant not found");
      tenant.status = "Active";
      if (subscriptionsData[id]) subscriptionsData[id].status = "Active";
      return tenant;
    }
  },

  async deleteTenant(id: string): Promise<void> {
    try {
      await apiClient.delete(`/tenants/${id}`);
    } catch {
      tenantsData = tenantsData.filter((t) => t.id !== id);
      delete subscriptionsData[id];
      delete domainsData[id];
      delete featureFlagsData[id];
      delete quotasData[id];
      delete auditsData[id];
    }
  },
};
