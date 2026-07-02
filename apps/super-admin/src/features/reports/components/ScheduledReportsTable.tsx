"use client";

import React, { useState } from "react";
import { AppTable } from "@/components/ui/app-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useScheduledReports, useUpdateScheduledReports } from "../hooks/use-reports";
import { ScheduledReport } from "../types/reports.types";
import { Button } from "@/components/ui/button";
import { Edit2, PauseCircle, PlayCircle, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export function ScheduledReportsTable() {
  const { data: reports = [], isLoading } = useScheduledReports();
  const updateReports = useUpdateScheduledReports();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);

  const handleToggleStatus = (id: string) => {
    const updated = reports.map((r: any) => {
      if (r.id === id) {
        const nextStatus = r.status === "active" ? "paused" : "active";
        toast.success(`Schedule ${r.name} status set to ${nextStatus}.`);
        return { ...r, status: nextStatus };
      }
      return r;
    });
    updateReports.mutate(updated);
  };

  const handleDelete = (id: string) => {
    const updated = reports.filter((r: any) => r.id !== id);
    updateReports.mutate(updated, {
      onSuccess: () => {
        toast.success("Schedule deleted successfully.");
      }
    });
  };

  const handleEditOpen = (report: ScheduledReport) => {
    setSelectedReport(report);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const frequency = formData.get("frequency") as any;
    const recipients = (formData.get("recipients") as string).split(",").map(s => s.trim());

    const updated = reports.map((r: any) => {
      if (r.id === selectedReport?.id) {
        return { ...r, name, frequency, recipients };
      }
      return r;
    });

    updateReports.mutate(updated, {
      onSuccess: () => {
        toast.success("Schedule configuration updated successfully.");
        setIsEditModalOpen(false);
      }
    });
  };

  const columns = [
    { header: "Report Name", accessor: (row: ScheduledReport) => <span className="font-semibold text-sm text-foreground">{row.name}</span> },
    { header: "Frequency", accessor: (row: ScheduledReport) => <span className="text-sm capitalize text-muted-foreground">{row.frequency}</span> },
    { header: "Recipients", accessor: (row: ScheduledReport) => <span className="text-sm">{row.recipients.join(', ')}</span> },
    { header: "Next Run", accessor: (row: ScheduledReport) => new Date(row.nextRun).toLocaleDateString() },
    { header: "Status", accessor: (row: ScheduledReport) => <StatusBadge status={row.status} /> },
    { header: "Actions", accessor: (row: ScheduledReport) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => handleEditOpen(row)} title="Edit Schedule"><Edit2 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(row.id)} title={row.status === "active" ? "Pause" : "Activate"}>
          {row.status === "active" ? <PauseCircle className="h-4 w-4 text-warning" /> : <PlayCircle className="h-4 w-4 text-success" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
    )},
  ];

  return (
    <>
      <AppTable columns={columns} data={reports} isLoading={isLoading} />

      {/* Edit Modal */}
      {isEditModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Edit Scheduled Report</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Report Title</label>
                <input required type="text" name="name" defaultValue={selectedReport.name} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Frequency</label>
                <select name="frequency" defaultValue={selectedReport.frequency} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Recipient Emails (comma-separated)</label>
                <input required type="text" name="recipients" defaultValue={selectedReport.recipients.join(", ")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="pt-2 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Configurations</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
