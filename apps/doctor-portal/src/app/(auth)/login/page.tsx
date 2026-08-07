"use client";

import React from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      {/* Left side: Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F8FAFC] text-slate-900 relative items-center justify-center p-12 overflow-hidden border-r border-slate-200">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/5 blur-3xl" />
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-2xl shadow-lg shadow-emerald-600/20">
            D
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              HMS Doctor Workspace
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Clinical portal for physicians, enabling comprehensive patient care tracking, diagnostic tools, and care coordination.
            </p>
          </div>
          
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <LoginForm />
      </div>
    </main>
  );
}
