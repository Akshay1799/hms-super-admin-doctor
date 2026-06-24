"use client";

import React from "react";
import { useGeneralSettings } from "../hooks/use-settings";
import { Button } from "@/components/ui/button";

export function GeneralSettingsForm() {
  const { data: settings, isLoading } = useGeneralSettings();

  if (isLoading) return <div className="h-64 animate-pulse bg-muted/30 rounded-xl" />;
  if (!settings) return null;

  return (
    <form className="space-y-6 max-w-2xl" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Platform Name</label>
          <input type="text" defaultValue={settings.platformName} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Company Name</label>
          <input type="text" defaultValue={settings.companyName} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Support Email</label>
          <input type="email" defaultValue={settings.supportEmail} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Support Phone</label>
          <input type="tel" defaultValue={settings.supportPhone} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Default Timezone</label>
          <select defaultValue={settings.timezone} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="UTC">UTC</option>
            <option value="EST">EST</option>
            <option value="PST">PST</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Currency</label>
          <select defaultValue={settings.currency} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
