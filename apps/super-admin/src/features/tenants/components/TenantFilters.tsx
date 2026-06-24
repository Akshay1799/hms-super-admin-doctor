import React from "react";
import { FilterBar } from "@/components/ui/filter-bar";
import { SearchInput } from "@/components/ui/search-input";
import Link from "next/link";
import { Plus } from "lucide-react";

interface TenantFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  plan: string;
  onPlanChange: (val: string) => void;
}

export function TenantFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  plan,
  onPlanChange,
}: TenantFiltersProps) {
  const dropdowns = [
    {
      name: "status",
      placeholder: "All Statuses",
      selectedValue: status,
      onChange: onStatusChange,
      options: [
        { label: "Active", value: "Active" },
        { label: "Trial", value: "Trial" },
        { label: "Inactive", value: "Inactive" },
        { label: "Suspended", value: "Suspended" },
      ],
    },
    {
      name: "plan",
      placeholder: "All Plans",
      selectedValue: plan,
      onChange: onPlanChange,
      options: [
        { label: "Basic", value: "Basic" },
        { label: "Professional", value: "Professional" },
        { label: "Enterprise", value: "Enterprise" },
      ],
    },
  ];

  return (
    <FilterBar
      dropdowns={dropdowns}
      searchSlot={
        <SearchInput
          placeholder="Search by tenant name or code..."
          value={search}
          onSearch={onSearchChange}
        />
      }
      actionSlot={
        <Link
          href="/tenants/create"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 text-sm font-semibold text-white shadow hover:bg-primary/95 transition-colors cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Tenant
        </Link>
      }
    />
  );
}
