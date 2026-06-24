import React, { useState } from "react";
import { TenantDetails } from "../../services/tenant.service";
import { TenantSubscription } from "../../types/tenant.types";
import { CreditCard, Calendar, Check, RefreshCcw } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

interface SubscriptionTabProps {
  details: TenantDetails;
  onUpdateSubscription: (sub: TenantSubscription) => void;
  isUpdating?: boolean;
}

export function SubscriptionTab({
  details,
  onUpdateSubscription,
  isUpdating = false,
}: SubscriptionTabProps) {
  const { subscription } = details;
  const [selectedPlan, setSelectedPlan] = useState<string>(subscription.plan);
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Yearly">(subscription.billingCycle);

  const planOptions = [
    { name: "Basic", priceMonthly: 150, priceYearly: 120, features: ["Up to 2 Hospitals", "Up to 5 Branches", "Standard EMR", "Basic Analytics"] },
    { name: "Professional", priceMonthly: 450, priceYearly: 360, features: ["Up to 10 Hospitals", "Up to 25 Branches", "Advanced EMR + Pharmacy", "SMS Notifications", "Custom Subdomain"] },
    { name: "Enterprise", priceMonthly: 1500, priceYearly: 1200, features: ["Unlimited Hospitals & Branches", "Dedicated Custom Domain", "Full Clinical Feature Gate", "Priority 24/7 SLA Support", "Audit Trails & Compliance logs"] },
  ];

  const handleUpdate = () => {
    const matchedPlan = planOptions.find((p) => p.name === selectedPlan);
    const cost = matchedPlan
      ? billingCycle === "Monthly"
        ? matchedPlan.priceMonthly
        : matchedPlan.priceYearly * 12
      : 0;

    onUpdateSubscription({
      plan: selectedPlan,
      billingCycle,
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: subscription.status,
      amount: cost,
    });
  };

  return (
    <div className="bg-card border border-border rounded-[var(--radius-card)] p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Subscription Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Modify subscription tier, cycle, or check payment details.
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={subscription.status} />
        </div>
      </div>

      {/* Subscription Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-border rounded-xl bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <CreditCard className="h-4 w-4" />
            <span>Active plan</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{subscription.plan}</p>
          <p className="text-xs text-muted-foreground mt-1">Billing {subscription.billingCycle}</p>
        </div>

        <div className="p-4 border border-border rounded-xl bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <Calendar className="h-4 w-4" />
            <span>Renewal date</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{subscription.renewalDate}</p>
          <p className="text-xs text-muted-foreground mt-1">Automatic renewals enabled</p>
        </div>

        <div className="p-4 border border-border rounded-xl bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <CreditCard className="h-4 w-4" />
            <span>Recurring amount</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            ${subscription.amount.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground">/{subscription.billingCycle === "Monthly" ? "mo" : "yr"}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Through mapped payment profile</p>
        </div>
      </div>

      <div className="border-t border-border pt-6" />

      {/* Modify Subscription */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground">Change Subscription Tier</h3>
        
        {/* Billing cycle toggle */}
        <div className="flex items-center gap-3 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setBillingCycle("Monthly")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              billingCycle === "Monthly"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("Yearly")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              billingCycle === "Yearly"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly (Save 20%)
          </button>
        </div>

        {/* Pricing tier cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {planOptions.map((plan) => {
            const price = billingCycle === "Monthly" ? plan.priceMonthly : plan.priceYearly;
            const isSelected = selectedPlan === plan.name;

            return (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className={`p-5 border rounded-xl bg-card hover:bg-muted/10 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected ? "border-primary ring-1 ring-primary/25 bg-primary/[0.01]" : "border-border"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">{plan.name}</span>
                    {isSelected && (
                      <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-extrabold text-foreground">${price}</span>
                    <span className="text-xs text-muted-foreground ml-1">/month</span>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-primary shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleUpdate}
            disabled={isUpdating || (selectedPlan === subscription.plan && billingCycle === subscription.billingCycle)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCcw className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
            Update Subscription Plan
          </button>
        </div>
      </div>
    </div>
  );
}
