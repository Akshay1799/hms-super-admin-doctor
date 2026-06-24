"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function AuditExportPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Export Audit Data"
        description="Extract immutable system logs for regulatory reporting and compliance"
      />
      <div className="mt-6 max-w-2xl bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Range</label>
            <select className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Format</label>
            <select className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none">
              <option>CSV (Comma Separated)</option>
              <option>Excel (.xlsx)</option>
              <option>PDF Report</option>
              <option>JSON (Machine Readable)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filter by Module</label>
          <select className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none">
            <option>All Modules</option>
            <option>Authentication</option>
            <option>Patient Records</option>
            <option>Billing</option>
            <option>Security</option>
          </select>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button variant="outline">Reset Filters</Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Generate Export
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
