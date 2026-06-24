import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export function useAlerts() {
  return useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: dashboardService.getAlerts,
  });
}
