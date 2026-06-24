"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { activateAccountSchema, ActivateAccountSchemaType } from "../schemas/auth.schema";
import { useActivateAccount } from "../hooks/useActivateAccount";
import { FormField } from "@/components/ui/form-field";
import { ROUTES } from "@/constants/routes";
import { AlertCircle, CheckCircle, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Base64 Invitation Token Decoder (Cross-Origin compatible)
// ---------------------------------------------------------------------------
const ACTIVATED_TOKENS_KEY = "hms_activated_tokens";

interface DoctorInvitation {
  token: string;
  doctorId: string;
  name: string;
  email: string;
  used: boolean;
  createdAt: string;
}

function decodeToken(token: string): any {
  try {
    const str = typeof window !== "undefined" ? atob(token) : Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function isTokenUsed(token: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(ACTIVATED_TOKENS_KEY);
    const usedList: string[] = raw ? JSON.parse(raw) : [];
    return usedList.includes(token);
  } catch {
    return false;
  }
}

function getInvitation(token: string): DoctorInvitation | null {
  const payload = decodeToken(token);
  if (!payload || !payload.doctorId || !payload.name || !payload.email) {
    return null;
  }
  return {
    token,
    doctorId: payload.doctorId,
    name: payload.name,
    email: payload.email,
    used: isTokenUsed(token),
    createdAt: payload.createdAt || new Date().toISOString(),
  };
}

function markUsed(token: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ACTIVATED_TOKENS_KEY);
    const usedList: string[] = raw ? JSON.parse(raw) : [];
    if (!usedList.includes(token)) {
      usedList.push(token);
      localStorage.setItem(ACTIVATED_TOKENS_KEY, JSON.stringify(usedList));
    }
  } catch {}
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activateMutation = useActivateAccount();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [invitation, setInvitation] = useState<DoctorInvitation | null>(null);
  const [tokenStatus, setTokenStatus] = useState<"loading" | "valid" | "invalid" | "used">("loading");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ActivateAccountSchemaType>({
    resolver: zodResolver(activateAccountSchema),
    defaultValues: { token: "", password: "", confirmPassword: "" },
  });

  // On mount: read token from URL, look up invitation
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setTokenStatus("invalid");
      return;
    }
    setValue("token", token);

    // Small delay to let localStorage sync (in case both apps are open)
    const timer = setTimeout(() => {
      const inv = getInvitation(token);
      if (!inv) {
        setTokenStatus("invalid");
      } else if (inv.used) {
        setTokenStatus("used");
      } else {
        setInvitation(inv);
        setTokenStatus("valid");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [searchParams, setValue]);

  const onSubmit = (data: ActivateAccountSchemaType) => {
    setErrorMessage(null);
    activateMutation.mutate(data, {
      onSuccess: () => {
        // Mark the invitation as used so the link cannot be reused
        const token = searchParams.get("token");
        if (token) markUsed(token);
        setIsSuccess(true);
        toast.success("Account activated successfully! You can now log in.");
        setTimeout(() => router.push(ROUTES.login), 1500);
      },
      onError: (error: any) => {
        setErrorMessage(error.message || "Failed to activate account.");
      },
    });
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (tokenStatus === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying invitation link...</p>
      </div>
    );
  }

  // ── Invalid token ──────────────────────────────────────────────────────────
  if (tokenStatus === "invalid") {
    return (
      <div className="space-y-4 w-full max-w-sm text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive mb-2">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Invalid Invitation Link</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This activation link is invalid or has expired. Please contact your hospital administrator to generate a new link.
        </p>
        <button
          onClick={() => router.push(ROUTES.login)}
          className="w-full h-10 rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    );
  }

  // ── Already used ───────────────────────────────────────────────────────────
  if (tokenStatus === "used") {
    return (
      <div className="space-y-4 w-full max-w-sm text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning mb-2">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Link Already Used</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This invitation link has already been activated. If you need help accessing your account, please contact your administrator.
        </p>
        <button
          onClick={() => router.push(ROUTES.login)}
          className="w-full h-10 rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="space-y-4 w-full max-w-sm text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 mb-2">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Activation Complete</h2>
        <p className="text-sm text-muted-foreground">
          Your physician account has been successfully set up. Redirecting to login...
        </p>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 w-full max-w-sm">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Activate Your Account</h2>
        <p className="text-sm text-muted-foreground">
          Welcome, <span className="font-semibold text-foreground">{invitation?.name}</span>. Set a password to complete your account setup.
        </p>
      </div>

      {/* Pre-filled doctor info banner */}
      {invitation && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 space-y-1">
          <p className="text-xs font-semibold text-foreground">Registered for:</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{invitation.name}</span> &mdash; {invitation.email}
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2.5 text-xs text-destructive font-medium animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Activation Failed</p>
            <p className="mt-0.5 opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden token field — auto-populated from URL */}
        <input type="hidden" {...register("token")} />

        <FormField
          id="password"
          type="password"
          label="Choose Password"
          placeholder="••••••••"
          error={errors.password?.message}
          disabled={activateMutation.isPending}
          {...register("password")}
        />

        <FormField
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          disabled={activateMutation.isPending}
          {...register("confirmPassword")}
        />

        <button
          type="submit"
          disabled={activateMutation.isPending}
          className="w-full h-10 rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {activateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Activating Account...
            </>
          ) : (
            "Complete Account Setup"
          )}
        </button>
      </form>
    </div>
  );
}
