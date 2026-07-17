"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Bed,
  Loader2,
  CheckCircle,
  Activity,
  AlertTriangle,
  Building,
} from "lucide-react";
import { toast } from "sonner";

interface DepartmentBeds {
  _id: string;
  name: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  type: string;
}

export default function BedsPage() {
  const [departments, setDepartments] = useState<DepartmentBeds[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchBeds() {
    try {
      const res = await apiClient.get("/departments");
      // Map available beds count virtual
      const mapped = res.data.data.map((d: any) => ({
        ...d,
        availableBeds: d.totalBeds - d.occupiedBeds,
      }));
      setDepartments(mapped);
    } catch {
      toast.error("Failed to load bed statistics");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBeds();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Real-time bed configuration, availability rates, and occupancy breakdowns by unit/ward.
      </p>

      {/* Grid of Wards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => {
          const occupancyRate = dept.totalBeds > 0 ? Math.round((dept.occupiedBeds / dept.totalBeds) * 100) : 0;
          
          return (
            <div key={dept._id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <Building className="h-5 w-5 text-blue-600" />
                  <h4 className="text-sm font-bold text-foreground">{dept.name}</h4>
                </div>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-bold uppercase text-muted-foreground">
                  {dept.type}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Occupancy Rate</span>
                  <span className={occupancyRate > 85 ? "text-destructive" : "text-foreground"}>
                    {occupancyRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      occupancyRate > 85 ? "bg-destructive" : "bg-blue-600"
                    }`}
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>

              {/* Count Cards */}
              <div className="grid grid-cols-3 gap-3.5 text-center text-xs">
                <div className="bg-muted/40 p-2.5 rounded-lg space-y-0.5">
                  <p className="text-muted-foreground text-[10px] uppercase font-bold">Total Beds</p>
                  <p className="text-base font-black text-foreground">{dept.totalBeds}</p>
                </div>
                <div className="bg-muted/40 p-2.5 rounded-lg space-y-0.5">
                  <p className="text-muted-foreground text-[10px] uppercase font-bold">Occupied</p>
                  <p className="text-base font-black text-foreground">{dept.occupiedBeds}</p>
                </div>
                <div className="bg-muted/40 p-2.5 rounded-lg space-y-0.5">
                  <p className="text-muted-foreground text-[10px] uppercase font-bold">Available</p>
                  <p className="text-base font-black text-blue-600 dark:text-blue-400">{dept.availableBeds}</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 text-xs">
                {occupancyRate > 85 ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-600 font-semibold">Alert: Near capacity limit</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-semibold">Status: Normal operations</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
