import React, { useState } from "react";
import { TenantDetails } from "../../services/tenant.service";
import { FeatureFlags } from "../../types/tenant.types";
import { Check, Info, Cpu, Save } from "lucide-react";

interface FeatureFlagsTabProps {
  details: TenantDetails;
  onUpdateFlags: (flags: FeatureFlags) => void;
  isSaving?: boolean;
}

export function FeatureFlagsTab({ details, onUpdateFlags, isSaving = false }: FeatureFlagsTabProps) {
  const [flags, setFlags] = useState<FeatureFlags>({ ...details.featureFlags });

  const toggleFlag = (key: keyof FeatureFlags) => {
    setFlags((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onUpdateFlags(flags);
  };

  const flagMetadata: { key: keyof FeatureFlags; label: string; desc: string }[] = [
    { key: "emr", label: "Electronic Medical Records (EMR)", desc: "Enables doctor charts, clinical notes, and digital health history." },
    { key: "appointments", label: "Patient Scheduling", desc: "Allows patients and receptionists to schedule and monitor booking workflows." },
    { key: "billing", label: "Billing & Invoices", desc: "Maintains financial ledger sheets, invoices, checkout systems." },
    { key: "pharmacy", label: "Pharmacy Module", desc: "E-prescriptions, inventory lists, and prescription distribution logs." },
    { key: "inventory", label: "Inventory & Purchasing", desc: "Track medical supplies, inventory warnings, purchase order lifecycles." },
    { key: "laboratory", label: "Laboratory Integration", desc: "Supports lab sample tracking, LIS interface, and report generation." },
    { key: "radiology", label: "Radiology / PACS", desc: "Allows DICOM image attachments, X-RAY reporting workflows." },
    { key: "insurance", label: "Insurance Claims", desc: "Configures insurance billing templates and electronic claim submissions." },
    { key: "telemedicine", label: "Telemedicine (Virtual Visits)", desc: "Integrates real-time video consults and calendar scheduling." },
    { key: "notifications", label: "Email / SMS alerts", desc: "Enables scheduled alerts for appointments and invoice payments." },
    { key: "reports", label: "Analytics & Reporting", desc: "Access default and customized Business Intelligence report charts." },
  ];

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Feature Gate Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Turn specific clinical modules on/off for this tenant workspace.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flagMetadata.map((flag) => {
          const isActive = flags[flag.key];
          return (
            <div
              key={flag.key}
              onClick={() => toggleFlag(flag.key)}
              className={`p-4 border rounded-xl bg-card hover:bg-muted/10 transition-all cursor-pointer flex gap-3 ${
                isActive ? "border-primary ring-1 ring-primary/25 bg-primary/[0.01]" : "border-border"
              }`}
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => {}} // Swallowed, handled by div onClick
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  {flag.label}
                  {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                </span>
                <p className="text-xs text-muted-foreground leading-normal">{flag.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
