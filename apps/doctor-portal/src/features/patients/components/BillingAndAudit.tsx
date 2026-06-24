"use client";

import React from "react";
import { Patient } from "../types/patients.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, CreditCard, ShieldAlert } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

interface BillingAndAuditProps {
  patient: Patient;
}

export function BillingAndAudit({ patient }: BillingAndAuditProps) {
  return (
    <div className="space-y-6">
      {/* Clinician Access Banner */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-start gap-3 text-xs text-primary font-semibold">
        <Shield className="h-5 w-5 shrink-0" />
        <div>
          <h4 className="font-extrabold text-sm">Read-Only Administrative View</h4>
          <p className="mt-1 opacity-90 leading-relaxed">
            In accordance with HIPAA compliance guidelines and hospital tenant structures, clinicians are granted read-only access to patient billing transactions and audit trails. Modifications can only be performed by billing clerks or system administrators.
          </p>
        </div>
      </div>

      {/* Grid: Billing Table & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Summaries */}
        <Card>
          <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-primary" />
              Patient Billing Summary
            </CardTitle>
            <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded border border-border">Read-Only</span>
          </CardHeader>
          <CardContent className="p-0">
            {patient.billing.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No billing statements recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="p-3 font-bold text-muted-foreground uppercase tracking-wider">Invoice</th>
                      <th className="p-3 font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="p-3 font-bold text-muted-foreground uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-semibold">
                    {patient.billing.map((bill) => (
                      <tr key={bill.id} className="hover:bg-muted/10">
                        <td className="p-3">
                          <p className="font-bold text-foreground">{bill.invoiceNumber}</p>
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{bill.date}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">${bill.amount.toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <StatusBadge status={bill.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Audits */}
        <Card>
          <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-primary" />
              Record Access Audit Trail
            </CardTitle>
            <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded border border-border">System Log</span>
          </CardHeader>
          <CardContent className="p-0">
            {patient.audits.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No system logs recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="p-3 font-bold text-muted-foreground uppercase tracking-wider">User / Action</th>
                      <th className="p-3 font-bold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                      <th className="p-3 font-bold text-muted-foreground uppercase tracking-wider text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-semibold">
                    {patient.audits.map((aud) => (
                      <tr key={aud.id} className="hover:bg-muted/10">
                        <td className="p-3">
                          <p className="font-bold text-foreground">{aud.user}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{aud.action}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">{aud.timestamp}</td>
                        <td className="p-3 text-right font-mono text-muted-foreground">{aud.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
