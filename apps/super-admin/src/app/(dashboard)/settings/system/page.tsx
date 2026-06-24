import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, FileSearch } from "lucide-react";

const METRIC_ROWS = [
  { label: "Platform Version", value: "v2.4.1" },
  { label: "Build Number", value: "88421a" },
  { label: "Environment", value: "Production" },
  { label: "Storage Used", value: "412.5 GB" },
  { label: "Database Status", value: "Healthy" },
  { label: "Redis Status", value: "Healthy" },
  { label: "Uptime", value: "99.87% (7 days)" },
];

export default function SystemSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="System"
        description="View platform health metrics and perform system-level maintenance actions"
      />
      <div className="mt-6 space-y-6 max-w-3xl">
        <SettingsCard title="System Metrics" description="Current runtime status of the HMS platform">
          <div className="divide-y divide-border">
            {METRIC_ROWS.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground font-mono">{value}</span>
              </div>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Maintenance Actions" description="System-level operations — use with caution">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <p className="text-sm font-semibold text-foreground">Clear Application Cache</p>
                <p className="text-xs text-muted-foreground">Purge Redis cache and in-memory session data</p>
              </div>
              <Button variant="outline" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cache
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <p className="text-sm font-semibold text-foreground">Run System Diagnostics</p>
                <p className="text-xs text-muted-foreground">Check API, DB, Redis, and storage connectivity</p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Diagnostics
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div>
                <p className="text-sm font-semibold text-foreground">View System Logs</p>
                <p className="text-xs text-muted-foreground">Access raw application and error logs</p>
              </div>
              <Button variant="outline" size="sm">
                <FileSearch className="mr-2 h-4 w-4" />
                View Logs
              </Button>
            </div>
          </div>
        </SettingsCard>
      </div>
    </PageContainer>
  );
}
