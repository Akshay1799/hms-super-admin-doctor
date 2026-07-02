"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useExportHistory, useUpdateExportHistory } from "@/features/reports/hooks/use-reports";

export default function CustomReportsPage() {
  const { data: history = [] } = useExportHistory();
  const updateHistory = useUpdateExportHistory();

  const [dataSource, setDataSource] = useState("tenants");
  const [metric, setMetric] = useState("revenue");
  const [groupBy, setGroupBy] = useState("month");
  
  const [queryData, setQueryData] = useState<any[] | null>(null);

  const handleReset = () => {
    setDataSource("tenants");
    setMetric("revenue");
    setGroupBy("month");
    setQueryData(null);
    toast.success("Query builder reset.");
  };

  const handleRunQuery = () => {
    let mockResult: any[] = [];
    if (dataSource === "tenants") {
      mockResult = [
        { Group: "CareFirst Healthcare", [metric.toUpperCase()]: 45000, Breakdown: groupBy === "month" ? "June 2026" : "US-East Region" },
        { Group: "Apex Clinics", [metric.toUpperCase()]: 28000, Breakdown: groupBy === "month" ? "June 2026" : "US-West Region" },
        { Group: "HealthOne Group", [metric.toUpperCase()]: 12000, Breakdown: groupBy === "month" ? "June 2026" : "EU-Central Region" },
      ];
    } else {
      mockResult = [
        { Group: "auth-module", [metric.toUpperCase()]: 1420, Breakdown: groupBy === "month" ? "June 2026" : "Critical Severity" },
        { Group: "clinical-records", [metric.toUpperCase()]: 3890, Breakdown: groupBy === "month" ? "June 2026" : "Info Severity" },
        { Group: "billing-gateway", [metric.toUpperCase()]: 150, Breakdown: groupBy === "month" ? "June 2026" : "Warning Severity" },
      ];
    }
    setQueryData(mockResult);
    toast.success("Query executed successfully. Preview loaded.");
  };

  const handleSave = () => {
    const reportName = `Custom ${dataSource.charAt(0).toUpperCase() + dataSource.slice(1)} by ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)} Report`;
    
    const newHistoryItem = {
      id: `rep-${Date.now()}`,
      reportName,
      format: "CSV",
      size: "24.5 KB",
      requestedBy: "Super Admin",
      status: "completed" as const,
      createdAt: new Date().toISOString(),
    };

    updateHistory.mutate([newHistoryItem, ...history], {
      onSuccess: () => {
        toast.success(`Custom report configuration "${reportName}" saved to history.`);
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Custom Reports Builder"
        description="Design and schedule dynamic reports based on platform-wide filters and visualizations"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save Configuration</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Options Panel */}
        <div className="lg:col-span-1 bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Report Parameters</h3>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Data Source</label>
            <select value={dataSource} onChange={(e) => setDataSource(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none">
              <option value="tenants">Tenant Billing & Analytics</option>
              <option value="audit">System Audit Logs</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Target Metric</label>
            <select value={metric} onChange={(e) => setMetric(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none">
              {dataSource === "tenants" ? (
                <>
                  <option value="revenue">Annual Recurring Revenue (ARR)</option>
                  <option value="hospitals">Registered Hospitals Count</option>
                  <option value="users">Active Users</option>
                </>
              ) : (
                <>
                  <option value="events">Audit Event Count</option>
                  <option value="errors">Error Logs Count</option>
                  <option value="warnings">Warnings Triggered</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Group By Dimension</label>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none">
              <option value="month">Time Period (Monthly)</option>
              <option value="region">Geographic Region / Severity</option>
            </select>
          </div>

          <div className="pt-2">
            <Button onClick={handleRunQuery} className="w-full">
              <Play className="mr-2 h-4 w-4" />Run Query Preview
            </Button>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Query Live Preview</h3>
          
          {queryData ? (
            <div className="border border-border rounded-lg overflow-hidden flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                    <th className="p-3">Target Field</th>
                    <th className="p-3">Metric Value</th>
                    <th className="p-3">Dimension</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {queryData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="p-3 font-medium text-foreground">{row.Group}</td>
                      <td className="p-3 font-mono">{typeof row[metric.toUpperCase()] === "number" ? row[metric.toUpperCase()].toLocaleString() : row[metric.toUpperCase()]}</td>
                      <td className="p-3 text-muted-foreground">{row.Breakdown}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 h-64 border border-dashed rounded-lg border-border bg-muted/20 space-y-4">
              <p className="text-muted-foreground text-sm font-medium">Configure fields and run query to preview reporting records.</p>
              <Button variant="outline" onClick={handleRunQuery}><PlusCircle className="mr-2 h-4 w-4" />Execute Simulation</Button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
