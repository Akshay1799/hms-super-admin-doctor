"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePayments } from "../hooks/use-billing";
import { Payment } from "../types/billing.types";

export function PaymentTable() {
  const { data: payments = [], isLoading } = usePayments();

  const columns = [
    { header: "Payment ID", accessor: (row: Payment) => <span className="font-medium text-foreground">{row.id}</span> },
    { header: "Invoice ID", accessor: (row: Payment) => row.invoiceId },
    { header: "Tenant", accessor: (row: Payment) => row.tenantName },
    { header: "Amount", accessor: (row: Payment) => new Intl.NumberFormat("en-US", { style: "currency", currency: row.currency }).format(row.amount) },
    { header: "Method", accessor: (row: Payment) => <span className="capitalize">{row.method.replace('_', ' ')}</span> },
    { header: "Payment Date", accessor: (row: Payment) => new Date(row.paymentDate).toLocaleDateString() },
    { header: "Reference ID", accessor: (row: Payment) => row.referenceId || "N/A" },
    { header: "Status", accessor: (row: Payment) => <StatusBadge status={row.status} /> },
  ];

  return <AppTable columns={columns} data={payments} isLoading={isLoading} />;
}
