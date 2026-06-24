"use client";

import React, { Suspense } from "react";
import { ActivateForm } from "@/features/auth/components/ActivateForm";
import { Loader2 } from "lucide-react";

function ActivatePageContent() {
  return (
    <main className="min-h-screen flex">
      {/* Left side: Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-radial from-slate-900 via-zinc-950 to-black text-white relative items-center justify-center p-12 overflow-hidden border-r border-zinc-800">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-2xl shadow-lg shadow-emerald-600/20">
            D
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Welcome to HMS
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Your clinician account has been pre-registered by your hospital administrator. Activate your workspace credentials to begin your practice.
            </p>
          </div>
          
          <div className="border-t border-zinc-800 pt-6">
            <p className="text-xs text-zinc-500 font-semibold">Account Activation Note:</p>
            <p className="text-xs text-zinc-400 mt-1">
              You must set a password with at least 8 characters. You can pre-fill the token via the URL query <span className="font-mono text-emerald-400">?token=mock-token</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Activation Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <ActivateForm />
      </div>
    </main>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ActivatePageContent />
    </Suspense>
  );
}
