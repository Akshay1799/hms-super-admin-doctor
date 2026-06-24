"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useSubscriptions } from "../hooks/use-billing";
import { Subscription } from "../types/billing.types";

export function SubscriptionTable() {
  const { data: subscriptions = [], isLoading } = useSubscriptions();

  const columns = [
    { header: "Subscription ID", accessor: (row: Subscription) => <span className="font-medium text-foreground">{row.id}</span> },
    { header: "Tenant", accessor: (row: Subscription) => row.tenantName },
    { header: "Plan", accessor: (row: Subscription) => row.planName },
    { header: "Billing Cycle", accessor: (row: Subscription) => <span className="capitalize">{row.billingCycle}</span> },
    { header: "Amount", accessor: (row: Subscription) => new Intl.NumberFormat("en-US", { style: "currency", currency: row.currency }).format(row.amount) },
    { header: "Next Billing", accessor: (row: Subscription) => row.nextBillingDate !== 'N/A' ? new Date(row.nextBillingDate).toLocaleDateString() : 'N/A' },
    { header: "Status", accessor: (row: Subscription) => <StatusBadge status={row.status} /> },
  ];

  return <AppTable columns={columns} data={subscriptions} isLoading={isLoading} />;
}
