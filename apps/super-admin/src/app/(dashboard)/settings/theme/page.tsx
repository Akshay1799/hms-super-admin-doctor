"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "@/features/settings/components/SettingsCard";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "light", label: "Light", icon: Sun, description: "Clean white interface" },
  { id: "dark", label: "Dark", icon: Moon, description: "Easy on the eyes" },
  { id: "system", label: "System", icon: Monitor, description: "Follow OS preference" },
] as const;

const FONT_FAMILIES = ["Inter", "Roboto", "Outfit", "System Default"];
const BORDER_RADII = ["None", "Small", "Medium", "Large", "Full"];
const DENSITIES = ["Compact", "Default", "Relaxed"];

export default function ThemeSettingsPage() {
  const [selectedTheme, setSelectedTheme] = useState<string>("dark");

  return (
    <PageContainer>
      <PageHeader
        title="Theme Settings"
        description="Configure visual style, typography, and layout density"
      />
      <div className="mt-6 space-y-6 max-w-2xl">
        <SettingsCard title="Color Mode" description="Select the default color scheme for the platform">
          <div className="grid grid-cols-3 gap-4">
            {THEMES.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setSelectedTheme(id)}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                  selectedTheme === id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground/30"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  selectedTheme === id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Typography" description="Choose the font family for the interface">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Font Family</label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              {FONT_FAMILIES.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
        </SettingsCard>

        <SettingsCard title="Layout" description="Adjust spacing and border radius">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Border Radius</label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {BORDER_RADII.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">UI Density</label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {DENSITIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </SettingsCard>

        <div className="flex justify-end">
          <Button>Apply Theme Changes</Button>
        </div>
      </div>
    </PageContainer>
  );
}
