import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export function useRevenueTrend() {
  return useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: dashboardService.getRevenueTrend,
  });
}
