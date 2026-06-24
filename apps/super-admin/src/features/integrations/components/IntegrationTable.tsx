"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useIntegrations } from "../hooks/use-integrations";
import { Integration } from "../types/integrations.types";
import { Button } from "@/components/ui/button";
import { Settings, Power } from "lucide-react";

export function IntegrationTable() {
  const { data: integrations = [], isLoading } = useIntegrations();

  const typeLabels: Record<string, string> = {
    "payment-gateway": "Payment Gateway", "insurance": "Insurance", "hl7-fhir": "HL7/FHIR",
    "email": "Email", "sms": "SMS", "whatsapp": "WhatsApp", "storage": "Storage",
    "webhook": "Webhook", "api": "API",
  };

  const columns = [
    { header: "Name", accessor: (row: Integration) => <span className="font-medium text-foreground">{row.name}</span> },
    { header: "Type", accessor: (row: Integration) => <span className="text-sm">{typeLabels[row.type] || row.type}</span> },
    { header: "Provider", accessor: (row: Integration) => <span className="capitalize font-mono text-xs">{row.provider}</span> },
    { header: "Environment", accessor: (row: Integration) => <StatusBadge status={row.environment} /> },
    { header: "Status", accessor: (row: Integration) => <StatusBadge status={row.status} /> },
    { header: "Webhook", accessor: (row: Integration) => (
      <span className={`text-xs font-medium ${row.webhookEnabled ? "text-success" : "text-muted-foreground"}`}>
        {row.webhookEnabled ? "Enabled" : "Disabled"}
      </span>
    )},
    { header: "API Calls", accessor: (row: Integration) => row.apiCallsToday.toLocaleString() },
    { header: "Actions", accessor: (row: Integration) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><Power className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return <AppTable columns={columns} data={integrations} isLoading={isLoading} />;
}
