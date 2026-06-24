"use client";

import React from "react";
import { Patient } from "../types/patients.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserCheck, ShieldAlert, Clock, User, Clipboard } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

interface CareHistoryProps {
  patient: Patient;
}

export function CareHistory({ patient }: CareHistoryProps) {
  return (
    <div className="space-y-6">
      {/* Care Team Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-primary" />
              Assigned Care Staff
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-4 w-4" /> Assigned Nurse:
              </span>
              <span className="text-foreground">{patient.assignedNurse || "Awaiting Assignment"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-4 w-4" /> Assigned Compounder:
              </span>
              <span className="text-foreground">{patient.assignedCompounder || "Awaiting Assignment"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Current Staff Shift:
              </span>
              <span className="text-foreground">{patient.shift || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clipboard className="h-4.5 w-4.5 text-primary" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Ward Wing:</span>
              <span className="text-foreground">{patient.ward}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Bed Allocation:</span>
              <span className="text-foreground">{patient.bedNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Admission Status:</span>
              <StatusBadge status={patient.status} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medication Administration Logs */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            Medication Administration Records (MAR)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {patient.medications.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No medications recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Medication Name</th>
                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Dosage</th>
                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Frequency</th>
                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Food Instruction</th>
                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Prescribed By</th>
                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Administered By</th>
                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {patient.medications.map((med) => (
                    <tr key={med.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-bold text-foreground">{med.name}</td>
                      <td className="p-4 text-muted-foreground font-semibold">{med.dose}</td>
                      <td className="p-4 text-muted-foreground">{med.frequency}</td>
                      <td className="p-4 text-muted-foreground">{med.foodInstructions}</td>
                      <td className="p-4 text-muted-foreground">{med.prescribedBy}</td>
                      <td className="p-4 text-muted-foreground">
                        {med.administeredBy ? (
                          <div className="space-y-0.5">
                            <p className="font-semibold">{med.administeredBy}</p>
                            {med.administeredDate && (
                              <p className="text-[10px] text-muted-foreground">{med.administeredDate}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <StatusBadge status={med.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
