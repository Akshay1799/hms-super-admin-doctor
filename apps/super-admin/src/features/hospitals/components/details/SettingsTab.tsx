import React from "react";
import { HospitalDetails } from "../../services/hospital.service";
import { HospitalSettings } from "../../types/hospital.types";
import { FormField } from "@/components/ui/form-field";
import { useForm } from "react-hook-form";
import { ShieldAlert, Trash2, Power, Save } from "lucide-react";

interface SettingsTabProps {
  details: HospitalDetails;
  onUpdateSettings: (settings: HospitalSettings) => void;
  isSaving?: boolean;
  onSuspend: () => void;
  onActivate: () => void;
  onDelete: () => void;
}

export function SettingsTab({
  details,
  onUpdateSettings,
  isSaving = false,
  onSuspend,
  onActivate,
  onDelete,
}: SettingsTabProps) {
  const { settings, hospital } = details;

  const { register, handleSubmit } = useForm<HospitalSettings>({
    defaultValues: {
      timezone: settings.timezone,
      currency: settings.currency,
      language: settings.language,
      format24h: settings.format24h,
      weekStart: settings.weekStart as any,
      workingHours: settings.workingHours || "24/7",
      emergencyContact: settings.emergencyContact || "",
    },
  });

  const onSubmit = (data: HospitalSettings) => {
    onUpdateSettings(data);
  };

  const isSuspended = hospital.status === "Suspended";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Configuration Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-6"
      >
        <div>
          <h2 className="text-base font-bold text-foreground">Operational Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Configure localized timezone schedules and operation parameters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Timezone" as="select" {...register("timezone")}>
            <option value="EST">Eastern Time (EST)</option>
            <option value="CST">Central Time (CST)</option>
            <option value="PST">Pacific Time (PST)</option>
            <option value="GMT">Greenwich Mean Time (GMT)</option>
            <option value="UTC">Coordinated Universal Time (UTC)</option>
          </FormField>
          <FormField label="Currency Symbol" as="select" {...register("currency")}>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </FormField>
          <FormField label="Localization Language" as="select" {...register("language")}>
            <option value="en">English (en)</option>
            <option value="es">Español (es)</option>
            <option value="fr">Français (fr)</option>
          </FormField>
          <FormField label="Week Start Day" as="select" {...register("weekStart")}>
            <option value="Monday">Monday</option>
            <option value="Sunday">Sunday</option>
          </FormField>
          <FormField label="Working Hours" placeholder="e.g. 24/7 or 08:00 - 18:00" {...register("workingHours")} />
          <FormField label="Emergency Contact Line" placeholder="e.g. +1 (555) 911-0000" {...register("emergencyContact")} />
          <div className="md:col-span-2 flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="format24hEdit"
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              {...register("format24h")}
            />
            <label htmlFor="format24hEdit" className="text-sm font-semibold text-foreground">
              Use 24 Hour Format
            </label>
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-4 mt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-card border border-destructive/20 rounded-[var(--radius-card)] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-destructive font-bold text-base">
          <ShieldAlert className="h-5 w-5" />
          <span>Danger Zone</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Critical operations that affect patient access and workspace visibility. Please make sure before executing.
        </p>

        <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-foreground">
              {isSuspended ? "Reactivate Hospital Operations" : "Suspend Hospital Operations"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isSuspended
                ? "Restores login capabilities and access for doctors and staff."
                : "Block patient charts, logins and outpatient check-ins."}
            </p>
          </div>
          {isSuspended ? (
            <button
              onClick={onActivate}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-success/30 text-success text-xs font-semibold hover:bg-success/5 transition-colors cursor-pointer shrink-0"
            >
              <Power className="h-4 w-4" />
              Reactivate Hospital
            </button>
          ) : (
            <button
              onClick={onSuspend}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-warning/30 text-warning text-xs font-semibold hover:bg-warning/5 transition-colors cursor-pointer shrink-0"
            >
              <ShieldAlert className="h-4 w-4" />
              Suspend Hospital
            </button>
          )}
        </div>

        <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-destructive">Permanently Remove Node</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Remove the hospital node, physical wings, branches, and clinical departments. This is irreversible.
            </p>
          </div>
          <button
            onClick={onDelete}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-destructive px-4 text-xs font-semibold text-white shadow hover:bg-destructive/90 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            Delete Hospital
          </button>
        </div>
      </div>
    </div>
  );
}
