"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Calendar, CheckCircle2, AlertCircle, ArrowRight, Clock } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";

export default function DischargeManagementPage() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await apiClient.get("/ipd/discharge-summaries");
        setSummaries(res.data.data);
      } catch (error) {
        console.error("Failed to fetch discharge summaries", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummaries();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft": return "bg-slate-100 text-slate-700 border-slate-200";
      case "Clinical Review": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Billing Pending": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Billing Cleared": return "bg-teal-100 text-teal-700 border-teal-200";
      case "Approved": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "Published": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Discharge Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor patients in the discharge pipeline, clear billing, and finalize documents.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Treating Doctor</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
                  </td>
                </tr>
              ) : summaries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No active discharges found.
                  </td>
                </tr>
              ) : (
                summaries.map((summary) => (
                  <tr key={summary._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-sm text-foreground">{summary.patientId?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{summary.patientId?.mrn || "No MRN"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {summary.treatingDoctorId?.name || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(summary.createdAt), "dd MMM yyyy, HH:mm")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(summary.status)}`}>
                        {summary.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link 
                        href={`/discharges/${summary._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-semibold transition-colors"
                      >
                        Manage <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
