"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useRefunds } from "../hooks/use-billing";
import { Refund } from "../types/billing.types";

export function RefundTable() {
  const { data: refunds = [], isLoading } = useRefunds();

  const columns = [
    { header: "Refund ID", accessor: (row: Refund) => <span className="font-medium text-foreground">{row.id}</span> },
    { header: "Payment ID", accessor: (row: Refund) => row.paymentId },
    { header: "Tenant", accessor: (row: Refund) => row.tenantName },
    { header: "Amount", accessor: (row: Refund) => new Intl.NumberFormat("en-US", { style: "currency", currency: row.currency }).format(row.amount) },
    { header: "Reason", accessor: (row: Refund) => row.reason },
    { header: "Request Date", accessor: (row: Refund) => new Date(row.requestDate).toLocaleDateString() },
    { header: "Status", accessor: (row: Refund) => <StatusBadge status={row.status} /> },
  ];

  return <AppTable columns={columns} data={refunds} isLoading={isLoading} />;
}
