"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-zinc-950 to-black px-4 text-white">
      <div className="text-center space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10 text-destructive mb-2">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">403 — Access Forbidden</h1>
          <p className="text-sm text-zinc-400">
            Your authorization role is insufficient to request this protected governance resource.
          </p>
        </div>
        <div>
          <button
            onClick={() => router.push(ROUTES.dashboard)}
            className="h-10 px-6 rounded-[var(--radius-button)] bg-primary text-white font-semibold text-sm hover:bg-primary/95 transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
