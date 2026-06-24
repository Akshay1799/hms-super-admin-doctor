import React from "react";
import { BedOccupancy } from "@/features/clinical/types/clinical.types";
import { Bed, Users, ShieldAlert, CheckCircle2 } from "lucide-react";

interface OccupancyCardProps {
  occupancy?: BedOccupancy;
  isLoading: boolean;
}

export function OccupancyCard({ occupancy, isLoading }: OccupancyCardProps) {
  if (isLoading || !occupancy) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-sm animate-pulse">
        <div className="h-5 w-40 bg-muted rounded mb-4" />
        <div className="h-10 w-24 bg-muted rounded mb-4" />
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  const { totalBeds, occupiedBeds, availableBeds, icuBeds, emergencyBeds } = occupancy;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">Platform Bed Occupancy</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time capacity across all active tenants</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Bed className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold tracking-tight text-foreground">{occupancyRate}%</span>
        <span className="text-sm text-muted-foreground">({occupiedBeds} / {totalBeds} Beds Occupied)</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted h-3 rounded-full overflow-hidden mb-6 flex">
        <div
          className="bg-primary h-full transition-all duration-500"
          style={{ width: `${occupancyRate}%` }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-success/10 p-2 text-success">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="text-sm font-bold text-foreground">{availableBeds}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-warning/10 p-2 text-warning">
            <Bed className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ICU Beds</p>
            <p className="text-sm font-bold text-foreground">{icuBeds}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Emergency Beds</p>
            <p className="text-sm font-bold text-foreground">{emergencyBeds}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-info/10 p-2 text-info">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Occupied</p>
            <p className="text-sm font-bold text-foreground">{occupiedBeds}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
