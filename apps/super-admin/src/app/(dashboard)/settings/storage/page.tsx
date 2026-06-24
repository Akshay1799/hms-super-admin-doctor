import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { StorageSettingsForm } from "@/features/settings/components/StorageSettingsForm";

export default function StorageSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Storage Settings"
        description="Configure file storage provider, retention periods, and backup policies"
      />
      <div className="mt-6">
        <SettingsCard title="Storage Configuration" description="Define how platform assets and documents are stored">
          <StorageSettingsForm />
        </SettingsCard>
      </div>
    </PageContainer>
  );
}
