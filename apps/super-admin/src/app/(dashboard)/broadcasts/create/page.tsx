"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [channel, setChannel] = useState("email");

  const inputClass = "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground";
  const labelClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";

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
          <input type="text" placeholder="e.g. Platform Maintenance Notice" className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Description</label>
          <input type="text" placeholder="Short internal description" className={inputClass} />
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
            <select className={inputClass}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Target Audience</label>
          <select className={inputClass}>
            {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Message</label>
          <textarea
            rows={6}
            placeholder="Write your broadcast message here..."
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-y"
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Schedule Date & Time (Optional)</label>
          <input type="datetime-local" className={inputClass} />
          <p className="text-xs text-muted-foreground">Leave blank to send immediately.</p>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button variant="outline">Save as Draft</Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Send Broadcast
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
