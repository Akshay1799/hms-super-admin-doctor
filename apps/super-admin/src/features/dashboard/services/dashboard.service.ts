import { MOCK_KPIS, MOCK_REVENUE_TREND } from "../mocks/dashboard.mock";
import { MOCK_ACTIVITIES } from "../mocks/activities.mock";
import { MOCK_ALERTS } from "../mocks/alerts.mock";
import { KPI, RevenueMetric, Activity, Alert } from "../types/dashboard.types";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";

export const dashboardService = {
  async getDashboardMetrics(): Promise<KPI[]> {
    try {
      const role = useAuthStore.getState().user?.role;
      // Route to the right dashboard endpoint based on role
      const endpoint =
        role === "SUPER_ADMIN"
          ? "/dashboard/super-admin"
          : "/dashboard/hospital-admin";

      const res = await apiClient.get(endpoint);
      const data = res.data.data;

      // If the API returns structured KPIs, use them
      if (data?.kpis && Array.isArray(data.kpis) && data.kpis.length > 0)
        return data.kpis;

      if (data && typeof data === "object") {
        const built: KPI[] = [];
        if (data.totalTenants !== undefined)
          built.push({ id: "dyn-1", title: "Total Tenants", value: data.totalTenants, percentage: 0, trend: "neutral", color: "blue", icon: "Building2" });
        if (data.totalHospitals !== undefined)
          built.push({ id: "dyn-2", title: "Total Hospitals", value: data.totalHospitals, percentage: 0, trend: "neutral", color: "green", icon: "Building" });
        if (data.totalDoctors !== undefined)
          built.push({ id: "dyn-3", title: "Total Doctors", value: data.totalDoctors, percentage: 0, trend: "neutral", color: "purple", icon: "User" });
        if (data.totalPatients !== undefined)
          built.push({ id: "dyn-4", title: "Total Patients", value: data.totalPatients, percentage: 0, trend: "neutral", color: "teal", icon: "Users2" });
        if (built.length > 0) return built;
      }

      throw new Error("empty");
    } catch {
      return [...MOCK_KPIS];
    }
  },

  async getRevenueTrend(): Promise<RevenueMetric[]> {
    try {
      const res = await apiClient.get("/billing/invoices/revenue-summary");
      const data = res.data.data;
      if (data?.trend && Array.isArray(data.trend) && data.trend.length > 0)
        return data.trend;
      throw new Error("empty");
    } catch {
      return [...MOCK_REVENUE_TREND];
    }
  },

  async getActivities(): Promise<Activity[]> {
    try {
      const res = await apiClient.get("/audit", { params: { limit: 10 } });
      const logs = res.data.data ?? [];
      if (logs.length > 0) {
        return logs.map((l: any) => ({
          id: l._id ?? l.id,
          action: l.action ?? "System Event",
          user: l.performedBy ?? l.user ?? "System",
          timestamp: l.createdAt ?? l.timestamp,
          description: l.description ?? l.action,
          type: l.severity ?? "info",
        }));
      }
      throw new Error("empty");
    } catch {
      return [...MOCK_ACTIVITIES];
    }
  },

  async getAlerts(): Promise<Alert[]> {
    // No backend alerts endpoint yet — use mock
    return [...MOCK_ALERTS];
  },

  async exportDashboard(_format: "pdf" | "excel" | "csv"): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 800));
  },
};
