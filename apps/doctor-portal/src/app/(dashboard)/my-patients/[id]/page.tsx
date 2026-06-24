"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePatient } from "@/features/patients/hooks/usePatients";
import { CoreProfile } from "@/features/patients/components/CoreProfile";
import { ClinicalTab } from "@/features/patients/components/ClinicalTab";
import { CareHistory } from "@/features/patients/components/CareHistory";
import { BillingAndAudit } from "@/features/patients/components/BillingAndAudit";
import { PrescriptionModal } from "@/features/clinical/components/PrescriptionModal";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  ArrowLeft, 
  HeartPulse, 
  FileText, 
  ShieldAlert, 
  Settings, 
  Plus, 
  User, 
  Loader2,
  Lock
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

type ActiveTab = "vitals" | "clinical" | "care" | "admin";

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>("vitals");
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);

  const { data: patient, isLoading, error } = usePatient(id);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-[400px] bg-muted animate-pulse rounded-xl" />
          <div className="lg:col-span-3 h-[400px] bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Patient Chart Not Found</h2>
        <p className="text-sm text-muted-foreground">The clinical chart you requested does not exist or has been archived.</p>
        <Link href={ROUTES.patients} className="inline-flex h-10 px-4 items-center justify-center rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-colors">
          Back to Directory
        </Link>
      </div>
    );
  }

  const tabs: { id: ActiveTab; label: string; icon: any; isRestricted?: boolean }[] = [
    { id: "vitals", label: "Vitals & Overview", icon: HeartPulse },
    { id: "clinical", label: "Clinical Logs & SOAP", icon: FileText },
    { id: "care", label: "Care Team & MAR", icon: User },
    { id: "admin", label: "Billing & Audit Trails", icon: Lock, isRestricted: true },
  ];

  return (
    <div className="p-6 space-y-6 screen-only">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(ROUTES.patients)}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Patients
        </button>

        <button
          onClick={() => setIsPrescriptionOpen(true)}
          className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> New E-Prescription
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Summary demographics card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4 shadow-xs">
            <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-primary/20">
              {patient.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">{patient.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {patient.age} yrs · {patient.gender}
              </p>
            </div>

            <div className="border-t border-border pt-4 text-left text-xs font-semibold space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admission:</span>
                <StatusBadge status={patient.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ward:</span>
                <span className="text-foreground">{patient.ward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bed:</span>
                <span className="text-foreground">{patient.bedNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tab panel workspace */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-border overflow-x-auto gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.isRestricted && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 px-1 py-0.2 rounded">ReadOnly</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab panels contents */}
          <div className="flex-1 min-h-[300px]">
            {activeTab === "vitals" && <CoreProfile patient={patient} />}
            {activeTab === "clinical" && <ClinicalTab patient={patient} />}
            {activeTab === "care" && <CareHistory patient={patient} />}
            {activeTab === "admin" && <BillingAndAudit patient={patient} />}
          </div>
        </div>
      </div>

      {/* Prescription Composer Modal overlay */}
      {isPrescriptionOpen && (
        <PrescriptionModal
          patient={patient}
          isOpen={isPrescriptionOpen}
          onClose={() => setIsPrescriptionOpen(false)}
        />
      )}
    </div>
  );
}
