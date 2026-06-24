"use client";

import React, { useState } from "react";
import { Patient, SoapNote, PatientDiagnosis, PatientScan } from "../types/patients.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartCard } from "@/components/ui/chart-card";
import { FormField } from "@/components/ui/form-field";
import { useAddSoapNote, useAddDiagnosis, useAddLabOrder } from "../hooks/usePatients";
import { useAuthStore } from "@/store/auth.store";
import { ScanViewer } from "@/features/clinical/components/ScanViewer";
import { 
  FileText, 
  Plus, 
  Stethoscope, 
  FolderPlus, 
  Activity, 
  Image, 
  Loader2, 
  Eye, 
  FileImage,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface ClinicalTabProps {
  patient: Patient;
}

export function ClinicalTab({ patient }: ClinicalTabProps) {
  const { user } = useAuthStore();
  const addSoapNoteMutation = useAddSoapNote();
  const addDiagnosisMutation = useAddDiagnosis();
  const addLabOrderMutation = useAddLabOrder();

  const [activeSubTab, setActiveSubTab] = useState<"soap" | "diagnoses" | "scans" | "trends">("soap");
  const [selectedScan, setSelectedScan] = useState<PatientScan | null>(null);

  // SOAP Form State
  const [soapS, setSoapS] = useState("");
  const [soapO, setSoapO] = useState("");
  const [soapA, setSoapA] = useState("");
  const [soapP, setSoapP] = useState("");

  // Diagnosis Form State
  const [diagCode, setDiagCode] = useState("");
  const [diagDesc, setDiagDesc] = useState("");

  // Lab Order Form State
  const [labName, setLabName] = useState("");
  const [labType, setLabType] = useState<"X-Ray" | "CT" | "MRI" | "ECG" | "Ultrasound">("X-Ray");

  // Mock Lab Trend Data
  const labTrends = [
    { date: "03/15", HbA1c: 6.5, Creatinine: 1.1, Hemoglobin: 13.8 },
    { date: "04/20", HbA1c: 6.3, Creatinine: 1.0, Hemoglobin: 14.0 },
    { date: "05/25", HbA1c: 6.0, Creatinine: 0.9, Hemoglobin: 14.2 },
    { date: "06/24", HbA1c: 5.8, Creatinine: 0.8, Hemoglobin: 14.5 },
  ];

  const handleSoapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soapS || !soapO || !soapA || !soapP) {
      toast.error("Please fill in all SOAP fields.");
      return;
    }

    addSoapNoteMutation.mutate(
      {
        patientId: patient.id,
        subjective: soapS,
        objective: soapO,
        assessment: soapA,
        plan: soapP,
        author: user?.name || "Dr. Alexander Fleming",
      },
      {
        onSuccess: () => {
          toast.success("Clinical SOAP note recorded.");
          setSoapS("");
          setSoapO("");
          setSoapA("");
          setSoapP("");
        },
      }
    );
  };

  const handleDiagnosisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagCode || !diagDesc) {
      toast.error("Diagnosis code and description are required.");
      return;
    }

    addDiagnosisMutation.mutate(
      {
        patientId: patient.id,
        code: diagCode,
        description: diagDesc,
      },
      {
        onSuccess: () => {
          toast.success("Diagnosis appended to chart.");
          setDiagCode("");
          setDiagDesc("");
        },
      }
    );
  };

  const handleLabOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labName) {
      toast.error("Please enter a scan panel name.");
      return;
    }

    addLabOrderMutation.mutate(
      {
        patientId: patient.id,
        name: labName,
        type: labType,
        prescribedBy: user?.name || "Dr. Alexander Fleming",
      },
      {
        onSuccess: () => {
          toast.success("Lab & Radiography panel order submitted.");
          setLabName("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex border-b border-border bg-card rounded-t-xl p-1 gap-1">
        {[
          { id: "soap", label: "SOAP & Progress Notes", icon: FileText },
          { id: "diagnoses", label: "Diagnoses Index", icon: Stethoscope },
          { id: "scans", label: "Radiology Scans & Labs", icon: Image },
          { id: "trends", label: "Lab Value Trends", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub Tab Contents */}
      {activeSubTab === "soap" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Progress Notes History</h3>
            {patient.soapNotes.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground bg-card border border-border rounded-xl">
                No SOAP notes logs recorded.
              </div>
            ) : (
              patient.soapNotes.map((note) => (
                <Card key={note.id} className="shadow-xs">
                  <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">{note.author}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{note.date}</p>
                    </div>
                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-extrabold uppercase">SOAP</span>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3.5 text-xs font-semibold">
                    <div>
                      <span className="text-primary uppercase text-[10px] block font-bold">Subjective</span>
                      <p className="text-foreground leading-relaxed font-medium mt-0.5">{note.subjective}</p>
                    </div>
                    <div>
                      <span className="text-primary uppercase text-[10px] block font-bold">Objective</span>
                      <p className="text-foreground leading-relaxed font-medium mt-0.5">{note.objective}</p>
                    </div>
                    <div>
                      <span className="text-primary uppercase text-[10px] block font-bold">Assessment</span>
                      <p className="text-foreground leading-relaxed font-medium mt-0.5">{note.assessment}</p>
                    </div>
                    <div>
                      <span className="text-primary uppercase text-[10px] block font-bold">Plan</span>
                      <p className="text-foreground leading-relaxed font-medium mt-0.5">{note.plan}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Add SOAP Note Form */}
          <Card className="h-fit">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Plus className="h-4.5 w-4.5 text-primary" /> Record SOAP Note
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleSoapSubmit} className="space-y-4">
                <FormField
                  id="subjective"
                  label="Subjective (S)"
                  placeholder="Patient reports, symptoms, mood..."
                  as="textarea"
                  value={soapS}
                  onChange={(e) => setSoapS(e.target.value)}
                  disabled={addSoapNoteMutation.isPending}
                />
                <FormField
                  id="objective"
                  label="Objective (O)"
                  placeholder="Lab findings, vital tests, observations..."
                  as="textarea"
                  value={soapO}
                  onChange={(e) => setSoapO(e.target.value)}
                  disabled={addSoapNoteMutation.isPending}
                />
                <FormField
                  id="assessment"
                  label="Assessment (A)"
                  placeholder="Clinical diagnosis, status changes..."
                  as="textarea"
                  value={soapA}
                  onChange={(e) => setSoapA(e.target.value)}
                  disabled={addSoapNoteMutation.isPending}
                />
                <FormField
                  id="plan"
                  label="Plan (P)"
                  placeholder="Prescription edits, follow-ups, therapy..."
                  as="textarea"
                  value={soapP}
                  onChange={(e) => setSoapP(e.target.value)}
                  disabled={addSoapNoteMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={addSoapNoteMutation.isPending}
                  className="w-full h-10 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {addSoapNoteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Recording...
                    </>
                  ) : (
                    "Save SOAP Record"
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "diagnoses" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Diagnoses List */}
          <div className="lg:col-span-2 border border-border bg-card rounded-xl overflow-hidden shadow-xs h-fit">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 font-bold text-muted-foreground uppercase">ICD-10 Code</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase">Description</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase">Diagnosed On</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-semibold">
                {patient.diagnoses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No active diagnoses logged.
                    </td>
                  </tr>
                ) : (
                  patient.diagnoses.map((diag) => (
                    <tr key={diag.id} className="hover:bg-muted/10">
                      <td className="p-4 font-bold text-primary">{diag.code}</td>
                      <td className="p-4 text-foreground">{diag.description}</td>
                      <td className="p-4 text-muted-foreground">{diag.date}</td>
                      <td className="p-4 text-right">
                        <span className="px-2 py-0.5 rounded bg-success/15 text-success font-extrabold text-[10px] uppercase">
                          {diag.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Diagnosis Form */}
          <Card className="h-fit">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Plus className="h-4.5 w-4.5 text-primary" /> Log Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleDiagnosisSubmit} className="space-y-4">
                <FormField
                  id="diagCode"
                  label="ICD-10 Code"
                  placeholder="e.g. I10, E11"
                  value={diagCode}
                  onChange={(e) => setDiagCode(e.target.value)}
                  disabled={addDiagnosisMutation.isPending}
                />
                <FormField
                  id="diagDesc"
                  label="Diagnosis Description"
                  placeholder="e.g. Essential hypertension"
                  value={diagDesc}
                  onChange={(e) => setDiagDesc(e.target.value)}
                  disabled={addDiagnosisMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={addDiagnosisMutation.isPending}
                  className="w-full h-10 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {addDiagnosisMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Appending...
                    </>
                  ) : (
                    "Append Diagnosis"
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "scans" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scans List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Scans & Radiology Logs</h3>
            {patient.scans.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground bg-card border border-border rounded-xl">
                No radiography scans found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {patient.scans.map((scan) => (
                  <Card key={scan.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xs font-bold">{scan.name}</CardTitle>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{scan.date}</p>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded font-extrabold uppercase">
                        {scan.type}
                      </span>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 font-semibold text-xs text-muted-foreground flex flex-col justify-between">
                      <p className="line-clamp-2 italic font-medium">&ldquo;{scan.report}&rdquo;</p>
                      <button
                        onClick={() => setSelectedScan(scan)}
                        className="w-full h-8 mt-2 rounded bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary text-xxs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Radiograph
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Request Lab Panel Form */}
          <Card className="h-fit">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FolderPlus className="h-4.5 w-4.5 text-primary" /> Request Lab Order
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleLabOrderSubmit} className="space-y-4">
                <FormField
                  id="labName"
                  label="Scan Panel / Panel Name"
                  placeholder="e.g. Chest PA, Brain scan"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  disabled={addLabOrderMutation.isPending}
                />
                <FormField
                  id="labType"
                  label="Scan Type"
                  as="select"
                  value={labType}
                  onChange={(e) => setLabType(e.target.value as any)}
                  disabled={addLabOrderMutation.isPending}
                >
                  <option value="X-Ray">X-Ray</option>
                  <option value="CT">CT Scan</option>
                  <option value="MRI">MRI Scan</option>
                  <option value="ECG">ECG Graph</option>
                  <option value="Ultrasound">Ultrasound</option>
                </FormField>
                <button
                  type="submit"
                  disabled={addLabOrderMutation.isPending}
                  className="w-full h-10 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {addLabOrderMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Lab Order"
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "trends" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HbA1c Trend */}
          <ChartCard title="HbA1c Trend Analysis" description="Glycated hemoglobin levels tracker (%)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={labTrends} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[5.0, 7.5]} />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, "HbA1c"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="HbA1c" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Creatinine Trend */}
          <ChartCard title="Serum Creatinine Trend" description="Kidney function monitor levels (mg/dL)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={labTrends} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0.5, 1.5]} />
                <Tooltip 
                  formatter={(value: any) => [`${value} mg/dL`, "Creatinine"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="Creatinine" stroke="hsl(var(--warning))" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Overlay Scan Viewer */}
      {selectedScan && (
        <ScanViewer scan={selectedScan} onClose={() => setSelectedScan(null)} />
      )}
    </div>
  );
}
