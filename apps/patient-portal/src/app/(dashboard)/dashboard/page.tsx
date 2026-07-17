"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Heart,
  Activity,
  UserCheck,
  Calendar,
  Thermometer,
  Eye,
  Clock,
  CheckCircle,
  FileText,
  BadgeAlert,
  Loader2
} from "lucide-react";

interface VitalRecord {
  timestamp: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  temperature?: number;
  spo2?: number;
  pulse?: number;
  recordedBy?: string;
}

interface Medication {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  timing?: string;
  foodInstructions?: string;
  status: "Active" | "Completed" | "Discontinued";
  prescribedBy: string;
  startDate: string;
  endDate?: string;
}

interface Diagnosis {
  code?: string;
  description: string;
  date: string;
  status: string;
  diagnosedBy: string;
}

interface TimelineEvent {
  title: string;
  description?: string;
  date: string;
  type: string;
  createdBy?: string;
}

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: string;
  ward?: string;
  bedNumber?: string;
  assignedDoctorId?: {
    name: string;
    email: string;
    specialty: string;
  };
  allergies?: string[];
  medicalHistory?: string[];
  vitals: VitalRecord[];
  medications: Medication[];
  diagnoses: Diagnosis[];
  timeline: TimelineEvent[];
}

export default function PatientDashboard() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get("/patients/profile/me");
        setPatient(res.data.data);
      } catch (err: any) {
        setError(err.message || "Failed to load EMR records. Please confirm user is registered.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center space-y-3">
        <BadgeAlert className="h-10 w-10 text-destructive mx-auto" />
        <h3 className="text-base font-bold text-destructive">No Medical Records Associated</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {error || "We could not locate any active clinical registry under this account email. Contact your clinic reception to link your email."}
        </p>
      </div>
    );
  }

  const latestVital = patient.vitals && patient.vitals.length > 0
    ? patient.vitals[patient.vitals.length - 1]
    : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-primary rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Welcome Back, {patient.name}!</h2>
          <p className="text-sm opacity-90 mt-1">
            Clinical status: <span className="font-extrabold underline">{patient.status}</span> • Hospital Unit: {patient.ward || "Outpatient"}
          </p>
        </div>
        {patient.bedNumber && (
          <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-center shrink-0">
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">Assigned Bed</p>
            <p className="text-sm font-black">{patient.bedNumber}</p>
          </div>
        )}
      </div>

      {/* Primary Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info & Physician details */}
        <div className="lg:col-span-1 space-y-6">
          {/* General Demographics */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-3">
              <Eye className="h-4 w-4 text-primary" /> Patient Demographics
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground font-semibold">Age / Gender</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{patient.age} / {patient.gender}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold">Blood Group</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{patient.bloodGroup || "Not Logged"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold">Contact Phone</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{patient.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold">Allergies</p>
                <p className="text-sm font-bold text-destructive mt-0.5">
                  {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(", ") : "None Logged"}
                </p>
              </div>
            </div>
            {patient.medicalHistory && patient.medicalHistory.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase">Medical History Notes</p>
                <p className="text-xs text-foreground mt-1 bg-muted p-2 rounded-lg italic">
                  "{patient.medicalHistory.join(". ")}"
                </p>
              </div>
            )}
          </div>

          {/* Attending Physician */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-3">
              <UserCheck className="h-4 w-4 text-primary" /> Attending Physician
            </h3>
            {patient.assignedDoctorId ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-black text-foreground">{patient.assignedDoctorId.name}</h4>
                  <p className="text-xs text-primary font-bold">{patient.assignedDoctorId.specialty}</p>
                </div>
                <div className="text-xs space-y-1.5 text-muted-foreground pt-1">
                  <p>Email: <span className="text-foreground font-medium">{patient.assignedDoctorId.email}</span></p>
                  <p>Status: <span className="text-emerald-500 font-bold uppercase">On-Duty</span></p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-2">No attending physician assigned currently.</p>
            )}
          </div>
        </div>

        {/* Telemetry Vitals & Medications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Telemetry vitals gauges */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-3">
              <Activity className="h-4 w-4 text-primary" /> Latest Telemetry Vitals
            </h3>
            {latestVital ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Temperature */}
                <div className="bg-muted/50 p-3.5 rounded-lg border border-border flex items-center gap-3">
                  <Thermometer className="h-6 w-6 text-orange-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Temperature</p>
                    <p className="text-base font-black text-foreground mt-0.5">{latestVital.temperature || "--"} °F</p>
                  </div>
                </div>
                {/* Blood Pressure */}
                <div className="bg-muted/50 p-3.5 rounded-lg border border-border flex items-center gap-3">
                  <Activity className="h-6 w-6 text-rose-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Blood Pressure</p>
                    <p className="text-base font-black text-foreground mt-0.5">
                      {latestVital.bpSystolic || "--"}/{latestVital.bpDiastolic || "--"}
                    </p>
                  </div>
                </div>
                {/* SpO2 */}
                <div className="bg-muted/50 p-3.5 rounded-lg border border-border flex items-center gap-3">
                  <Heart className="h-6 w-6 text-teal-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Oxygen level</p>
                    <p className="text-base font-black text-foreground mt-0.5">{latestVital.spo2 || "--"}%</p>
                  </div>
                </div>
                {/* Pulse */}
                <div className="bg-muted/50 p-3.5 rounded-lg border border-border flex items-center gap-3">
                  <Clock className="h-6 w-6 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Pulse Rate</p>
                    <p className="text-base font-black text-foreground mt-0.5">{latestVital.pulse || "--"} BPM</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">No vital records logged yet.</p>
            )}
          </div>

          {/* Active Medications list */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-3">
              <FileText className="h-4 w-4 text-primary" /> Active Prescription Registry
            </h3>
            {patient.medications && patient.medications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2.5 font-bold uppercase">Medication</th>
                      <th className="py-2.5 font-bold uppercase">Dose & Frequency</th>
                      <th className="py-2.5 font-bold uppercase">Timing / Food</th>
                      <th className="py-2.5 font-bold uppercase">Prescriber</th>
                      <th className="py-2.5 font-bold uppercase">Start Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {patient.medications.map((med, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="py-3 font-bold text-foreground">{med.name}</td>
                        <td className="py-3 font-medium text-muted-foreground">
                          {med.dose} • <span className="text-foreground font-semibold">{med.frequency}</span>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          <span className="inline-flex items-center gap-1 bg-primary/5 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                            {med.timing || "General"}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1.5 font-medium">{med.foodInstructions || ""}</span>
                        </td>
                        <td className="py-3 text-muted-foreground">{med.prescribedBy}</td>
                        <td className="py-3 text-muted-foreground">{new Date(med.startDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">No active prescriptions logged.</p>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Diagnosis & EMR Event Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Diagnoses */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-3">
            <CheckCircle className="h-4 w-4 text-primary" /> Active Diagnoses
          </h3>
          {patient.diagnoses && patient.diagnoses.length > 0 ? (
            <div className="space-y-3">
              {patient.diagnoses.map((diag, i) => (
                <div key={i} className="flex justify-between items-start bg-muted/40 border border-border p-3.5 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">{diag.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Diagnosed by: {diag.diagnosedBy} • {new Date(diag.date).toLocaleDateString()}
                    </p>
                  </div>
                  {diag.code && (
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded">
                      ICD: {diag.code}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-4">No diagnoses logged yet.</p>
          )}
        </div>

        {/* EMR Chronological Event Timeline */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border pb-3">
            <Calendar className="h-4 w-4 text-primary" /> Clinical Event History
          </h3>
          {patient.timeline && patient.timeline.length > 0 ? (
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {patient.timeline.map((event, i) => (
                <div key={i} className="flex gap-4 relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">{event.title}</p>
                    {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                    <p className="text-[10px] text-muted-foreground/80">
                      {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-4">No clinical timeline logs present.</p>
          )}
        </div>
      </div>
    </div>
  );
}
