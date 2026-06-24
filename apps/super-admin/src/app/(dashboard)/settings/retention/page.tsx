import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";

const RETENTION_POLICIES = [
  { id: "ret-1", category: "Audit Logs", durationDays: 365, description: "Immutable security & access logs", equivalent: "1 Year" },
  { id: "ret-2", category: "Patient Records", durationDays: 2555, description: "Medical history (7 years min)", equivalent: "7 Years" },
  { id: "ret-3", category: "Invoices", durationDays: 1825, description: "Financial records for tax compliance", equivalent: "5 Years" },
  { id: "ret-4", category: "Notifications", durationDays: 90, description: "Delivered notifications archive", equivalent: "90 Days" },
  { id: "ret-5", category: "System Backups", durationDays: 30, description: "Rolling daily database snapshots", equivalent: "30 Days" },
  { id: "ret-6", category: "Claims", durationDays: 2555, description: "Insurance claims for 7 years", equivalent: "7 Years" },
];

export default function RetentionSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Data Retention Policies"
        description="Manage how long each category of data is stored before automated deletion"
      />
      <div className="mt-6">
        <SettingsCard title="Retention Rules" description="All policies comply with HIPAA and local regulatory requirements">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Retention (Days)</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Equivalent</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {RETENTION_POLICIES.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">{row.category}</td>
                    <td className="py-3 px-4 font-mono font-medium text-foreground">{row.durationDays}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.equivalent}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </div>
    </PageContainer>
  );
}
