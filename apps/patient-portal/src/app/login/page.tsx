"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/lib/api-client";
import { AlertCircle, Loader2, KeyRound, Mail, Activity, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage(null);
    setIsPending(true);

    try {
      const res = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const payload = res.data.data;

      if (payload.user.role !== "PATIENT" && payload.user.role !== "SUPER_ADMIN") {
        setIsPending(false);
        setErrorMessage("Access denied. Please login with a patient account.");
        return;
      }

      loginStore(payload.user);
      toast.success("Welcome to your Health Portal!");
      router.push("/dashboard");
    } catch (err: any) {
      setIsPending(false);
      setErrorMessage(err.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex bg-background text-foreground transition-colors duration-200">
      {/* Left side: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F8FAFC] text-slate-900 relative items-center justify-center p-12 overflow-hidden border-r border-slate-200">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-extrabold text-2xl shadow-lg shadow-primary/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              MediChain Patient Portal
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your personalized medical registry. Access your vitals dashboard, review active medications, download invoices, and connect with your attending doctors.
            </p>
          </div>
          <div className="border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-500 font-semibold">Your Health Records, Secured:</p>
            <p className="text-xs text-slate-600 mt-1">
              End-to-end data encryption and strict HIPAA-compliant audit checks.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-extrabold text-lg mb-2">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Sign In to Health Portal</h2>
            <p className="text-sm text-muted-foreground">Enter your patient credentials below</p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2.5 text-xs text-destructive font-semibold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="patient@medichain.com"
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  {...register("email")}
                  disabled={isPending}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-10 pl-10 pr-10 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  {...register("password")}
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer select-none transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-destructive">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-10 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
