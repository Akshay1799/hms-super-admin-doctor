"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useInvoices } from "../hooks/use-billing";
import { Invoice } from "../types/billing.types";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export function InvoiceTable() {
  const { data: invoices = [], isLoading } = useInvoices();
  const router = useRouter();

  const columns = [
    { header: "Invoice ID", accessor: (row: Invoice) => <span className="font-medium text-foreground">{row.id}</span> },
    { header: "Tenant", accessor: (row: Invoice) => row.tenantName },
    { header: "Hospital", accessor: (row: Invoice) => row.hospitalName || "N/A" },
    { header: "Patient", accessor: (row: Invoice) => row.patientName || "N/A" },
    { header: "Amount", accessor: (row: Invoice) => new Intl.NumberFormat("en-US", { style: "currency", currency: row.currency }).format(row.amount) },
    { header: "Due Date", accessor: (row: Invoice) => new Date(row.dueDate).toLocaleDateString() },
    { header: "Status", accessor: (row: Invoice) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      accessor: (row: Invoice) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/invoices/${row.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return <AppTable columns={columns} data={invoices} isLoading={isLoading} />;
}
