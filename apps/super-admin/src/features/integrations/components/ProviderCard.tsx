"use client";

import React from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Settings, Power } from "lucide-react";
import { IntegrationStatus, IntegrationEnvironment } from "../types/integrations.types";

interface ProviderCardProps {
  name: string;
  provider: string;
  environment: IntegrationEnvironment;
  status: IntegrationStatus;
  meta?: Array<{ label: string; value: string | number }>;
  onConfigure?: () => void;
  onToggle?: () => void;
}

const PROVIDER_ICONS: Record<string, string> = {
  stripe: "💳", razorpay: "₹", paypal: "🅿", cashfree: "💰", payu: "🏦",
  sendgrid: "📧", "amazon-ses": "📬", mailgun: "📮", smtp: "📨",
  twilio: "📱", msg91: "📲", textlocal: "✉️",
  "meta-whatsapp": "💚", gupshup: "🟢",
  "aws-s3": "☁️", cloudinary: "🌤", local: "💾",
  "fhir-r4": "🏥", hl7: "🔬",
  bluecross: "🛡", aetna: "🏛", pmjay: "🇮🇳", cigna: "🏢",
};

export function ProviderCard({ name, provider, environment, status, meta = [], onConfigure, onToggle }: ProviderCardProps) {
  const icon = PROVIDER_ICONS[provider.toLowerCase()] || "🔌";

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-xl">
            {icon}
          </div>
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground capitalize">{provider}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={environment} />
      </div>

      {meta.length > 0 && (
        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
          {meta.map(m => (
            <div key={m.label}>
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-sm font-medium text-foreground">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <Button variant="outline" size="sm" className="flex-1" onClick={onConfigure}>
          <Settings className="mr-1.5 h-3.5 w-3.5" /> Configure
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <Power className="mr-1.5 h-3.5 w-3.5" /> {status === "active" ? "Disable" : "Enable"}
        </Button>
      </div>
    </div>
  );
}
