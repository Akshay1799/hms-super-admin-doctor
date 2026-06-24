"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { Button } from "@/components/ui/button";

export default function LocalizationSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Localization"
        description="Configure default regional preferences, language, and date/time formats"
      />
      <div className="mt-6">
        <SettingsCard title="Regional Preferences">
          <form className="space-y-6 max-w-2xl" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Default Language</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ar">Arabic</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Timezone</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>UTC</option>
                  <option>America/New_York (EST)</option>
                  <option>America/Los_Angeles (PST)</option>
                  <option>Asia/Kolkata (IST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date Format</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Time Format</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>12-Hour (AM/PM)</option>
                  <option>24-Hour</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Currency</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>INR (₹)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Day of Week</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Sunday</option>
                  <option>Monday</option>
                  <option>Saturday</option>
                </select>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit">Save Localization</Button>
            </div>
          </form>
        </SettingsCard>
      </div>
    </PageContainer>
  );
}
