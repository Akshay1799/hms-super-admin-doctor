"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";

export default function SurgeryRequestsPage() {
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSurgeries = async () => {
      try {
        const res = await apiClient.get("/ot/surgeries");
        setSurgeries(res.data.data);
      } catch (error) {
        console.error("Failed to fetch surgeries", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurgeries();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Requested": return "bg-slate-100 text-slate-700 border-slate-200";
      case "Scheduled": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Patient Ready": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "Shifted to OT": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Pre-Operative Check Completed": return "bg-teal-100 text-teal-700 border-teal-200";
      case "In Progress": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Emergency":
      case "STAT": return "bg-red-100 text-red-700 border-red-200";
      case "Urgent": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/ot`} className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Surgery Scheduling Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage, schedule, and track surgery lifecycle.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Surgery</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Surgeon</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status & Schedule</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
                  </td>
                </tr>
              ) : surgeries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No surgery requests found.
                  </td>
                </tr>
              ) : (
                surgeries.map((req) => (
                  <tr key={req._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-sm text-foreground">{req.patientId?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{req.patientId?.mrn || "No MRN"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-sm text-foreground">{req.surgeryName}</div>
                      <div className="text-xs text-muted-foreground">{req.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${getPriorityBadge(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {req.primarySurgeonId?.name || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide inline-block mb-1 ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                      {req.scheduledTime && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" /> {format(new Date(req.scheduledTime), "dd MMM, HH:mm")}
                          {req.otId && <span>• {req.otId.otNumber}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link 
                        href={`/ot/surgeries/${req._id}`}
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
