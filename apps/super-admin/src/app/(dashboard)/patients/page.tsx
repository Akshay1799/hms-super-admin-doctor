"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PatientTable } from "@/features/clinical/components/PatientTable";
import { usePatients } from "@/features/clinical/hooks/useClinical";
import { MOCK_HOSPITALS } from "@/features/hospitals/mocks/hospitals.mock";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");

  const { data: patients = [], isLoading } = usePatients({
    search,
    hospitalId: hospitalId || undefined,
    gender: gender || undefined,
    status: status || undefined,
  });

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Clinical Oversight" }, { label: "Patients" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Patient Supervision Registry"
          description="Read-only platform oversight of active and inactive patient profiles across tenants."
        />

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-card border border-border rounded-xl p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Search Patients</label>
            <input
              type="text"
              placeholder="Search name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Hospital Location</label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Locations</option>
              {MOCK_HOSPITALS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <PatientTable data={patients} isLoading={isLoading} />
      </div>
    </PageContainer>
  );
}
