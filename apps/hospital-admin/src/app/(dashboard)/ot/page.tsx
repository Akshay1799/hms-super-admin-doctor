"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, Plus, Settings, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface OperationTheatre {
  _id: string;
  otNumber: string;
  name: string;
  category: string;
  status: string;
  floor: string;
}

export default function OTDashboardPage() {
  const [ots, setOts] = useState<OperationTheatre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOTs = async () => {
      try {
        const res = await apiClient.get("/ot");
        setOts(res.data.data);
      } catch (error) {
        console.error("Failed to fetch OTs", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOTs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "Reserved": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "In Surgery": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "Cleaning": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "Maintenance": return "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Operation Theatres
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor OT statuses, surgical schedules, and team allocations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/ot/surgeries" 
            className="h-10 px-4 flex items-center gap-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            Manage Surgeries
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : ots.length === 0 ? (
        <div className="text-center p-12 bg-card rounded-xl border border-dashed border-border flex flex-col items-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No Operation Theatres Found</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Please configure Operation Theatres in the system before scheduling surgeries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ots.map(ot => (
            <div key={ot._id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{ot.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{ot.otNumber} • {ot.category}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(ot.status)}`}>
                  {ot.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Floor</p>
                  <p className="text-sm font-medium">{ot.floor}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Capacity</p>
                  <p className="text-sm font-medium">{ot.capacity} Patient(s)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
