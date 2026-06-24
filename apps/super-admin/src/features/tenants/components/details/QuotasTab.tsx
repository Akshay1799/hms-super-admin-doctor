import React from "react";
import { TenantDetails } from "../../services/tenant.service";
import { HardDrive, Key, Building2, GitBranch, Users, Stethoscope, UserCheck } from "lucide-react";

interface QuotasTabProps {
  details: TenantDetails;
  onUpdateQuotas: (quotas: any) => void;
  isUpdating?: boolean;
}

export function QuotasTab({ details, onUpdateQuotas, isUpdating = false }: QuotasTabProps) {
  const { quota } = details;

  const quotaItems = [
    { key: "hospitals", label: "Hospitals", current: quota.hospitals.current, max: quota.hospitals.max, icon: Building2 },
    { key: "branches", label: "Branches", current: quota.branches.current, max: quota.branches.max, icon: GitBranch },
    { key: "doctors", label: "Doctors", current: quota.doctors.current, max: quota.doctors.max, icon: Stethoscope },
    { key: "staff", label: "Staff Members", current: quota.staff.current, max: quota.staff.max, icon: Users },
    { key: "patients", label: "Patients", current: quota.patients.current, max: quota.patients.max, icon: UserCheck },
    { key: "storage", label: "Storage (GB)", current: quota.storage.current, max: quota.storage.max, icon: HardDrive },
    { key: "apiCalls", label: "API Calls / Month", current: quota.apiCalls.current, max: quota.apiCalls.max, icon: Key },
  ];

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-bold text-foreground">Resource Limits & Quotas</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          View current consumption and resource thresholds for this tenant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotaItems.map((item) => {
          const ratio = item.max > 0 ? (item.current / item.max) * 100 : 0;
          const roundedRatio = Math.min(Math.round(ratio), 100);
          const Icon = item.icon;

          // Color calculation
          let progressColor = "bg-primary";
          let textColor = "text-primary";
          if (ratio >= 90) {
            progressColor = "bg-destructive";
            textColor = "text-destructive";
          } else if (ratio >= 75) {
            progressColor = "bg-warning";
            textColor = "text-warning";
          }

          return (
            <div key={item.key} className="p-4 border border-border rounded-xl bg-card space-y-3 shadow-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {item.current.toLocaleString()} / {item.max.toLocaleString()}
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="relative w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${roundedRatio}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">{roundedRatio}% Utilized</span>
                {ratio >= 90 && (
                  <span className="text-destructive font-semibold">Exceeded Warning Threshold</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
