"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEnvironment, useUpdateEnvironment } from "@/features/settings/hooks/use-settings";
import { toast } from "sonner";

export default function EnvironmentSettingsPage() {
  const { data: env, isLoading } = useEnvironment();
  const updateEnv = useUpdateEnvironment();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (env) {
      setMaintenanceMode(env.maintenanceMode);
    }
  }, [env]);

  if (isLoading) return <div className="h-64 animate-pulse bg-muted/30 rounded-xl" />;
  if (!env) return null;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateEnv.mutate({
      apiUrl: formData.get("apiUrl") as string,
      environmentName: formData.get("environmentName") as string,
      region: formData.get("region") as string,
      maintenanceMode,
      buildVersion: env.buildVersion,
    }, {
      onSuccess: () => {
        toast.success("Environment configurations saved successfully.");
      },
      onError: () => {
        toast.error("Failed to update environment settings.");
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Environment Settings"
        description="Manage API endpoints, deployment region, and environment-specific configurations"
      />
      <div className="mt-6 space-y-6 max-w-2xl">
        <SettingsCard title="Current Environment">
          <div className="flex items-center gap-3 mb-6 p-4 border border-border rounded-xl bg-success/5 border-success/30">
            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <div>
              <p className="text-sm font-bold text-success">Production Environment Active</p>
              <p className="text-xs text-muted-foreground">Version: {env.buildVersion} · Region: {env.region}</p>
            </div>
          </div>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">API Base URL</label>
              <input type="url" name="apiUrl" defaultValue={env.apiUrl} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Environment</label>
                <select name="environmentName" defaultValue={env.environmentName} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">AWS Region</label>
                <select name="region" defaultValue={env.region} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="us-east-1">us-east-1</option>
                  <option value="us-west-2">us-west-2</option>
                  <option value="eu-west-1">eu-west-1</option>
                  <option value="ap-south-1">ap-south-1</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-warning/30 bg-warning/5 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-warning">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">When enabled, the platform shows a maintenance screen to all users</p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={updateEnv.isPending}>
                {updateEnv.isPending ? "Saving..." : "Save Environment Settings"}
              </Button>
            </div>
          </form>
        </SettingsCard>
      </div>
    </PageContainer>
  );
}
