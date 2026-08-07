"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft,
  Activity,
  Thermometer,
  Clock,
  User,
  HeartPulse,
  Droplets,
  FileText,
  AlertCircle
} from "lucide-react";

// Mock Data specific to a patient chart
const PATIENT_INFO = {
  id: "p-1",
  name: "Rahul Sharma",
  mrn: "MRN-10293",
  age: 45,
  gender: "Male",
  bloodGroup: "O+",
  ward: "General Med A",
  bed: "Bed 101",
  admissionDate: "2023-10-01",
  diagnosis: "Acute Bronchitis",
  allergies: "Penicillin",
};

const MOCK_TIMELINE = [
  { id: 1, type: "vitals", time: "08:00 AM, Today", user: "Nurse Anjali", details: { temp: "98.6 °F", hr: "72 bpm", bp: "120/80", spO2: "98%", rr: "16", pain: "2/10" } },
  { id: 2, type: "note", time: "08:15 AM, Today", user: "Nurse Anjali", category: "General Observation", content: "Patient slept well. Complains of mild cough. Vitals stable." },
  { id: 3, type: "io", time: "09:00 AM, Today", user: "Nurse Anjali", details: { intake: "250ml Water", output: "150ml Urine" } },
  { id: 4, type: "medication", time: "10:00 AM, Today", user: "Nurse Priya", content: "Administered Azithromycin 500mg IV." },
  { id: 5, type: "vitals", time: "12:00 PM, Today", user: "Nurse Priya", details: { temp: "99.1 °F", hr: "76 bpm", bp: "122/82", spO2: "97%", rr: "18", pain: "1/10" } },
];

export default function PatientNursingChartPage({ params }: { params: { patientId: string } }) {
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/nursing" className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Nursing Chart</h1>
          <p className="text-sm text-muted-foreground">Comprehensive nursing records and timeline</p>
        </div>
      </div>

      {/* Patient Profile Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{PATIENT_INFO.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground font-medium">
                <span className="font-mono bg-muted px-2 py-0.5 rounded">{PATIENT_INFO.mrn}</span>
                <span>•</span>
                <span>{PATIENT_INFO.age} Y / {PATIENT_INFO.gender}</span>
                <span>•</span>
                <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Allergies: {PATIENT_INFO.allergies}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-foreground">Location: <span className="font-normal text-muted-foreground">{PATIENT_INFO.ward} / {PATIENT_INFO.bed}</span></p>
            <p className="font-semibold text-foreground">Diagnosis: <span className="font-normal text-muted-foreground">{PATIENT_INFO.diagnosis}</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-border">
        {["timeline", "vitals-flowsheet", "intake-output", "care-plan"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition-colors ${
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[400px]">
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg border-b border-border pb-3">Clinical Timeline</h3>
            <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
              {MOCK_TIMELINE.map((item) => (
                <div key={item.id} className="relative pl-8">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full border-4 border-card flex items-center justify-center
                    ${item.type === 'vitals' ? 'bg-blue-500' : item.type === 'note' ? 'bg-emerald-500' : item.type === 'medication' ? 'bg-purple-500' : 'bg-amber-500'}">
                    {item.type === 'vitals' && <Thermometer className="w-3.5 h-3.5 text-white" />}
                    {item.type === 'note' && <FileText className="w-3.5 h-3.5 text-white" />}
                    {item.type === 'io' && <Droplets className="w-3.5 h-3.5 text-white" />}
                    {item.type === 'medication' && <HeartPulse className="w-3.5 h-3.5 text-white" />}
                  </div>
                  
                  {/* Content */}
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-sm capitalize text-foreground">{item.type.replace("-", " ")}</span>
                        {item.category && <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{item.category}</span>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-foreground">{item.time}</p>
                        <p className="text-[10px] text-muted-foreground">by {item.user}</p>
                      </div>
                    </div>

                    {item.type === 'vitals' && item.details && (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
                        <div className="bg-background rounded p-2 text-center border border-border shadow-sm"><p className="text-[10px] text-muted-foreground uppercase">Temp</p><p className="text-xs font-bold text-foreground">{item.details.temp}</p></div>
                        <div className="bg-background rounded p-2 text-center border border-border shadow-sm"><p className="text-[10px] text-muted-foreground uppercase">HR</p><p className="text-xs font-bold text-foreground">{item.details.hr}</p></div>
                        <div className="bg-background rounded p-2 text-center border border-border shadow-sm"><p className="text-[10px] text-muted-foreground uppercase">BP</p><p className="text-xs font-bold text-foreground">{item.details.bp}</p></div>
                        <div className="bg-background rounded p-2 text-center border border-border shadow-sm"><p className="text-[10px] text-muted-foreground uppercase">SpO2</p><p className="text-xs font-bold text-foreground">{item.details.spO2}</p></div>
                        <div className="bg-background rounded p-2 text-center border border-border shadow-sm"><p className="text-[10px] text-muted-foreground uppercase">Resp</p><p className="text-xs font-bold text-foreground">{item.details.rr}</p></div>
                        <div className="bg-background rounded p-2 text-center border border-border shadow-sm"><p className="text-[10px] text-muted-foreground uppercase">Pain</p><p className="text-xs font-bold text-rose-500">{item.details.pain}</p></div>
                      </div>
                    )}

                    {(item.type === 'note' || item.type === 'medication') && (
                      <p className="text-sm text-muted-foreground mt-2">{item.content}</p>
                    )}

                    {item.type === 'io' && item.details && (
                      <div className="flex gap-4 mt-2">
                        <div className="text-sm"><span className="text-emerald-600 font-semibold text-xs uppercase mr-1">In:</span> {item.details.intake}</div>
                        <div className="text-sm"><span className="text-amber-600 font-semibold text-xs uppercase mr-1">Out:</span> {item.details.output}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab !== "timeline" && (
          <div className="flex items-center justify-center h-64 text-muted-foreground flex-col gap-2">
            <Activity className="w-8 h-8 opacity-50" />
            <p>This section is under construction. Future data will populate here from the backend.</p>
          </div>
        )}
      </div>
    </div>
  );
}
