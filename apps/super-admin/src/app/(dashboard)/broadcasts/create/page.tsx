"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBroadcasts, useUpdateBroadcasts } from "@/features/notifications/hooks/useNotifications";
import { toast } from "sonner";
import { Broadcast } from "@/features/notifications/types/notifications.types";

const CHANNELS = ["email", "sms", "whatsapp", "in-app"] as const;
const AUDIENCES = [
  { value: "all-tenants", label: "All Tenants" },
  { value: "specific-tenant", label: "Specific Tenant" },
  { value: "hospitals", label: "Hospitals" },
  { value: "doctors", label: "Doctors" },
  { value: "staff", label: "Staff" },
  { value: "admins", label: "Admins" },
  { value: "custom-users", label: "Custom Users" },
] as const;

export default function CreateBroadcastPage() {
  const router = useRouter();
  const { data: broadcasts = [] } = useBroadcasts();
  const updateBroadcasts = useUpdateBroadcasts();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState("email");
  const [priority, setPriority] = useState("medium");
  const [audience, setAudience] = useState("all-tenants");
  const [message, setMessage] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const inputClass = "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground";
  const labelClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  const handleSave = (status: "sent" | "draft" | "scheduled") => {
    if (!title.trim()) {
      toast.error("Please provide a broadcast title.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please compose a message.");
      return;
    }

    const nextStatus = status === "sent" && scheduleTime ? "scheduled" as const : status;

    const newBroadcast: Broadcast = {
      id: `bc-${Date.now()}`,
      title,
      description: description || `Broadcast via ${channel}`,
      channel: channel as any,
      priority: priority as any,
      status: nextStatus,
      audience: audience as any,
      message,
      scheduledAt: scheduleTime || new Date().toISOString(),
      sentAt: nextStatus === "sent" ? new Date().toISOString() : undefined,
      recipientCount: nextStatus === "sent" ? 180 : 0,
    };

    updateBroadcasts.mutate([newBroadcast, ...broadcasts], {
      onSuccess: () => {
        toast.success(nextStatus === "sent" 
          ? "Broadcast sent successfully." 
          : nextStatus === "scheduled"
            ? `Broadcast scheduled for ${new Date(scheduleTime).toLocaleString()}.`
            : "Broadcast draft saved."
        );
        router.push("/broadcasts");
      }
    });
  };

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <PageHeader title="New Broadcast" description="Compose and send a message to your target audience" />
      </div>

      <div className="bg-card border border-border rounded-xl p-6 max-w-2xl space-y-5 mt-2">
        <div className="space-y-1.5">
          <label className={labelClass}>Broadcast Title</label>
          <input 
            type="text" 
            placeholder="e.g. Platform Maintenance Notice" 
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Description</label>
          <input 
            type="text" 
            placeholder="Short internal description" 
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Channel</label>
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className={inputClass}>
              {CHANNELS.map(c => <option key={c} value={c}>{c.replace("-", " ").toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Target Audience</label>
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className={inputClass}>
            {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Message</label>
          <textarea
            rows={6}
            placeholder="Write your broadcast message here..."
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-y"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Schedule Date & Time (Optional)</label>
          <input 
            type="datetime-local" 
            className={inputClass} 
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Leave blank to send immediately.</p>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button variant="outline" onClick={() => handleSave("draft")}><Save className="mr-2 h-4 w-4" />Save as Draft</Button>
          <Button onClick={() => handleSave("sent")}>
            <Send className="mr-2 h-4 w-4" />
            Send Broadcast
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
