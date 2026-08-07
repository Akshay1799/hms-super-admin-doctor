"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ClipboardList, 
  Search, 
  Activity, 
  Clock, 
  AlertTriangle,
  User,
  BedDouble,
  Building2,
  FileText,
  ChevronRight,
  Thermometer,
  HeartPulse
} from "lucide-react";
import { toast } from "sonner";

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

// Mock Data
const MOCK_PATIENTS = [
  { id: "p-1", name: "Rahul Sharma", mrn: "MRN-10293", ward: "General Med A", bed: "Bed 101", condition: "Stable", lastVitals: "2 hrs ago", alerts: 0, admissionDate: "2023-10-01" },
  { id: "p-2", name: "Priya Desai", mrn: "MRN-10294", ward: "Cardiac HDU", bed: "Bed 02", condition: "Critical", lastVitals: "15 mins ago", alerts: 2, admissionDate: "2023-10-03" },
  { id: "p-3", name: "Amit Singh", mrn: "MRN-10280", ward: "Surgical ICU", bed: "Bed 10", condition: "Guarded", lastVitals: "1 hr ago", alerts: 1, admissionDate: "2023-10-05" },
  { id: "p-4", name: "Anita Roy", mrn: "MRN-10111", ward: "Orthopedics", bed: "Bed 45", condition: "Stable", lastVitals: "4 hrs ago", alerts: 0, admissionDate: "2023-10-06" },
];

export default function NursingStationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  
  // Modals state
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<typeof MOCK_PATIENTS[0] | null>(null);

  const activePatients = patients.length;
  const criticalAlerts = patients.reduce((acc, p) => acc + p.alerts, 0);
  const pendingVitals = patients.filter(p => p.lastVitals.includes("hrs")).length;

  const kpis = [
    { title: "My Patients", value: activePatients.toString(), icon: User, color: "text-blue-600 bg-blue-500/10", description: "Currently assigned" },
    { title: "Critical Alerts", value: criticalAlerts.toString(), icon: AlertTriangle, color: "text-rose-600 bg-rose-500/10", description: "Require immediate attention" },
    { title: "Pending Vitals", value: pendingVitals.toString(), icon: Clock, color: "text-amber-600 bg-amber-500/10", description: "Due for measurement" },
    { title: "Shift Tasks", value: "12", icon: ClipboardList, color: "text-emerald-600 bg-emerald-500/10", description: "Medications & Orders" },
  ];

  const filteredPatients = patients.filter((p) => {
    return p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mrn.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case "Stable": return "text-emerald-600 bg-emerald-500/15";
      case "Critical": return "text-rose-600 bg-rose-500/15 animate-pulse";
      case "Guarded": return "text-amber-600 bg-amber-500/15";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const handleLogVitals = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Vitals recorded successfully for ${selectedPatient?.name}`);
    setIsVitalsModalOpen(false);
    // In real app, we would update state or refetch data here
  };

  const handleLogNote = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Nursing note added for ${selectedPatient?.name}`);
    setIsNotesModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nursing Station</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your assigned patients, record vitals, and add clinical notes.
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
          </div>
        ))}
      </div>

      <div className="pt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Assigned Patients</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="rounded-xl border border-border bg-card shadow-sm flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-foreground">{patient.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{patient.mrn}</p>
                  </div>
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", getConditionColor(patient.condition))}>
                    {patient.condition}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Building2 className="mr-2 h-4 w-4" />
                    <span>{patient.ward}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <BedDouble className="mr-2 h-4 w-4" />
                    <span>{patient.bed}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Last Vitals: <span className="font-medium text-foreground">{patient.lastVitals}</span></span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border bg-muted/20 p-3 flex justify-between gap-2">
                <button 
                  onClick={() => { setSelectedPatient(patient); setIsVitalsModalOpen(true); }}
                  className="flex-1 inline-flex items-center justify-center rounded-md text-[11px] font-medium transition-colors bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 h-8 px-3"
                >
                  <Thermometer className="mr-1.5 h-3.5 w-3.5" />
                  Log Vitals
                </button>
                <button 
                  onClick={() => { setSelectedPatient(patient); setIsNotesModalOpen(true); }}
                  className="flex-1 inline-flex items-center justify-center rounded-md text-[11px] font-medium transition-colors bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 h-8 px-3"
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Add Note
                </button>
                <Link 
                  href={`/nursing/${patient.id}`}
                  className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-muted text-muted-foreground h-8 w-8"
                  title="View Full Chart"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
          {filteredPatients.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
              No patients assigned or matching search.
            </div>
          )}
        </div>
      </div>

      {/* Vitals Modal */}
      {isVitalsModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Record Vital Signs</h3>
              <span className="text-xs text-muted-foreground font-mono">{selectedPatient.name}</span>
            </div>
            
            <form onSubmit={handleLogVitals} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Temperature (°F)</label>
                  <input required type="number" step="0.1" placeholder="98.6" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Heart Rate (bpm)</label>
                  <input required type="number" placeholder="72" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Blood Pressure</label>
                  <input required type="text" placeholder="120/80" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">SpO2 (%)</label>
                  <input required type="number" placeholder="98" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Resp Rate (bpm)</label>
                  <input required type="number" placeholder="16" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Pain Score (0-10)</label>
                  <input type="number" min="0" max="10" placeholder="2" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsVitalsModalOpen(false)} className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Save Vitals</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nursing Note Modal */}
      {isNotesModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Add Clinical Note</h3>
              <span className="text-xs text-muted-foreground font-mono">{selectedPatient.name}</span>
            </div>
            
            <form onSubmit={handleLogNote} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Note Category</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1">
                  <option>General Observation</option>
                  <option>Shift Handover</option>
                  <option>Physician Notification</option>
                  <option>Patient Complaint</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground">Clinical Details</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Patient rested well. Denies any active pain..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 resize-none" 
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsNotesModalOpen(false)} className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Sign & Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
