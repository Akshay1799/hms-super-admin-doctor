"use client";

import React, { useState } from "react";
import { BedDouble, Activity, ShieldAlert, Building, Search, Building2, Plus, Settings } from "lucide-react";

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

// Mock Data inline for standalone component portability
const MOCK_WARDS = [
  { id: "w-1", name: "Central ICU", type: "ICU", hospitalId: "h-1", hospitalName: "MediPlus Hospital", totalBeds: 50, occupiedBeds: 45, status: "Active" },
  { id: "w-2", name: "Cardiac HDU", type: "HDU", hospitalId: "h-1", hospitalName: "MediPlus Hospital", totalBeds: 30, occupiedBeds: 28, status: "Active" },
  { id: "w-3", name: "General Medicine Ward A", type: "General Ward", hospitalId: "h-1", hospitalName: "MediPlus Hospital", totalBeds: 200, occupiedBeds: 180, status: "Active" },
  { id: "w-4", name: "VIP Suite East", type: "Private Room", hospitalId: "h-1", hospitalName: "MediPlus Hospital", totalBeds: 20, occupiedBeds: 15, status: "Active" },
  { id: "w-5", name: "Infectious Disease Isolation", type: "Isolation Ward", hospitalId: "h-1", hospitalName: "MediPlus Hospital", totalBeds: 15, occupiedBeds: 10, status: "Active" },
  { id: "w-6", name: "Surgical ICU", type: "ICU", hospitalId: "h-2", hospitalName: "Vivek Memorial Hospital", totalBeds: 40, occupiedBeds: 35, status: "Active" },
  { id: "w-7", name: "Pediatric HDU", type: "HDU", hospitalId: "h-2", hospitalName: "Vivek Memorial Hospital", totalBeds: 20, occupiedBeds: 18, status: "Active" },
  { id: "w-8", name: "Orthopedics General", type: "General Ward", hospitalId: "h-2", hospitalName: "Vivek Memorial Hospital", totalBeds: 150, occupiedBeds: 120, status: "Active" },
  { id: "w-9", name: "Maternity Private Suites", type: "Private Room", hospitalId: "h-2", hospitalName: "Vivek Memorial Hospital", totalBeds: 30, occupiedBeds: 25, status: "Active" },
  { id: "w-10", name: "Emergency ICU", type: "ICU", hospitalId: "h-5", hospitalName: "R K Hospital", totalBeds: 25, occupiedBeds: 22, status: "Active" },
  { id: "w-11", name: "Neurology HDU", type: "HDU", hospitalId: "h-5", hospitalName: "R K Hospital", totalBeds: 15, occupiedBeds: 10, status: "Active" },
  { id: "w-12", name: "Surgery Recovery Ward", type: "General Ward", hospitalId: "h-5", hospitalName: "R K Hospital", totalBeds: 100, occupiedBeds: 85, status: "Active" },
  { id: "w-13", name: "West Wing Renovation", type: "General Ward", hospitalId: "h-5", hospitalName: "R K Hospital", totalBeds: 50, occupiedBeds: 0, status: "Maintenance" },
];

