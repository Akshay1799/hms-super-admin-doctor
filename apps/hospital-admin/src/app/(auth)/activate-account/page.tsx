"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { apiClient } from "@/lib/api-client";

function ActivateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("This activation link is missing its token. Please request a new invitation.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/auth/activate", { token, password });
      setIsComplete(true);
      window.setTimeout(() => router.replace("/login"), 1500);
    } catch (err: any) {
      setError(err.message || "Unable to activate this account. Please request a new invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <section className="w-full max-w-sm space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h1 className="text-2xl font-bold text-foreground">Account activated</h1>
        <p className="text-sm text-muted-foreground">Your password is set. Redirecting to sign in…</p>
      </section>
    );
  }

  if (!token) {
    return (
      <section className="w-full max-w-sm space-y-4 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Invalid activation link</h1>
        <p className="text-sm text-muted-foreground">This link is missing its activation token. Please request a new invitation.</p>
        <button onClick={() => router.replace("/login")} className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white">
          Back to sign in
        </button>
      </section>
    );
  }

  return (
    <section className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Activate your account</h1>
        <p className="text-sm text-muted-foreground">Set a password to access the Hospital Admin portal.</p>
      </div>

      {error && <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          Password
          <span className="relative block">
            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required disabled={isSubmitting} className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
          </span>
        </label>
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          Confirm password
          <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required disabled={isSubmitting} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
        </label>
        <button type="submit" disabled={isSubmitting} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white disabled:opacity-50">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Activating…" : "Activate account"}
        </button>
      </form>
    </section>
  );
}

export default function ActivateAccountPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
        <ActivateAccountForm />
      </Suspense>
    </main>
  );
}
