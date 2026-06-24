"use client";

import React, { useState } from "react";
import { FilterBar } from "@/components/ui/filter-bar";
import { SearchInput } from "@/components/ui/search-input";

interface DashboardFiltersProps {
  onFiltersChange?: (filters: any) => void;
}

export function DashboardFilters({ onFiltersChange }: DashboardFiltersProps) {
  const [dateRange, setDateRange] = useState("last-30");
  const [status, setStatus] = useState("all");
  const [tenant, setTenant] = useState("");

  const triggerChange = (updated: any) => {
    if (onFiltersChange) {
      onFiltersChange({
        dateRange,
        status,
        tenant,
        ...updated,
      });
    }
  };

  return (
    <FilterBar
      searchSlot={
        <SearchInput
          placeholder="Filter by Tenant name..."
          value={tenant}
          onSearch={(val) => {
            setTenant(val);
            triggerChange({ tenant: val });
          }}
        />
      }
      dropdowns={[
        {
          name: "dateRange",
          placeholder: "Select Date Range",
          selectedValue: dateRange,
          onChange: (val) => {
            setDateRange(val);
            triggerChange({ dateRange: val });
          },
          options: [
            { label: "Today", value: "today" },
            { label: "Last 7 Days", value: "last-7" },
            { label: "Last 30 Days", value: "last-30" },
            { label: "Last 90 Days", value: "last-90" },
          ],
        },
        {
          name: "status",
          placeholder: "Status Mode",
          selectedValue: status,
          onChange: (val) => {
            setStatus(val);
            triggerChange({ status: val });
          },
          options: [
            { label: "All Statuses", value: "all" },
            { label: "Active Only", value: "active" },
            { label: "Suspended Only", value: "suspended" },
            { label: "Pending Only", value: "pending" },
          ],
        },
      ]}
    />
  );
}
