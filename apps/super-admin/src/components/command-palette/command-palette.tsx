"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Building, Building2, User, FileText, Settings, ShieldAlert } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: any;
  href: string;
}

const mockCommands: CommandItem[] = [
  { id: "cmd-1", label: "View Tenants Subscription List", category: "Tenants", icon: Building2, href: ROUTES.tenants },
  { id: "cmd-2", label: "Manage Hospitals & Branches", category: "Hospitals", icon: Building, href: ROUTES.hospitals },
  { id: "cmd-3", label: "Access Control, Roles & Permissions", category: "Users", icon: ShieldAlert, href: ROUTES.users },
  { id: "cmd-4", label: "Update Platform Configuration Settings", category: "Settings", icon: Settings, href: ROUTES.settings },
  { id: "cmd-5", label: "Check System Performance & Health", category: "Actions", icon: FileText, href: ROUTES.dashboard },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Monitor toggle trigger (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Set focus on input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setSelectedIndex(0);
      setSearchQuery("");
    }
  }, [isOpen]);

  // Click away listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const filteredCommands = mockCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const activeCmd = filteredCommands[selectedIndex];
      if (activeCmd) {
        router.push(activeCmd.href);
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 backdrop-blur-xs pt-[15vh] animate-in fade-in duration-150">
      <div
        ref={containerRef}
        className="w-full max-w-xl rounded-[var(--radius-dialog)] bg-card border border-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Search Input field */}
        <div className="relative border-b border-border flex items-center px-4">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search categories..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="h-14 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none"
          />
        </div>

        {/* Results Container */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found for &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      router.push(cmd.href);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-input)] text-left transition-colors cursor-pointer",
                      isSelected ? "bg-primary text-white" : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4.5 w-4.5 shrink-0", isSelected ? "text-white" : "text-muted-foreground")} />
                      <span className="text-sm font-semibold">{cmd.label}</span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] uppercase font-bold tracking-wide border rounded-md px-1.5 py-0.5",
                        isSelected ? "border-white/20 bg-white/10" : "border-border bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {cmd.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Helper footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground bg-muted/30">
          <div className="flex gap-2">
            <span>↑↓ Navigation</span>
            <span>↵ Select</span>
          </div>
          <span>ESC close</span>
        </div>
      </div>
    </div>
  );
}
