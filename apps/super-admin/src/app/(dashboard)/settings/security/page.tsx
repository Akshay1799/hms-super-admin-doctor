import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { SecurityPolicyForm } from "@/features/settings/components/SecurityPolicyForm";

export default function SecuritySettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Security Settings"
        description="Manage platform-wide password policies, session rules, and MFA requirements"
      />
      <div className="mt-6">
        <SettingsCard title="Security Policies" description="These settings apply to all tenants and users on the platform">
          <SecurityPolicyForm />
        </SettingsCard>
      </div>
    </PageContainer>
  );
}
