import React from "react";
import { HospitalDetails } from "../../services/hospital.service";
import { ShieldCheck, Calendar, AlertTriangle, AlertOctagon, FileText, CheckCircle } from "lucide-react";

interface AccreditationTabProps {
  details: HospitalDetails;
}

export function AccreditationTab({ details }: AccreditationTabProps) {
  const { accreditation } = details;

  // Simple date calculations for license expiry alerts
  const expiry = accreditation.expiryDate ? new Date(accreditation.expiryDate) : null;
  const now = new Date();
  const diffTime = expiry ? expiry.getTime() - now.getTime() : 0;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = expiry && diffDays <= 0;
  const isExpiringSoon = expiry && diffDays > 0 && diffDays <= 180; // Within 6 months

  return (
    <div className="space-y-6 bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm animate-in fade-in duration-200">
      <div>
        <h2 className="text-base font-bold text-foreground">Accreditations & Certificates</h2>
        <p className="text-sm text-muted-foreground mt-0.5">National and international healthcare quality certifications.</p>
      </div>

      {/* Warnings & Alerts */}
      {isExpired && (
        <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive text-sm font-semibold">
          <AlertOctagon className="h-5 w-5 shrink-0" />
          <div>
            <p>CRITICAL WARNING: Hospital State License Expired!</p>
            <p className="text-xs font-normal mt-0.5">The clinical operating license has expired on {accreditation.expiryDate}. Please renew immediately.</p>
          </div>
        </div>
      )}

      {isExpiringSoon && (
        <div className="flex gap-3 rounded-lg border border-warning/20 bg-warning/5 p-4 text-warning text-sm font-semibold">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p>ACTION REQUIRED: License Expiring Soon!</p>
            <p className="text-xs font-normal mt-0.5">The operating license expires in {diffDays} days ({accreditation.expiryDate}). Please start the renewal process.</p>
          </div>
        </div>
      )}

      {/* Badges list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "NABH Accreditation", value: accreditation.nabh, desc: "National Accreditation Board for Hospitals" },
          { label: "JCI Accreditation", value: accreditation.jci, desc: "Joint Commission International standards" },
          { label: "ISO Quality Standards", value: accreditation.iso, desc: "International Organization for Standardization" },
        ].map((item, idx) => {
          const isAcc = item.value === "Accredited" || item.value === "Certified";
          const isPen = item.value === "Pending";

          return (
            <div key={idx} className="p-5 border border-border rounded-xl bg-card space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">{item.label}</span>
                <h4 className={`text-base font-bold ${isAcc ? "text-success" : isPen ? "text-warning" : "text-muted-foreground"}`}>
                  {item.value}
                </h4>
                <p className="text-xs text-muted-foreground leading-normal">{item.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {isAcc ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-success font-medium">Verified Compliance</span>
                  </>
                ) : isPen ? (
                  <>
                    <Calendar className="h-4 w-4 text-warning" />
                    <span className="text-warning font-medium">Audit Ongoing</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Not Certified</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-4 mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Regulatory Documents</h3>
        <div className="p-4 border border-border rounded-lg bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-card text-muted-foreground border border-border">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">State Healthcare Operating License</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">License Number: {accreditation.licenseNumber}</p>
            </div>
          </div>
          <div className="text-xs sm:text-right shrink-0">
            <p className="text-muted-foreground">Expiry Date:</p>
            <p className="font-semibold text-foreground mt-0.5">{accreditation.expiryDate || "Not Provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
