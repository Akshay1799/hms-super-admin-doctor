import React from "react";
import { TenantDetails } from "../../services/tenant.service";
import { StatusBadge } from "@/components/ui/status-badge";
import { Calendar, Mail, Phone, Globe, Shield, CreditCard, Building } from "lucide-react";

interface OverviewTabProps {
  details: TenantDetails;
}

export function OverviewTab({ details }: OverviewTabProps) {
  const { tenant, subscription, domain } = details;

  const infoItems = [
    { label: "Tenant Code", value: tenant.code, icon: Shield },
    { label: "Created At", value: tenant.createdAt, icon: Calendar },
    { label: "Plan Tier", value: tenant.plan, icon: CreditCard },
    { label: "Primary Domain", value: domain.primaryDomain, icon: Globe },
    { label: "Custom Domain", value: domain.customDomain || "Not Configured", icon: Globe },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
      {/* Profile Card */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h2 className="text-xl font-bold text-foreground">{tenant.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">Tenant ID: {tenant.id}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={tenant.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {infoItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted/50 border border-border text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground">Contact & Administration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/5 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Primary Email</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">admin@{tenant.code.toLowerCase()}.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/5 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Primary Phone</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">+1 (555) 019-2834</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Sidebar */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground">Usage Summary</h3>
          <div className="space-y-3.5">
            {[
              { label: "Active Hospitals", value: tenant.hospitalCount },
              { label: "Total Branches", value: tenant.branchCount },
              { label: "Registered Users", value: tenant.userCount },
              { label: "Storage Used", value: `${tenant.storageUsed} GB` },
            ].map((stat, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-sm font-semibold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
