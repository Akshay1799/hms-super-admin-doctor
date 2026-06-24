import React from "react";
import { HospitalDetails } from "../../services/hospital.service";
import { BedDouble, Stethoscope, Truck, AlertCircle, ShieldAlert, CheckCircle2 } from "lucide-react";

interface CapacityTabProps {
  details: HospitalDetails;
}

export function CapacityTab({ details }: CapacityTabProps) {
  const { capacity } = details;

  const occupiedPercent = capacity.totalBeds > 0 ? (capacity.occupiedBeds / capacity.totalBeds) * 100 : 0;
  const roundedPercent = Math.min(Math.round(occupiedPercent), 100);

  let bedColor = "bg-success";
  let textColor = "text-success";
  if (occupiedPercent >= 90) {
    bedColor = "bg-destructive";
    textColor = "text-destructive";
  } else if (occupiedPercent >= 70) {
    bedColor = "bg-warning";
    textColor = "text-warning";
  }

  const facilities = [
    { label: "In-house Pharmacy Services", available: capacity.pharmacyAvailable },
    { label: "Laboratory Diagnostic Operations", available: capacity.laboratoryAvailable },
    { label: "Internal Blood Bank Storage", available: capacity.bloodBankAvailable },
  ];

  return (
    <div className="space-y-6 bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm animate-in fade-in duration-200">
      <div>
        <h2 className="text-base font-bold text-foreground">Infrastructure Capacity</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Physical bed capacity, specialized operating rooms, and ambulance allocations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Beds Progress Card */}
        <div className="md:col-span-2 border border-border rounded-xl p-5 bg-card flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/5 text-primary">
                <BedDouble className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Beds Utilization</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Total registered clinical beds</p>
              </div>
            </div>
            <span className="text-sm font-bold text-foreground font-mono">
              {capacity.occupiedBeds} / {capacity.totalBeds} Beds
            </span>
          </div>

          <div className="space-y-2">
            <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${bedColor} rounded-full transition-all duration-500`} style={{ width: `${roundedPercent}%` }} />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">{roundedPercent}% occupied</span>
              <span className="font-semibold text-foreground">{capacity.availableBeds} beds available</span>
            </div>
          </div>
        </div>

        {/* ICU Beds card */}
        <div className="border border-border rounded-xl p-5 bg-card flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span>ICU Bed Allocation</span>
          </div>
          <p className="text-3xl font-extrabold text-foreground mt-3">{capacity.icuBeds}</p>
          <p className="text-xs text-muted-foreground mt-1">High-dependency intensive units</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Operation Theatres", value: capacity.otRooms, icon: Stethoscope },
          { label: "Emergency Units", value: capacity.emergencyUnits, icon: ShieldAlert },
          { label: "Active Ambulances", value: capacity.ambulances, icon: Truck },
          { label: "Clinical Lab Services", value: capacity.laboratoryAvailable ? "Available" : "Not Provided", icon: CheckCircle2 },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-4 border border-border rounded-lg bg-card text-center space-y-1">
              <div className="mx-auto w-fit p-1.5 rounded-full bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-base font-bold text-foreground">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-4 mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Facility Assets Checklist</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {facilities.map((fac, idx) => (
            <div
              key={idx}
              className={`p-3.5 border rounded-lg flex items-center gap-2.5 ${
                fac.available ? "border-success bg-success/[0.02]" : "border-border bg-muted/20"
              }`}
            >
              <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 ${fac.available ? "text-success" : "text-muted-foreground/50"}`} />
              <span className={`text-xs font-semibold ${fac.available ? "text-success" : "text-muted-foreground"}`}>
                {fac.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
