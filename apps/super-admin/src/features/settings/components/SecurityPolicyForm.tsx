"use client";

import React, { useState, useEffect } from "react";
import { useSecurityPolicy, useUpdateSecurityPolicy } from "../hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function SecurityPolicyForm() {
  const { data: policy, isLoading } = useSecurityPolicy();
  const updatePolicy = useUpdateSecurityPolicy();

  const [requireUppercase, setRequireUppercase] = useState(false);
  const [requireSpecialChar, setRequireSpecialChar] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);

  useEffect(() => {
    if (policy) {
      setRequireUppercase(policy.requireUppercase);
      setRequireSpecialChar(policy.requireSpecialChar);
      setMfaRequired(policy.mfaRequired);
    }
  }, [policy]);

  if (isLoading) return <div className="h-64 animate-pulse bg-muted/30 rounded-xl" />;
  if (!policy) return null;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updatePolicy.mutate({
      passwordLength: Number(formData.get("passwordLength")),
      passwordExpiryDays: Number(formData.get("passwordExpiryDays")),
      sessionTimeout: Number(formData.get("sessionTimeout")),
      maxLoginAttempts: Number(formData.get("maxLoginAttempts")),
      requireUppercase,
      requireSpecialChar,
      mfaRequired,
    }, {
      onSuccess: () => {
        toast.success("Security policies saved successfully.");
      },
      onError: () => {
        toast.error("Failed to save security settings.");
      }
    });
  };

  return (
    <form className="space-y-8 max-w-2xl" onSubmit={onSubmit}>
      
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Password Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Minimum Length</label>
            <input type="number" name="passwordLength" defaultValue={policy.passwordLength} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Expiry Days</label>
            <input type="number" name="passwordExpiryDays" defaultValue={policy.passwordExpiryDays} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20">
          <div>
            <p className="text-sm font-medium text-foreground">Require Uppercase</p>
            <p className="text-xs text-muted-foreground">Passwords must contain at least one uppercase letter</p>
          </div>
          <Switch checked={requireUppercase} onCheckedChange={setRequireUppercase} />
        </div>
        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20">
          <div>
            <p className="text-sm font-medium text-foreground">Require Special Character</p>
            <p className="text-xs text-muted-foreground">Passwords must contain at least one special character</p>
          </div>
          <Switch checked={requireSpecialChar} onCheckedChange={setRequireSpecialChar} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Session Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Session Timeout (Minutes)</label>
            <input type="number" name="sessionTimeout" defaultValue={policy.sessionTimeout} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Max Login Attempts</label>
            <input type="number" name="maxLoginAttempts" defaultValue={policy.maxLoginAttempts} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20">
          <div>
            <p className="text-sm font-medium text-foreground">Require MFA</p>
            <p className="text-xs text-muted-foreground">Force all users to set up Multi-Factor Authentication</p>
          </div>
          <Switch checked={mfaRequired} onCheckedChange={setMfaRequired} />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={updatePolicy.isPending}>
          {updatePolicy.isPending ? "Saving..." : "Save Security Policy"}
        </Button>
      </div>
    </form>
  );
}
