"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ScheduledReportsTable } from "@/features/reports/components/ScheduledReportsTable";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import { useScheduledReports, useUpdateScheduledReports } from "@/features/reports/hooks/use-reports";
import { toast } from "sonner";

export default function ScheduledReportsPage() {
  const { data: reports = [] } = useScheduledReports();
  const updateReports = useUpdateScheduledReports();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const frequency = formData.get("frequency") as any;
    const recipients = (formData.get("recipients") as string).split(",").map(s => s.trim());

    const newReport = {
      id: `sch-${Date.now()}`,
      name,
      frequency,
      recipients,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: "active" as const,
      createdAt: new Date().toISOString(),
    };

    updateReports.mutate([newReport, ...reports], {
      onSuccess: () => {
        toast.success("New automated report schedule created successfully.");
        setIsAddModalOpen(false);
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Scheduled Reports"
        description="Manage automated report generation and delivery schedules"
        actions={<Button onClick={() => setIsAddModalOpen(true)}><Clock className="mr-2 h-4 w-4" />New Schedule</Button>}
      />
      <div className="mt-6">
        <ScheduledReportsTable />
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Create Report Schedule</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Report Title</label>
                <input required type="text" name="name" placeholder="e.g. Weekly Operations Summary" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Frequency</label>
                <select name="frequency" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Recipient Emails (comma-separated)</label>
                <input required type="text" name="recipients" placeholder="admin@hospital.com, security@hms.com" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Schedule Report</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
