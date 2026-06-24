"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

const CHANNELS = ["email", "sms", "whatsapp", "in-app"] as const;
const CATEGORIES = ["appointment", "billing", "invoice", "claims", "user-management", "security", "password-reset", "subscription", "broadcast", "custom"] as const;

export default function CreateTemplatePage() {
  const router = useRouter();
  const [channel, setChannel] = useState<string>("email");
  const [previewMode, setPreviewMode] = useState(false);
  const [body, setBody] = useState("");

  const inputClass = "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground";
  const labelClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <PageHeader title="Create Template" description="Build a reusable notification template" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="space-y-1.5">
            <label className={labelClass}>Template Name</label>
            <input type="text" placeholder="e.g. Appointment Reminder" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClass}>Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value)} className={inputClass}>
                {CHANNELS.map(c => <option key={c} value={c}>{c.replace("-", " ").toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Category</label>
              <select className={inputClass}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace("-", " ")}</option>)}
              </select>
            </div>
          </div>

          {channel === "email" && (
            <div className="space-y-1.5">
              <label className={labelClass}>Subject</label>
              <input type="text" placeholder="e.g. Your appointment is tomorrow, {{name}}" className={inputClass} />
            </div>
          )}

          <div className="space-y-1.5">
            <label className={labelClass}>Body</label>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Write your message here...\n\nAvailable variables: {{name}}, {{hospital}}, {{date}}, {{amount}}, {{invoiceNumber}}`}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-y font-mono"
            />
            {channel === "sms" && (
              <p className="text-xs text-muted-foreground">{body.length} / 160 characters</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Status</label>
            <select className={inputClass}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button>Save Template</Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-base font-semibold text-foreground">Preview</h3>
            <Button variant="ghost" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="mr-2 h-4 w-4" />
              {previewMode ? "Raw" : "Rendered"}
            </Button>
          </div>

          {channel === "email" && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-2 border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border pb-2">
                <span className="font-medium text-foreground">From:</span> HMS Platform &lt;no-reply@hms.com&gt;
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border pb-2">
                <span className="font-medium text-foreground">Subject:</span> Your appointment is tomorrow, John Doe
              </div>
              <div className="text-sm text-foreground pt-2 whitespace-pre-wrap min-h-[120px]">
                {body || <span className="text-muted-foreground italic">Start typing your message to see a preview...</span>}
              </div>
            </div>
          )}

          {channel === "sms" && (
            <div className="flex justify-end">
              <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%] shadow">
                {body || <span className="opacity-60 italic">SMS preview will appear here...</span>}
              </div>
            </div>
          )}

          {channel === "whatsapp" && (
            <div className="bg-[#e8f5e9] dark:bg-green-950/30 rounded-xl p-4">
              <div className="flex justify-end">
                <div className="bg-[#dcf8c6] dark:bg-green-900 rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%] shadow text-foreground">
                  {body || <span className="opacity-60 italic">WhatsApp preview will appear here...</span>}
                </div>
              </div>
            </div>
          )}

          {channel === "in-app" && (
            <div className="border border-border rounded-xl p-4 bg-card space-y-2">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">H</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">HMS System Notification</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {body || <span className="italic">In-app preview will appear here...</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Just now</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Variables Reference</p>
            <div className="flex flex-wrap gap-2">
              {["{{name}}", "{{hospital}}", "{{date}}", "{{amount}}", "{{invoiceNumber}}", "{{otp}}"].map(v => (
                <code key={v} className="px-2 py-1 rounded bg-muted text-xs font-mono text-foreground">{v}</code>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
