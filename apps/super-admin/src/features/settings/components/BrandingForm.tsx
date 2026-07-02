"use client";

import React, { useState, useRef, useEffect } from "react";
import { useBranding, useUpdateBranding } from "../hooks/use-settings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BrandingForm() {
  const { data: branding, isLoading } = useBranding();
  const updateBranding = useUpdateBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (branding?.primaryColor) {
      // Set initial colors or values if needed
    }
  }, [branding]);

  if (isLoading) return <div className="h-64 animate-pulse bg-muted/30 rounded-xl" />;
  if (!branding) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large. Max size is 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        toast.success("Logo uploaded successfully (local preview updated).");
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateBranding.mutate({
      primaryColor: formData.get("primaryColor") as string,
      secondaryColor: formData.get("secondaryColor") as string,
      tagline: formData.get("tagline") as string,
      footerText: formData.get("footerText") as string,
    }, {
      onSuccess: () => {
        toast.success("Branding updated successfully.");
      },
      onError: () => {
        toast.error("Failed to save branding configurations.");
      }
    });
  };

  return (
    <form className="space-y-6 max-w-2xl" onSubmit={onSubmit}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        className="hidden"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Primary Color</label>
          <div className="flex items-center gap-3">
            <input name="primaryColor" type="color" defaultValue={branding.primaryColor} className="h-10 w-10 rounded border border-border bg-transparent p-0 cursor-pointer" />
            <input type="text" name="primaryColorText" defaultValue={branding.primaryColor} className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" readOnly />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Secondary Color</label>
          <div className="flex items-center gap-3">
            <input name="secondaryColor" type="color" defaultValue={branding.secondaryColor} className="h-10 w-10 rounded border border-border bg-transparent p-0 cursor-pointer" />
            <input type="text" name="secondaryColorText" defaultValue={branding.secondaryColor} className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" readOnly />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tagline</label>
        <input type="text" name="tagline" defaultValue={branding.tagline} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Footer Text</label>
        <input type="text" name="footerText" defaultValue={branding.footerText} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Platform Logo</label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/20 hover:border-primary/50 transition-all cursor-pointer"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Uploaded logo preview" className="max-h-16 object-contain mb-2" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-xl mb-2">🖼️</div>
          )}
          <p className="text-sm font-medium text-foreground mb-1">Click to upload new logo</p>
          <p className="text-xs text-muted-foreground">PNG, JPG or SVG (Max 2MB)</p>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={updateBranding.isPending}>
          {updateBranding.isPending ? "Saving..." : "Save Branding"}
        </Button>
      </div>
    </form>
  );
}
