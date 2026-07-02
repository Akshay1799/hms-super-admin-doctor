"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ProviderCard } from "@/features/integrations/components/ProviderCard";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePaymentGateways, useUpdatePaymentGateways } from "@/features/integrations/hooks/use-integrations";
import { PaymentGateway } from "@/features/integrations/types/integrations.types";
import { Button } from "@/components/ui/button";
import { Plus, X, Power, Settings } from "lucide-react";
import { toast } from "sonner";

export default function PaymentGatewaysPage() {
  const { data: gateways = [], isLoading } = usePaymentGateways();
  const updateGateways = useUpdatePaymentGateways();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<any>(null);

  const handleToggle = (gatewayId: string) => {
    const updated = gateways.map((g: any) => {
      if (g.id === gatewayId) {
        const nextStatus = g.status === "active" ? "inactive" : "active";
        toast.success(`Gateway status set to ${nextStatus}.`);
        return { ...g, status: nextStatus };
      }
      return g;
    });
    updateGateways.mutate(updated);
  };

  const handleOpenConfigure = (g: PaymentGateway) => {
    setSelectedGateway(g);
    setIsConfigModalOpen(true);
  };

  const handleConfigureSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const successRate = Number(formData.get("successRate"));
    const webhookEnabled = formData.get("webhookEnabled") === "true";

    const updated = gateways.map((g: any) => {
      if (g.id === selectedGateway.id) {
        return { ...g, successRate, webhookEnabled };
      }
      return g;
    });

    updateGateways.mutate(updated, {
      onSuccess: () => {
        toast.success("Gateway configuration updated successfully.");
        setIsConfigModalOpen(false);
      }
    });
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const provider = formData.get("provider") as any;
    const environment = formData.get("environment") as any;
    const webhookEnabled = formData.get("webhookEnabled") === "true";

    const newGateway: PaymentGateway = {
      id: `pg-${Date.now()}`,
      provider,
      environment,
      status: "active",
      webhookEnabled,
      transactionCount: 0,
      successRate: 100,
      createdAt: new Date().toISOString(),
    };

    updateGateways.mutate([...gateways, newGateway], {
      onSuccess: () => {
        toast.success("New payment gateway integrated successfully.");
        setIsAddModalOpen(false);
      }
    });
  };

  const columns = [
    { header: "Provider", accessor: (row: PaymentGateway) => <span className="font-semibold text-foreground capitalize">{row.provider}</span> },
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
    { header: "Actions", accessor: (row: PaymentGateway) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => handleOpenConfigure(row)}><Settings className="mr-1 h-3.5 w-3.5" />Configure</Button>
        <Button variant="ghost" size="sm" onClick={() => handleToggle(row.id)} className="text-muted-foreground hover:text-foreground"><Power className="mr-1 h-3.5 w-3.5" />Toggle</Button>
      </div>
    )},
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Payment Gateways"
        description="Configure and monitor payment processor integrations"
        actions={<Button onClick={() => setIsAddModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Add Gateway</Button>}
      />
      <div className="mt-6">
        <AppTable columns={columns} data={gateways} isLoading={isLoading} />
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Integrate Payment Gateway</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Processor Provider</label>
                <select name="provider" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="stripe">Stripe</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="paypal">PayPal</option>
                  <option value="cashfree">Cashfree</option>
                  <option value="payu">PayUmoney</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Environment Mode</label>
                <select name="environment" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="production">Production</option>
                  <option value="sandbox">Sandbox</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Enable Webhooks</label>
                <select name="webhookEnabled" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Gateway</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Modal */}
      {isConfigModalOpen && selectedGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Configure {selectedGateway.provider.toUpperCase()}</h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleConfigureSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Webhooks Status</label>
                <select name="webhookEnabled" defaultValue={selectedGateway.webhookEnabled ? "true" : "false"} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Simulated Success Rate (%)</label>
                <input required type="number" min="0" max="100" name="successRate" defaultValue={selectedGateway.successRate} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsConfigModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Configurations</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
