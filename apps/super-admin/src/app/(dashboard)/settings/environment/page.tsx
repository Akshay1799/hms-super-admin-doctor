"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function EnvironmentSettingsPage() {
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
              <p className="text-xs text-muted-foreground">Version: v2.4.1-stable · Region: us-east-1</p>
            </div>
          </div>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">API Base URL</label>
              <input type="url" defaultValue="https://api.hmscloud.com/v1" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Environment</label>
                <select defaultValue="production" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">AWS Region</label>
                <select defaultValue="us-east-1" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>us-east-1</option>
                  <option>us-west-2</option>
                  <option>eu-west-1</option>
                  <option>ap-south-1</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-warning/30 bg-warning/5 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-warning">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">When enabled, the platform shows a maintenance screen to all users</p>
              </div>
              <Switch />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Environment Settings</Button>
            </div>
          </form>
        </SettingsCard>
      </div>
    </PageContainer>
  );
}
