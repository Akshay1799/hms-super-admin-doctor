"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ProviderCard } from "@/features/integrations/components/ProviderCard";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePaymentGateways } from "@/features/integrations/hooks/use-integrations";
import { PaymentGateway } from "@/features/integrations/types/integrations.types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PaymentGatewaysPage() {
  const { data: gateways = [], isLoading } = usePaymentGateways();

  const columns = [
    { header: "Provider", accessor: (row: PaymentGateway) => <span className="font-medium text-foreground capitalize">{row.provider}</span> },
    { header: "Environment", accessor: (row: PaymentGateway) => <StatusBadge status={row.environment} /> },
    { header: "Status", accessor: (row: PaymentGateway) => <StatusBadge status={row.status} /> },
    { header: "Webhook", accessor: (row: PaymentGateway) => <span className={`text-xs font-medium ${row.webhookEnabled ? "text-success" : "text-muted-foreground"}`}>{row.webhookEnabled ? "Enabled" : "Disabled"}</span> },
    { header: "Transactions", accessor: (row: PaymentGateway) => row.transactionCount.toLocaleString() },
    { header: "Success Rate", accessor: (row: PaymentGateway) => (
      <span className={`font-medium ${row.successRate >= 95 ? "text-success" : row.successRate >= 85 ? "text-warning" : "text-destructive"}`}>
        {row.successRate > 0 ? `${row.successRate}%` : "—"}
      </span>
    )},
    { header: "Created", accessor: (row: PaymentGateway) => new Date(row.createdAt).toLocaleDateString() },
    { header: "Actions", accessor: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm">Configure</Button>
      </div>
    )},
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Payment Gateways"
        description="Configure and monitor payment processor integrations"
        actions={<Button><Plus className="mr-2 h-4 w-4" />Add Gateway</Button>}
      />
      <div className="mt-6">
        <AppTable columns={columns} data={gateways} isLoading={isLoading} />
      </div>
    </PageContainer>
  );
}
