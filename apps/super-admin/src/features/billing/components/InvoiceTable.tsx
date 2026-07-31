"use client";

import React from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useInvoices } from "../hooks/use-billing";
import { Invoice } from "../types/billing.types";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth.store";

export function InvoiceTable() {
  const { data: rawInvoices = [], isLoading } = useInvoices();
  const router = useRouter();
  const { user } = useAuthStore();
  const isTenantAdmin = user?.role === "TENANT_ADMIN";

  const invoices = isTenantAdmin
    ? rawInvoices.filter((inv) => inv.tenantName.toLowerCase().includes("apollo"))
    : rawInvoices;

  const handleDownload = (invoice: Invoice) => {
    const content = `
========================================
             HMS INVOICE
========================================
Invoice ID:   ${invoice.id}
Tenant Name:  ${invoice.tenantName}
Hospital:     ${invoice.hospitalName || "N/A"}
Patient Name: ${invoice.patientName || "N/A"}
Due Date:     ${new Date(invoice.dueDate).toLocaleDateString()}
Status:       ${invoice.status.toUpperCase()}
----------------------------------------
TOTAL AMOUNT: ${new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency || "USD" }).format(invoice.amount)}
========================================
Thank you for using HMS Cloud.
`;
    const blob = new Blob([content.trim()], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `invoice-${invoice.id}.txt`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Invoice ${invoice.id} downloaded successfully.`);
  };

  const columns = [
    { header: "Invoice ID", accessor: (row: Invoice) => <span className="font-semibold text-foreground">{row.id}</span> },
    ...(!isTenantAdmin ? [{ header: "Tenant", accessor: (row: Invoice) => row.tenantName }] : []),
    { header: "Hospital Unit", accessor: (row: Invoice) => row.hospitalName || "Apollo Delhi" },
    { header: "Patient", accessor: (row: Invoice) => row.patientName || "Rahul Sharma" },
    { header: "Amount", accessor: (row: Invoice) => new Intl.NumberFormat("en-US", { style: "currency", currency: row.currency || "USD" }).format(row.amount) },
    { header: "Due Date", accessor: (row: Invoice) => new Date(row.dueDate).toLocaleDateString() },
    { header: "Status", accessor: (row: Invoice) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      accessor: (row: Invoice) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/invoices/${row.id}`)} title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDownload(row)} title="Download Invoice">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return <AppTable columns={columns} data={invoices} isLoading={isLoading} />;
}
