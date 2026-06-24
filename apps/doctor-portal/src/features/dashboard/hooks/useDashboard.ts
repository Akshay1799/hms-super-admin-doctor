import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getDashboardData,
  });
}

export function useWeeklyAppointmentTrend() {
  return useQuery({
    queryKey: ["dashboard", "appointments-trend"],
    queryFn: dashboardService.getWeeklyAppointmentTrend,
  });
}

export function useAdmissionTrend() {
  return useQuery({
    queryKey: ["dashboard", "admissions-trend"],
    queryFn: dashboardService.getAdmissionTrend,
  });
}
