"use client";

import React from "react";
import { Patient } from "../types/patients.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartCard } from "@/components/ui/chart-card";
import { AlertOctagon, Heart, ShieldAlert, Thermometer, Weight, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface CoreProfileProps {
  patient: Patient;
}

export function CoreProfile({ patient }: CoreProfileProps) {
  const latestVital = patient.vitals[patient.vitals.length - 1] || {
    bpSystolic: 120,
    bpDiastolic: 80,
    temperature: 98.6,
    weight: 70,
    spo2: 98,
  };

  return (
    <div className="space-y-6">
      {/* Risk Alert Banner */}
      {patient.allergies.length > 0 && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3.5 text-xs text-destructive font-semibold">
          <AlertOctagon className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm">Critical Allergies / Contraindications</h4>
            <p className="mt-1 opacity-90 leading-relaxed">
              This patient has documented hypersensitivities to:{" "}
              <span className="underline font-extrabold">{patient.allergies.join(", ")}</span>.
              Do not prescribe or administer medication containing these compounds.
            </p>
          </div>
        </div>
      )}

      {/* Grid of Latest Vitals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blood Pressure */}
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
          <div className="rounded-lg bg-rose-500/10 p-2 text-rose-500">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Blood Pressure</span>
            <span className="text-base font-extrabold text-foreground">{latestVital.bpSystolic}/{latestVital.bpDiastolic}</span>
            <span className="text-[10px] text-muted-foreground block">mmHg</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
          <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
            <Thermometer className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Temperature</span>
            <span className="text-base font-extrabold text-foreground">{latestVital.temperature}</span>
            <span className="text-[10px] text-muted-foreground block">°F</span>
          </div>
        </div>

        {/* SpO2 */}
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
          <div className="rounded-lg bg-sky-500/10 p-2 text-sky-500">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Oxygen Saturation</span>
            <span className="text-base font-extrabold text-foreground">{latestVital.spo2}%</span>
            <span className="text-[10px] text-muted-foreground block">SpO₂</span>
          </div>
        </div>

        {/* Weight */}
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
            <Weight className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Weight</span>
            <span className="text-base font-extrabold text-foreground">{latestVital.weight}</span>
            <span className="text-[10px] text-muted-foreground block">kg</span>
          </div>
        </div>
      </div>

      {/* Vitals Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BP Trend Chart */}
        <ChartCard title="Blood Pressure Trend" description="Systolic vs Diastolic parameters">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={patient.vitals} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[60, 200]} />
              <Tooltip 
                formatter={(value: any, name: any) => [value, name === "bpSystolic" ? "Systolic" : "Diastolic"]}
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
              />
              <Line type="monotone" dataKey="bpSystolic" name="bpSystolic" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="bpDiastolic" name="bpDiastolic" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* SpO2 & Temp Trend Chart */}
        <ChartCard title="Temperature & SpO₂ Trend" description="Oxygen saturation and body temperature parameters">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={patient.vitals} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[90, 102]} />
              <Tooltip 
                formatter={(value: any, name: any) => [value, name === "temperature" ? "Temp (°F)" : "SpO₂ (%)"]}
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
              />
              <Line type="monotone" dataKey="temperature" name="temperature" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="spo2" name="spo2" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Medical History Conditions */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-primary" />
            Medical History / Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {patient.medicalHistory.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.medicalHistory.map((cond) => (
                <span 
                  key={cond} 
                  className="px-2.5 py-1 rounded-lg bg-muted border border-border text-xs font-bold text-foreground"
                >
                  {cond}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No chronic conditions recorded.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
