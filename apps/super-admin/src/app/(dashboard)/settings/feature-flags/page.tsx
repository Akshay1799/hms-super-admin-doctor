import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { FeatureFlagTable } from "@/features/settings/components/FeatureFlagTable";

export default function FeatureFlagsSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Feature Flags"
        description="Enable or disable platform capabilities in real-time without code deployment"
      />
      <div className="mt-6">
        <FeatureFlagTable />
      </div>
    </PageContainer>
  );
}
