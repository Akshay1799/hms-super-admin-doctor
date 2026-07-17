"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  FileText,
  Download,
  Loader2,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const [revenueData, setRevenueData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    async function fetchBillingStats() {
      try {
        const res = await apiClient.get("/billing/invoices/revenue-summary");
        setRevenueData(res.data.data);
      } catch {
        toast.error("Failed to load invoice metrics");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBillingStats();
  }, []);

  const reportsList = [
    {
      title: "Bed Occupancy Trends",
      description: "Monthly trends breakdown of ward admissions, discharges, and average lengths of stay.",
      type: "Clinical",
      headers: ["Date", "Ward Name", "Occupied Beds", "Admissions", "Discharges"],
      data: [
        ["2026-07-01", "General Ward", "18", "3", "1"],
        ["2026-07-02", "ICU Unit", "4", "1", "0"],
        ["2026-07-03", "OPD Block", "12", "6", "4"],
        ["2026-07-04", "Pediatric Ward", "8", "2", "2"],
      ],
    },
    {
      title: "Physician Consultations",
      description: "Aggregate review of consultations served per doctor, follow-up rates, and no-shows.",
      type: "Clinical",
      headers: ["Doctor Name", "Specialty", "Appointments Served", "No Shows", "Feedback Rating"],
      data: [
        ["Dr. Shweta", "Cardiologist", "42", "2", "4.9"],
        ["Dr. Rajesh Kumar", "Pediatrics", "31", "1", "4.8"],
        ["Dr. Anjali Sen", "General Medicine", "56", "4", "4.7"],
      ],
    },
    {
      title: "Billing & Revenue Breakdown",
      description: "Daily summaries of paid, unpaid, and cancelled invoices, including insurance claim rates.",
      type: "Financial",
      headers: ["Transaction Date", "Invoices Issued", "Paid Receipts", "Outstanding Dues", "Net Revenue"],
      data: [
        ["2026-07-12", "15", "12", "₹14,500", "₹54,000"],
        ["2026-07-13", "24", "20", "₹8,000", "₹92,500"],
        ["2026-07-14", "19", "15", "₹12,000", "₹76,000"],
      ],
    },
    {
      title: "Operational Audit Trails",
      description: "Security logging history, PHI access compliance audits, and access controls report.",
      type: "Security",
      headers: ["Timestamp", "Authorized Personnel", "Action Taken", "Resource Accessed", "Status"],
      data: [
        ["2026-07-14 22:00:15", "Admin User", "User Authentication", "Super Admin Panel", "SUCCESS"],
        ["2026-07-14 22:05:42", "Dr. Shweta", "EMR Modification", "Patient ID: pat-120", "SUCCESS"],
        ["2026-07-14 22:08:11", "Receptionist B", "Billing Clearance", "Invoice ID: inv-401", "SUCCESS"],
      ],
    },
  ];

  const handleDownloadCSV = (report: any) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += report.headers.join(",") + "\n";
    report.data.forEach((row: string[]) => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${report.title.toLowerCase().replace(/ /g, "_")}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${report.title} downloaded successfully!`);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Compile, generate, and download clinical outcomes, operational audits, and financial summaries.
      </p>

      {/* Financial Overview Card */}
      {revenueData && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
            Financial Health Summary (Paid Invoices)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Aggregate Revenue</p>
              <p className="text-xl font-black text-foreground">₹{revenueData.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Paid Invoices</p>
              <p className="text-xl font-black text-green-600 dark:text-green-400">{revenueData.paidCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Pending Bills</p>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">{revenueData.unpaidCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Overdue Accounts</p>
              <p className="text-xl font-black text-destructive">{revenueData.overdueCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded font-bold uppercase">
                  {rep.type}
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground">{rep.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{rep.description}</p>
            </div>

            <div className="border-t border-border pt-4 flex gap-2.5 justify-end">
              <button
                onClick={() => setSelectedReport(rep)}
                className="h-8 px-3 border border-border hover:bg-muted text-foreground rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Preview
              </button>
              <button
                onClick={() => handleDownloadCSV(rep)}
                className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl shadow-2xl space-y-4 relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="space-y-1">
              <span className="text-[9px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-extrabold uppercase">
                {selectedReport.type} Report Preview
              </span>
              <h3 className="text-base font-bold text-foreground">{selectedReport.title}</h3>
              <p className="text-xs text-muted-foreground">{selectedReport.description}</p>
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-background">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase border-b border-border">
                      {selectedReport.headers.map((h: string, idx: number) => (
                        <th key={idx} className="p-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs text-foreground">
                    {selectedReport.data.map((row: string[], rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-muted/30">
                        {row.map((cell: string, cIdx: number) => (
                          <td key={cIdx} className="p-3 font-semibold">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="h-10 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleDownloadCSV(selectedReport);
                  setSelectedReport(null);
                }}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download Spreadsheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
