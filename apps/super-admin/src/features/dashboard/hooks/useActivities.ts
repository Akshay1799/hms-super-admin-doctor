import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export function useActivities() {
  return useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: dashboardService.getActivities,
  });
}
