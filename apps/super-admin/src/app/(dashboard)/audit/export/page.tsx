"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useAuditLogs } from "@/features/audit/hooks/use-audit";
import { downloadCSV } from "@/utils/csv";
import { toast } from "sonner";

export default function AuditExportPage() {
  const { data: logs = [] } = useAuditLogs();
  
  const [dateRange, setDateRange] = useState("Last 7 Days");
  const [format, setFormat] = useState("CSV (Comma Separated)");
  const [module, setModule] = useState("All Modules");

  const handleReset = () => {
    setDateRange("Last 7 Days");
    setFormat("CSV (Comma Separated)");
    setModule("All Modules");
    toast.success("Export filters reset.");
  };

  const handleExport = () => {
    if (logs.length === 0) {
      toast.error("No audit logs found to export.");
      return;
    }

    // Filter logs based on selected module
    const filtered = logs.filter(l => {
      if (module === "All Modules") return true;
      return l.module.toLowerCase() === module.toLowerCase();
    });

    const fileFormat = format.includes("CSV") ? "csv" : format.includes("Excel") ? "xlsx" : format.includes("JSON") ? "json" : "pdf";
    
    if (fileFormat === "json") {
      const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-export-${Date.now()}.json`;
      link.click();
    } else {
      downloadCSV(filtered, `audit-export-${Date.now()}.${fileFormat}`);
    }

    toast.success(`Audit logs exported in ${fileFormat.toUpperCase()} format.`);
  };

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
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none">
              <option>CSV (Comma Separated)</option>
              <option>Excel (.xlsx)</option>
              <option>PDF Report</option>
              <option>JSON (Machine Readable)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filter by Module</label>
          <select value={module} onChange={(e) => setModule(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none">
            <option value="All Modules">All Modules</option>
            <option value="auth">Authentication</option>
            <option value="patient">Patient Records</option>
            <option value="billing">Billing</option>
            <option value="security">Security</option>
          </select>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleReset}>Reset Filters</Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Generate Export
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
