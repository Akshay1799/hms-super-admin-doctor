"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { HospitalStepperForm } from "@/features/hospitals/components/HospitalStepperForm";
import { useCreateHospital } from "@/features/hospitals/hooks/useHospitals";
import { useRouter } from "next/navigation";

export default function CreateHospitalPage() {
  const { mutate: createHospital, isPending } = useCreateHospital();
  const router = useRouter();

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Hospitals", href: "/hospitals" },
          { label: "Onboard" },
        ]}
      />

      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <PageHeader
          title="Onboard New Hospital Node"
          description="Establish a primary hospital entity, set geo-address coordinates, allocate bed capacity, and bind local settings."
        />

        <HospitalStepperForm
          isLoading={isPending}
          onSubmit={(data) => {
            createHospital(data, {
              onSuccess: () => {
                router.push("/hospitals");
              },
            });
          }}
        />
      </div>
    </PageContainer>
  );
}
