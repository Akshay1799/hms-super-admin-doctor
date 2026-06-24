import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export function SearchInput({ className, onChange, onSearch, ...props }: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        onChange={handleChange}
        className={cn(
          "h-10 w-full rounded-[var(--radius-input)] border border-input bg-card pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary",
          className
        )}
        {...props}
      />
    </div>
  );
}
