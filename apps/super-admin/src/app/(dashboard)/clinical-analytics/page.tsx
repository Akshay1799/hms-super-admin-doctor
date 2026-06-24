"use client";

import React from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useClinicalAnalytics } from "@/features/clinical/hooks/useClinical";
import { ClinicalAnalyticsChart } from "@/features/clinical/components/ClinicalAnalyticsChart";
import { DepartmentPerformanceChart } from "@/features/clinical/components/DepartmentPerformanceChart";
import { StatsCard } from "@/components/ui/stats-card";
import { Clock, TrendingUp, Users, Percent } from "lucide-react";

export default function ClinicalAnalyticsPage() {
  const { data: analytics, isLoading } = useClinicalAnalytics();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Clinical Oversight" }, { label: "Analytics" }]} />

      <div className="flex flex-col gap-6">
        <PageHeader
          title="Clinical Performance Analytics"
          description="Assess platform consultation loads, wait times, satisfaction ratings, and capacity trends."
        />

        {/* Analytics KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Avg Consultation Wait Time"
            value={`${analytics?.averageWaitTime || 0} mins`}
            icon={Clock}
            description="Target duration threshold is < 20 mins"
            trend={{ value: "4.5%", type: "down" }}
          />
          <StatsCard
            title="Platform Patient Satisfaction"
            value="4.6 / 5.0"
            icon={Users}
            description="Average rating across departments"
            trend={{ value: "1.2%", type: "up" }}
          />
          <StatsCard
            title="Surgical Success Index"
            value="92.4%"
            icon={Percent}
            description="Supervised procedure success rate"
          />
          <StatsCard
            title="Peak Occupancy Rate"
            value="82%"
            icon={TrendingUp}
            description="Highest recorded month (June)"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClinicalAnalyticsChart data={analytics?.occupancyTrend} isLoading={isLoading} />
          <DepartmentPerformanceChart data={analytics?.departmentPerformance} isLoading={isLoading} />
        </div>
      </div>
    </PageContainer>
  );
}
