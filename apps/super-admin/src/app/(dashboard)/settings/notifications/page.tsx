"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NotificationSettingsPage() {
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);
  const [inapp, setInapp] = useState(true);
  const [retry, setRetry] = useState(3);
  const [delay, setDelay] = useState(60);
  const [fromTime, setFromTime] = useState("22:00");
  const [toTime, setToTime] = useState("08:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmail(localStorage.getItem("hms_notif_email") !== "false");
      setSms(localStorage.getItem("hms_notif_sms") !== "false");
      setWhatsapp(localStorage.getItem("hms_notif_whatsapp") === "true");
      setInapp(localStorage.getItem("hms_notif_inapp") !== "false");
      setRetry(Number(localStorage.getItem("hms_notif_retry") || "3"));
      setDelay(Number(localStorage.getItem("hms_notif_delay") || "60"));
      setFromTime(localStorage.getItem("hms_notif_from") || "22:00");
      setToTime(localStorage.getItem("hms_notif_to") || "08:00");
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("hms_notif_email", String(email));
      localStorage.setItem("hms_notif_sms", String(sms));
      localStorage.setItem("hms_notif_whatsapp", String(whatsapp));
      localStorage.setItem("hms_notif_inapp", String(inapp));
      localStorage.setItem("hms_notif_retry", String(retry));
      localStorage.setItem("hms_notif_delay", String(delay));
      localStorage.setItem("hms_notif_from", fromTime);
      localStorage.setItem("hms_notif_to", toTime);
      setSaving(false);
      toast.success("Notification settings saved successfully.");
    }, 300);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Notification Settings"
        description="Configure channels, retry limits, quiet hours, and default templates"
      />
      <form className="mt-6 space-y-6 max-w-2xl" onSubmit={onSubmit}>
        <SettingsCard title="Notification Channels" description="Enable or disable delivery channels platform-wide">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/10">
              <div>
                <p className="text-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">Send transactional emails via configured SMTP</p>
              </div>
              <Switch checked={email} onCheckedChange={setEmail} />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/10">
              <div>
                <p className="text-sm font-medium text-foreground">SMS Notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">Send SMS via Twilio or configured provider</p>
              </div>
              <Switch checked={sms} onCheckedChange={setSms} />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/10">
              <div>
                <p className="text-sm font-medium text-foreground">WhatsApp Notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">Send messages via WhatsApp Business API</p>
              </div>
              <Switch checked={whatsapp} onCheckedChange={setWhatsapp} />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/10">
              <div>
                <p className="text-sm font-medium text-foreground">In-App Notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">Show real-time notifications in the platform UI</p>
              </div>
              <Switch checked={inapp} onCheckedChange={setInapp} />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Delivery Settings" description="Global retry and timing configuration">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Max Retry Count</label>
                <input type="number" value={retry} onChange={(e) => setRetry(Number(e.target.value))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Retry Delay (seconds)</label>
                <input type="number" value={delay} onChange={(e) => setDelay(Number(e.target.value))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quiet Hours (Do Not Disturb)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">From</p>
                  <input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">To</p>
                  <input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Notification Settings"}
              </Button>
            </div>
          </div>
        </SettingsCard>
      </form>
    </PageContainer>
  );
}
