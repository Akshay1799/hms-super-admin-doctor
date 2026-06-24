import { MOCK_KPIS, MOCK_REVENUE_TREND } from "../mocks/dashboard.mock";
import { MOCK_ACTIVITIES } from "../mocks/activities.mock";
import { MOCK_ALERTS } from "../mocks/alerts.mock";
import { KPI, RevenueMetric, Activity, Alert } from "../types/dashboard.types";

export const dashboardService = {
  async getDashboardMetrics(): Promise<KPI[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...MOCK_KPIS];
  },

  async getRevenueTrend(): Promise<RevenueMetric[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return [...MOCK_REVENUE_TREND];
  },

  async getActivities(): Promise<Activity[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [...MOCK_ACTIVITIES];
  },

  async getAlerts(): Promise<Alert[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [...MOCK_ALERTS];
  },

  async exportDashboard(format: "pdf" | "excel" | "csv"): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 800));
  },
};
