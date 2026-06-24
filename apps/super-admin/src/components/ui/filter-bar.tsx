import React from "react";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdown {
  name: string;
  placeholder: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  dropdowns?: FilterDropdown[];
  searchSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  className?: string;
}

export function FilterBar({ dropdowns, searchSlot, actionSlot, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card border border-border p-4 rounded-[var(--radius-card)] shadow-sm",
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {searchSlot}
        {dropdowns && dropdowns.map((dropdown) => (
          <select
            key={dropdown.name}
            value={dropdown.selectedValue}
            onChange={(e) => dropdown.onChange(e.target.value)}
            className="h-10 rounded-[var(--radius-input)] border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[150px]"
          >
            <option value="">{dropdown.placeholder}</option>
            {dropdown.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>
      {actionSlot && <div className="flex items-center gap-3">{actionSlot}</div>}
    </div>
  );
}
