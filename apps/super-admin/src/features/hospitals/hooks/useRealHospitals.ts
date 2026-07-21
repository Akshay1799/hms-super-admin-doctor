import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface RealHospital {
  id: string;
  name: string;
}

async function fetchRealHospitals(): Promise<RealHospital[]> {
  try {
    // The API defaults to 20 hospitals; registries need the full available list
    // to resolve the hospital ID shown in each row.
    const res = await apiClient.get("/hospitals", { params: { limit: 100 } });
    const data = res.data?.data ?? res.data ?? [];
    return (Array.isArray(data) ? data : []).map((h: any) => ({
      id: h._id ?? h.id ?? "",
      name: h.name ?? "Unknown Hospital",
    }));
  } catch {
    return [];
  }
}

export function useRealHospitals() {
  return useQuery({
    queryKey: ["real-hospitals"],
    queryFn: fetchRealHospitals,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}

/** Utility: resolve a MongoDB hospitalId to a display name from a fetched list */
export function resolveHospitalName(
  hospitals: RealHospital[],
  id: string | undefined | null
): string {
  if (!id) return "—";
  const found = hospitals.find((h) => h.id === id);
  return found ? found.name : `Hospital #${id.slice(-6)}`;
}
