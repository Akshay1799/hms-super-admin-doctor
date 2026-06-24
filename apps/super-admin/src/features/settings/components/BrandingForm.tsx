"use client";

import React from "react";
import { useBranding } from "../hooks/use-settings";
import { Button } from "@/components/ui/button";

export function BrandingForm() {
  const { data: branding, isLoading } = useBranding();

  if (isLoading) return <div className="h-64 animate-pulse bg-muted/30 rounded-xl" />;
  if (!branding) return null;

  return (
    <form className="space-y-6 max-w-2xl" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Primary Color</label>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded border border-border" style={{ backgroundColor: branding.primaryColor }} />
            <input type="text" defaultValue={branding.primaryColor} className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Secondary Color</label>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded border border-border" style={{ backgroundColor: branding.secondaryColor }} />
            <input type="text" defaultValue={branding.secondaryColor} className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tagline</label>
        <input type="text" defaultValue={branding.tagline} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Footer Text</label>
        <input type="text" defaultValue={branding.footerText} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Platform Logo</label>
        <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/10">
          <p className="text-sm font-medium text-foreground mb-1">Click to upload new logo</p>
          <p className="text-xs text-muted-foreground">PNG, JPG or SVG (Max 2MB)</p>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit">Save Branding</Button>
      </div>
    </form>
  );
}
