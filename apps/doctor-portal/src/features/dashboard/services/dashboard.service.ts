import { MOCK_DASHBOARD_DATA, MOCK_WEEKLY_APPOINTMENTS_TREND, MOCK_ADMISSIONS_TREND } from "../mocks/dashboard.mock";
import { DashboardData, AppointmentTrendItem, PatientTrendItem } from "../types/dashboard.types";

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { ...MOCK_DASHBOARD_DATA };
  },

  async getWeeklyAppointmentTrend(): Promise<AppointmentTrendItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return [...MOCK_WEEKLY_APPOINTMENTS_TREND];
  },

  async getAdmissionTrend(): Promise<PatientTrendItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 70));
    return [...MOCK_ADMISSIONS_TREND];
  },
};
