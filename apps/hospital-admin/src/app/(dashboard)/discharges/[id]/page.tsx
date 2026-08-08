"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, Download, Printer, UserCircle2, CheckSquare, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DischargeDetailsPage({ params }: { params: { id: string } }) {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await apiClient.get("/ipd/discharge-summaries");
      const found = res.data.data.find((s: any) => s._id === params.id);
      if (found) {
        setSummary(found);
      }
    } catch (error) {
      toast.error("Failed to fetch discharge summary details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [params.id]);

  const handleClearBilling = async () => {
    setIsUpdating(true);
    try {
      await apiClient.post(`/ipd/discharge-summaries/${params.id}/clear-billing`, { notes: "Manually cleared via Admin UI" });
      toast.success("Billing cleared successfully!");
      fetchSummary();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clear billing");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePublish = async () => {
    setIsUpdating(true);
    try {
      await apiClient.post(`/ipd/discharge-summaries/${params.id}/publish`);
      toast.success("Discharge summary published and patient officially discharged!");
      fetchSummary();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to publish discharge");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  if (!summary) return <div className="p-12 text-center text-muted-foreground">Discharge Summary not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/discharges`} className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Discharge Summary Document</h1>
            <p className="text-sm text-muted-foreground mt-1">Status: <span className="font-semibold text-primary">{summary.status}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {summary.status === "Billing Pending" && (
            <button 
              onClick={handleClearBilling}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
              Clear Billing
            </button>
          )}
          {summary.status === "Billing Cleared" && (
            <button 
              onClick={handlePublish}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Finalize Discharge (Publish)
            </button>
          )}
          {summary.status === "Published" && (
            <>
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-card border border-border shadow-md p-8 md:p-12 space-y-10 max-w-4xl mx-auto rounded-sm print:shadow-none print:border-none print:p-0">
        
        {/* Document Header */}
        <div className="text-center border-b border-border pb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-widest mb-2">Discharge Summary</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">DOCUMENT NO: DS-{summary._id.substring(summary._id.length - 8).toUpperCase()}</p>
        </div>

        {/* Patient Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-8">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Patient Information</h3>
            <div className="space-y-2">
              <p className="text-sm"><span className="font-semibold w-24 inline-block text-slate-600 dark:text-slate-300">Name:</span> <span className="font-bold text-base">{summary.patientId?.name}</span></p>
              <p className="text-sm"><span className="font-semibold w-24 inline-block text-slate-600 dark:text-slate-300">MRN:</span> {summary.patientId?.mrn}</p>
              <p className="text-sm"><span className="font-semibold w-24 inline-block text-slate-600 dark:text-slate-300">Age / Sex:</span> {summary.patientId?.age} Y / {summary.patientId?.gender}</p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Admission Details</h3>
            <div className="space-y-2">
              <p className="text-sm"><span className="font-semibold w-32 inline-block text-slate-600 dark:text-slate-300">Admission Date:</span> {format(new Date(summary.createdAt), "dd MMM yyyy")}</p>
              <p className="text-sm"><span className="font-semibold w-32 inline-block text-slate-600 dark:text-slate-300">Discharge Date:</span> {summary.publishedAt ? format(new Date(summary.publishedAt), "dd MMM yyyy") : "Pending"}</p>
              <p className="text-sm"><span className="font-semibold w-32 inline-block text-slate-600 dark:text-slate-300">Treating Doctor:</span> {summary.treatingDoctorId?.name}</p>
            </div>
          </div>
        </div>

        {/* Clinical Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Clinical Course</h3>
          
          <div>
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">Chief Complaints</h4>
            <p className="text-sm text-slate-800 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded">
              {summary.clinicalDetails?.chiefComplaints || "Not specified."}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">Final Diagnosis</h4>
            <p className="text-sm text-slate-800 dark:text-slate-400 leading-relaxed font-semibold">
              {summary.clinicalDetails?.finalDiagnosis || "Not specified."}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">Hospital Course & Clinical Progress</h4>
            <p className="text-sm text-slate-800 dark:text-slate-400 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900 p-3 rounded">
              {summary.clinicalDetails?.hospitalCourse || "No detailed hospital course provided."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
