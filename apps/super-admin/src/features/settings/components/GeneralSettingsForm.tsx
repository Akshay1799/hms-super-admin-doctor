"use client";

import React from "react";
import { useGeneralSettings, useUpdateGeneralSettings } from "../hooks/use-settings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function GeneralSettingsForm() {
  const { data: settings, isLoading } = useGeneralSettings();
  const updateSettings = useUpdateGeneralSettings();

  if (isLoading) return <div className="h-64 animate-pulse bg-muted/30 rounded-xl" />;
  if (!settings) return null;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateSettings.mutate({
      platformName: formData.get("platformName") as string,
      companyName: formData.get("companyName") as string,
      supportEmail: formData.get("supportEmail") as string,
      supportPhone: formData.get("supportPhone") as string,
      timezone: formData.get("timezone") as string,
      currency: formData.get("currency") as string,
    }, {
      onSuccess: () => {
        toast.success("General settings updated successfully.");
      },
      onError: () => {
        toast.error("Failed to save settings.");
      }
    });
  };

  return (
    <form className="space-y-6 max-w-2xl" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Platform Name</label>
          <input type="text" name="platformName" defaultValue={settings.platformName} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Company Name</label>
          <input type="text" name="companyName" defaultValue={settings.companyName} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Support Email</label>
          <input type="email" name="supportEmail" defaultValue={settings.supportEmail} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Support Phone</label>
          <input type="tel" name="supportPhone" defaultValue={settings.supportPhone} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Default Timezone</label>
          <select name="timezone" defaultValue={settings.timezone} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="UTC">UTC</option>
            <option value="EST">EST</option>
            <option value="PST">PST</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Currency</label>
          <select name="currency" defaultValue={settings.currency} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
