import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export default function FinancialReportsPage() {
  const reports = [
    { title: "Monthly Revenue Report", description: "Detailed breakdown of revenue by tenant for the current month", date: "June 2026", type: "PDF" },
    { title: "Outstanding Collections", description: "List of all unpaid and overdue invoices across the platform", date: "June 2026", type: "Excel" },
    { title: "Insurance Claims Summary", description: "Analytics on claim approval rates and processing times", date: "Q2 2026", type: "PDF" },
    { title: "Subscription Churn Report", description: "Analysis of tenant subscriptions, renewals, and cancellations", date: "Year to Date", type: "Excel" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Financial Reports"
        description="Generate and view financial reports and analytics"
        actions={
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generate Custom Report
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-6">
        {reports.map((report, index) => (
          <div key={index} className="flex flex-col bg-card border border-border p-6 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-foreground">{report.title}</h3>
              <span className="text-xs font-medium px-2 py-1 bg-muted text-muted-foreground rounded">{report.type}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 flex-1">{report.description}</p>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">Period: {report.date}</span>
              <Button variant="ghost" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