export default function WardManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const wards = MOCK_WARDS;

  const totalBeds = wards.reduce((acc, w) => acc + w.totalBeds, 0);
  const totalOccupied = wards.reduce((acc, w) => acc + w.occupiedBeds, 0);
  const occupancyRate = totalBeds ? Math.round((totalOccupied / totalBeds) * 100) : 0;

  const totalICUBeds = wards.filter(w => w.type === "ICU" || w.type === "Surgical ICU" || w.type === "Emergency ICU").reduce((acc, w) => acc + w.totalBeds, 0);
  const totalIsolationBeds = wards.filter(w => w.type === "Isolation Ward").reduce((acc, w) => acc + w.totalBeds, 0);

  const kpis = [
    { title: "Total Wards", value: wards.length.toString(), icon: Building, color: "text-blue-600 bg-blue-500/10", description: "Across all locations" },
    { title: "Overall Occupancy", value: `${occupancyRate}%`, icon: BedDouble, color: "text-emerald-600 bg-emerald-500/10", description: `${totalOccupied} of ${totalBeds} beds` },
    { title: "ICU Capacity", value: totalICUBeds.toString(), icon: Activity, color: "text-rose-600 bg-rose-500/10", description: "Critical care beds" },
    { title: "Isolation Capacity", value: totalIsolationBeds.toString(), icon: ShieldAlert, color: "text-amber-600 bg-amber-500/10", description: "Infection control beds" },
  ];

  const filteredWards = wards.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ICU":
      case "Emergency ICU":
      case "Surgical ICU":
        return "bg-rose-500/15 text-rose-600";
      case "HDU":
        return "bg-orange-500/15 text-orange-600";
      case "Private Room":
      case "Isolation Ward":
        return "bg-violet-500/15 text-violet-600";
      default:
        return "bg-blue-500/15 text-blue-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-emerald-500/15 text-emerald-600";
      case "Inactive": return "bg-zinc-500/15 text-zinc-600";
      case "Maintenance": return "bg-amber-500/15 text-amber-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ward Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage inpatient care units, bed capacities, and monitor real-time occupancy.
        </p>
      </div>

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
        <h2 className="text-lg font-semibold text-foreground mb-4">Ward Directory & Capacities</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search wards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <button className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Ward
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Ward Details</th>
                    <th className="px-4 py-3">Hospital</th>
                    <th className="px-4 py-3">Capacity & Occupancy</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredWards.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No wards found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredWards.map((ward) => {
                      const occupancyRate = Math.round((ward.occupiedBeds / ward.totalBeds) * 100) || 0;
                      
                      return (
                        <tr key={ward.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-foreground">{ward.name}</span>
                              <span className={cn("inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase", getTypeColor(ward.type))}>
                                {ward.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              <span>{ward.hospitalName || "Global"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1.5 w-48">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium text-foreground">{ward.occupiedBeds} / {ward.totalBeds} Beds</span>
                                <span className="text-muted-foreground">{occupancyRate}% Full</span>
                              </div>
                              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full transition-all duration-300", 
                                    occupancyRate >= 90 ? "bg-rose-500" : 
                                    occupancyRate >= 75 ? "bg-amber-500" : "bg-emerald-500"
                                  )}
                                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-0", getStatusColor(ward.status))}>
                              {ward.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedWard(ward);
                                  setIsActivityModalOpen(true);
                                }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 text-muted-foreground"
                                title="View Activity / Trends"
                              >
                                <Activity className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedWard(ward);
                                  setIsEditModalOpen(true);
                                }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 text-muted-foreground"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Ward Modal */}
      {isEditModalOpen && selectedWard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-foreground mb-4">Edit Ward</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Ward Name</label>
                <input 
                  type="text" 
                  defaultValue={selectedWard.name} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-1" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Total Beds</label>
                  <input 
                    type="number" 
                    defaultValue={selectedWard.totalBeds} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select 
                    defaultValue={selectedWard.status}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-1"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                }}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity / Trends Modal */}
      {isActivityModalOpen && selectedWard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Activity & Trends</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-semibold uppercase">
                {selectedWard.name}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted/40 rounded-lg border border-border">
                <p className="text-sm font-semibold text-foreground mb-2">Live Occupancy</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Currently Occupied</span>
                  <span className="text-sm font-bold">{selectedWard.occupiedBeds} / {selectedWard.totalBeds}</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300 bg-primary"
                    style={{ width: `${Math.min((selectedWard.occupiedBeds / selectedWard.totalBeds) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/40 rounded-lg border border-border">
                <p className="text-sm font-semibold text-foreground mb-2">Recent Activity Logs</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">Patient admitted to Bed 04</span>
                      <span className="text-[10px] text-muted-foreground">15 mins ago</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">Bed 12 marked for cleaning</span>
                      <span className="text-[10px] text-muted-foreground">2 hours ago</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">Patient transferred out of Bed 01</span>
                      <span className="text-[10px] text-muted-foreground">5 hours ago</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsActivityModalOpen(false)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
