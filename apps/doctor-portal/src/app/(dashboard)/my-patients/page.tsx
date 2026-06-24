"use client";

import React, { useState } from "react";
import { usePatients } from "@/features/patients/hooks/usePatients";
import { useAuthStore } from "@/store/auth.store";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, User, Filter, LayoutGrid, List, HeartPulse, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function MyPatientsPage() {
  const { user } = useAuthStore();
  const { data: patients, isLoading, error } = usePatients(user?.id);

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="flex gap-4 items-center">
          <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !patients) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-destructive">Failed to load patient records</h2>
        <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  // Search and Filter Logic
  const filteredPatients = patients.filter((pat) => {
    const matchesSearch =
      pat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pat.bedNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || pat.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">My Patients</h1>
          <p className="text-sm text-muted-foreground">Physician panel for assigned patients and active clinical charts.</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 border border-border p-0.5 rounded-lg bg-muted/40 self-start">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === "table" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === "grid" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by patient name, ward, or bed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status Filter Tab Selector */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {["All", "Active", "Admitted", "ICU", "Follow-up Due"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-primary border-primary text-white"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Content */}
      {filteredPatients.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-xl bg-card">
          <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground">No patients found</h3>
          <p className="text-xs text-muted-foreground mt-1">Try modifying your search or filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((pat) => (
            <Card key={pat.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-border flex flex-row items-start justify-between">
                <div>
                  <Link href={ROUTES.patient360(pat.id)} className="text-base font-bold text-foreground hover:underline">
                    {pat.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pat.age} yrs · {pat.gender}
                  </p>
                </div>
                <StatusBadge status={pat.status} />
              </CardHeader>
              <CardContent className="p-4 space-y-3.5">
                {/* Location */}
                <div className="grid grid-cols-2 text-xs font-semibold">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Ward</span>
                    <span className="text-foreground">{pat.ward}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Bed</span>
                    <span className="text-foreground">{pat.bedNumber}</span>
                  </div>
                </div>

                {/* Critical Allergies Alerts */}
                {pat.allergies.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Allergies</span>
                    <div className="flex flex-wrap gap-1">
                      {pat.allergies.map((alg) => (
                        <span 
                          key={alg} 
                          className="px-1.5 py-0.5 rounded bg-destructive/10 border border-destructive/20 text-[10px] font-bold text-destructive flex items-center gap-1"
                        >
                          <ShieldAlert className="h-3 w-3" />
                          {alg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Chart Link */}
                <div className="border-t border-border pt-3.5 flex justify-end">
                  <Link 
                    href={ROUTES.patient360(pat.id)} 
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Open Patient Chart <HeartPulse className="h-4 w-4 text-emerald-600" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-border bg-card rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Patient Name</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Demographics</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Location</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Allergies</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPatients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-bold text-foreground">
                      <Link href={ROUTES.patient360(pat.id)} className="hover:underline">
                        {pat.name}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground font-semibold">
                      {pat.age} yrs · {pat.gender}
                    </td>
                    <td className="p-4 text-muted-foreground font-semibold">
                      {pat.ward} ({pat.bedNumber})
                    </td>
                    <td className="p-4">
                      {pat.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {pat.allergies.map((alg) => (
                            <span 
                              key={alg} 
                              className="px-1.5 py-0.5 rounded bg-destructive/10 border border-destructive/20 text-[10px] font-bold text-destructive inline-flex items-center gap-1"
                            >
                              <ShieldAlert className="h-2.5 w-2.5" />
                              {alg}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={pat.status} />
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={ROUTES.patient360(pat.id)} 
                        className="text-primary font-bold hover:underline"
                      >
                        Chart View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
