import React from "react";
import { TenantDetails } from "../../services/tenant.service";
import { StatusBadge } from "@/components/ui/status-badge";
import { Globe, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";

interface DomainsTabProps {
  details: TenantDetails;
  onVerifyDomain: () => void;
  isVerifying?: boolean;
}

export function DomainsTab({ details, onVerifyDomain, isVerifying = false }: DomainsTabProps) {
  const { domain } = details;

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Domain Routing Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure default subdomains and custom domains.
          </p>
        </div>
        {!domain.verified && (
          <button
            onClick={onVerifyDomain}
            disabled={isVerifying}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-xs font-semibold text-white shadow hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? "animate-spin" : ""}`} />
            {isVerifying ? "Verifying..." : "Verify DNS Records"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Subdomain */}
        <div className="p-5 border border-border rounded-xl bg-card space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/5 text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Primary Subdomain</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Assigned by MediChain</p>
              </div>
            </div>
            <StatusBadge status={domain.verified ? "Active" : "Trial"} />
          </div>

          <div className="p-3 bg-muted/30 border border-border rounded-lg">
            <p className="font-mono text-sm text-foreground select-all">{domain.primaryDomain}</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-success">
            <ShieldCheck className="h-4 w-4" />
            <span>SSL Protected (Let&apos;s Encrypt wildcard certificate)</span>
          </div>
        </div>

        {/* Custom Domain */}
        <div className="p-5 border border-border rounded-xl bg-card space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/5 text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Custom Domain</h4>
                <p className="text-xs text-muted-foreground mt-0.5">CNAME Mapping</p>
              </div>
            </div>
            <StatusBadge status={domain.customDomain ? (domain.verified ? "Active" : "Pending") : "Inactive"} />
          </div>

          {domain.customDomain ? (
            <>
              <div className="p-3 bg-muted/30 border border-border rounded-lg">
                <p className="font-mono text-sm text-foreground select-all">{domain.customDomain}</p>
              </div>

              {domain.verified ? (
                <div className="flex items-center gap-2 text-xs text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>CNAME configured correctly. SSL active.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-warning">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Action Required: DNS Setup</p>
                    <p className="text-muted-foreground mt-0.5">
                      Point a CNAME record for <span className="font-mono">{domain.customDomain}</span> to{" "}
                      <span className="font-mono">domains.medichain.com</span>.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
              <p className="text-xs">No custom domain configured.</p>
              <p className="text-xs mt-1">Edit settings to bind a brand domain.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
