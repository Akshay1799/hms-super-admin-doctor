import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { GeneralSettingsForm } from "@/features/settings/components/GeneralSettingsForm";

export default function GeneralSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="General Settings"
        description="Configure fundamental platform details, regional settings, and contact information"
      />
      <div className="mt-6">
        <SettingsCard title="Platform Information" description="These details will be displayed across emails, portals, and reports">
          <GeneralSettingsForm />
        </SettingsCard>
      </div>
    </PageContainer>
  );
}
