"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const CHANNELS = [
  { id: "email", label: "Email Notifications", description: "Send transactional emails via configured SMTP" },
  { id: "sms", label: "SMS Notifications", description: "Send SMS via Twilio or configured provider" },
  { id: "whatsapp", label: "WhatsApp Notifications", description: "Send messages via WhatsApp Business API" },
  { id: "inapp", label: "In-App Notifications", description: "Show real-time notifications in the platform UI" },
];

export default function NotificationSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Notification Settings"
        description="Configure channels, retry limits, quiet hours, and default templates"
      />
      <div className="mt-6 space-y-6 max-w-2xl">
        <SettingsCard title="Notification Channels" description="Enable or disable delivery channels platform-wide">
          <div className="space-y-3">
            {CHANNELS.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/10">
                <div>
                  <p className="text-sm font-medium text-foreground">{channel.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{channel.description}</p>
                </div>
                <Switch defaultChecked={channel.id !== "whatsapp"} />
              </div>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Delivery Settings" description="Global retry and timing configuration">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Max Retry Count</label>
                <input type="number" defaultValue={3} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Retry Delay (seconds)</label>
                <input type="number" defaultValue={60} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quiet Hours (Do Not Disturb)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">From</p>
                  <input type="time" defaultValue="22:00" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">To</p>
                  <input type="time" defaultValue="08:00" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save Notification Settings</Button>
            </div>
          </form>
        </SettingsCard>
      </div>
    </PageContainer>
  );
}
