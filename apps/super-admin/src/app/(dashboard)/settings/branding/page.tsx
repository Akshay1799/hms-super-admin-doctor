import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { BrandingForm } from "@/features/settings/components/BrandingForm";

export default function BrandingSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Branding"
        description="Customize logo, colors, and messaging displayed across the platform"
      />
      <div className="mt-6">
        <SettingsCard title="Brand Configuration" description="Changes will apply to all portals, emails, and reports">
          <BrandingForm />
        </SettingsCard>
      </div>
    </PageContainer>
  );
}
