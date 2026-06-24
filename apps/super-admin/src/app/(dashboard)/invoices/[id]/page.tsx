"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { useInvoiceDetails } from "@/features/billing/hooks/use-billing";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";

export default function InvoiceDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoiceDetails(params.id);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-muted rounded"></div>
          <div className="h-64 bg-card rounded-xl border border-border"></div>
        </div>
      </PageContainer>
    );
  }

  if (!invoice) {
    return (
      <PageContainer>
        <div className="text-center py-20 text-muted-foreground">Invoice not found.</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Invoice {invoice.id}</h1>
        <StatusBadge status={invoice.status} className="ml-2" />
        <div className="ml-auto flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-8 mt-6">
        <div className="grid grid-cols-2 gap-8 border-b border-border pb-8">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-medium text-foreground">{invoice.tenantName}</p>
            {invoice.hospitalName && <p className="text-sm text-muted-foreground">{invoice.hospitalName}</p>}
            {invoice.patientName && <p className="text-sm text-muted-foreground mt-2">Patient: {invoice.patientName}</p>}
          </div>
          <div className="text-right">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Invoice Details</h3>
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Issued:</span> {new Date(invoice.issuedDate).toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Due:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            {invoice.paidDate && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Paid On:</span> {new Date(invoice.paidDate).toLocaleDateString()}</p>}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Line Items</h3>
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs text-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Quantity</th>
                <th className="px-4 py-3 font-medium text-right">Unit Price</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">{item.description}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">{new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(item.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold text-foreground border-t-2 border-border">
                <td colSpan={3} className="px-4 py-4 text-right">Total Amount</td>
                <td className="px-4 py-4 text-right text-lg">{new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(invoice.amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
