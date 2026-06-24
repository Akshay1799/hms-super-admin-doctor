import React from "react";
import { HospitalDetails } from "../../services/hospital.service";
import { StatusBadge } from "@/components/ui/status-badge";
import { Building2, Calendar, Mail, Phone, Globe, Shield, Users, BedDouble, Stethoscope } from "lucide-react";
import { MOCK_TENANTS } from "@/features/tenants/mocks/tenants.mock";

interface OverviewTabProps {
  details: HospitalDetails;
}

export function OverviewTab({ details }: OverviewTabProps) {
  const { hospital, capacity } = details;

  const tenantName = MOCK_TENANTS.find((t) => t.id === hospital.tenantId)?.name || `Tenant #${hospital.tenantId}`;

  const infoItems = [
    { label: "Hospital Code", value: hospital.code, icon: Shield },
    { label: "Onboarded At", value: hospital.createdAt, icon: Calendar },
    { label: "Category / Type", value: hospital.type, icon: Building2 },
    { label: "Tenant Owner", value: tenantName, icon: Globe },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
      {/* Hospital Profile Card */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h2 className="text-xl font-bold text-foreground">{hospital.name}</h2>
              {hospital.description && <p className="text-sm text-muted-foreground mt-1 leading-normal">{hospital.description}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <StatusBadge status={hospital.status === "Under Review" ? "pending" : hospital.status} />
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

        {/* Contact info */}
        <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground">Contact & Channels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/5 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{hospital.email || "Not Configured"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/5 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{hospital.phone || "Not Configured"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary Card */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground">Operational Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                <span>Active Branches</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{hospital.branchCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Stethoscope className="h-4 w-4" />
                <span>Physicians</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{hospital.doctorCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                <span>Active Patients</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{hospital.patientCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <BedDouble className="h-4 w-4" />
                <span>Bed Capacity</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{capacity.totalBeds} Beds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
