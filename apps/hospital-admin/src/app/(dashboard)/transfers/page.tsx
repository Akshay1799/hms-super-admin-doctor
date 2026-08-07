"use client";

import React, { useState } from "react";
import { 
  ArrowLeftRight, 
  Search, 
  Plus, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Building2,
  BedDouble
} from "lucide-react";

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

// Mock Data for Transfers
const MOCK_TRANSFERS = [
  { id: "tr-1", patientName: "Rahul Sharma", mrn: "MRN-10293", fromWard: "General Medicine Ward A", fromBed: "Bed 101", toWard: "Cardiac HDU", toBed: "Bed 04", requestedAt: "10 mins ago", status: "Pending", type: "Emergency Transfer", reason: "Condition deteriorated, requires continuous monitoring." },
  { id: "tr-2", patientName: "Priya Desai", mrn: "MRN-10294", fromWard: "Cardiac HDU", fromBed: "Bed 02", toWard: "General Medicine Ward A", toBed: "Bed 105", requestedAt: "1 hour ago", status: "Approved", type: "Downgrade", reason: "Patient stable, stepping down from HDU." },
  { id: "tr-3", patientName: "Amit Singh", mrn: "MRN-10280", fromWard: "Emergency ICU", fromBed: "Bed 01", toWard: "Surgical ICU", toBed: "Bed 10", requestedAt: "2 hours ago", status: "Completed", type: "Ward to Ward", reason: "Post-op care required." },
  { id: "tr-4", patientName: "Anita Roy", mrn: "MRN-10111", fromWard: "Orthopedics General", fromBed: "Bed 45", toWard: "Orthopedics General", toBed: "Bed 46", requestedAt: "3 hours ago", status: "Completed", type: "Bed to Bed", reason: "Window bed requested." },
  { id: "tr-5", patientName: "Sneha Kapoor", mrn: "MRN-10300", fromWard: "General Medicine Ward A", fromBed: "Bed 110", toWard: "VIP Suite East", toBed: "Suite 01", requestedAt: "5 hours ago", status: "Cancelled", type: "Upgrade", reason: "Patient declined upgrade charges." },
];

export default function BedTransfersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [transfers, setTransfers] = useState(MOCK_TRANSFERS);
  
  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const pendingCount = transfers.filter(t => t.status === "Pending").length;
  const emergencyCount = transfers.filter(t => t.type === "Emergency Transfer" && t.status !== "Completed" && t.status !== "Cancelled").length;
  const completedToday = transfers.filter(t => t.status === "Completed").length;

  const kpis = [
    { title: "Pending Transfers", value: pendingCount.toString(), icon: Clock, color: "text-amber-600 bg-amber-500/10", description: "Awaiting approval/action" },
    { title: "Emergency Transfers", value: emergencyCount.toString(), icon: AlertTriangle, color: "text-rose-600 bg-rose-500/10", description: "Active urgent requests" },
    { title: "Completed Today", value: completedToday.toString(), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10", description: "Successfully relocated" },
    { title: "Total Requests", value: transfers.length.toString(), icon: ArrowLeftRight, color: "text-blue-600 bg-blue-500/10", description: "All active & past" },
  ];

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch = t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || t.mrn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-amber-500/15 text-amber-600 border-amber-500/20";
      case "Approved": return "bg-blue-500/15 text-blue-600 border-blue-500/20";
      case "Completed": return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";
      case "Cancelled": return "bg-rose-500/15 text-rose-600 border-rose-500/20";
      default: return "bg-muted text-muted-foreground border-transparent";
    }
  };

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Bed Transfers & Movement</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage patient relocations, bed vacating workflows, and track transfer history.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", kpi.color)}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground leading-none">{kpi.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>{kpi.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <h2 className="text-lg font-semibold text-foreground mb-4">Transfer Queue</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search patient or MRN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Transfer
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Patient Details</th>
                    <th className="px-4 py-3">From (Current)</th>
                    <th className="px-4 py-3">To (Destination)</th>
                    <th className="px-4 py-3">Status & Type</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No transfer requests found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTransfers.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-foreground">{t.patientName}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">{t.mrn}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-foreground font-medium text-xs">{t.fromWard}</span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1"><BedDouble className="w-3 h-3"/> {t.fromBed}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-foreground font-medium text-xs">{t.toWard}</span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1"><BedDouble className="w-3 h-3"/> {t.toBed}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase", getStatusColor(t.status))}>
                              {t.status}
                            </span>
                            <span className={cn("text-[10px] font-semibold", t.type === "Emergency Transfer" ? "text-rose-600" : "text-muted-foreground")}>
                              {t.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {t.status === "Pending" && (
                              <>
                                <button 
                                  onClick={() => handleStatusUpdate(t.id, "Approved")}
                                  className="inline-flex items-center justify-center rounded-md text-[11px] font-medium transition-colors bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 h-7 px-3"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(t.id, "Cancelled")}
                                  className="inline-flex items-center justify-center rounded-md text-[11px] font-medium transition-colors bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 h-7 px-3"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {t.status === "Approved" && (
                              <button 
                                onClick={() => handleStatusUpdate(t.id, "Completed")}
                                className="inline-flex items-center justify-center rounded-md text-[11px] font-medium transition-colors bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 h-7 px-3"
                              >
                                Complete Transfer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Request Transfer Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-foreground mb-4">Request Bed Transfer</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Patient / MRN</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="">Select an admitted patient...</option>
                  <option value="p1">Rahul Sharma (MRN-10293) - Bed 101, Gen Med A</option>
                  <option value="p2">Kavita Reddy (MRN-10332) - Suite 02, VIP East</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Destination Ward</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                    <option value="">Select ward...</option>
                    <option value="ICU">Central ICU</option>
                    <option value="HDU">Cardiac HDU</option>
                    <option value="GEN">General Medicine Ward A</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Destination Bed</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                    <option value="">Select available bed...</option>
                    <option value="b1">Bed 05 (Available)</option>
                    <option value="b2">Bed 12 (Available)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Transfer Type</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                  <option value="Ward to Ward">Ward to Ward</option>
                  <option value="Emergency Transfer">Emergency Transfer</option>
                  <option value="Upgrade">Upgrade / Downgrade</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Clinical/Admin Reason</label>
                <textarea 
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 resize-none"
                  placeholder="Enter reason for transfer..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsRequestModalOpen(false)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsRequestModalOpen(false);
                  const newT = {
                    id: "tr-" + Math.floor(Math.random() * 1000),
                    patientName: "Rahul Sharma",
                    mrn: "MRN-10293",
                    fromWard: "General Medicine Ward A",
                    fromBed: "Bed 101",
                    toWard: "Central ICU",
                    toBed: "Bed 05",
                    requestedAt: "Just now",
                    status: "Pending",
                    type: "Ward to Ward",
                    reason: "Requires monitoring"
                  };
                  setTransfers([newT, ...transfers]);
                }}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
