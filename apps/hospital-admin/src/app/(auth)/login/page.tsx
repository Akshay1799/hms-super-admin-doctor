"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/lib/api-client";
import { AlertCircle, Loader2, KeyRound, Mail, Eye, EyeOff } from "lucide-react";
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
      const allowedRoles = ["SUPER_ADMIN", "TENANT_ADMIN", "HOSPITAL_ADMIN", "DEPT_ADMIN", "RECEPTIONIST", "NURSE", "STAFF"];

      if (!allowedRoles.includes(payload.user.role)) {
        setIsPending(false);
        setErrorMessage("Access denied. You do not have administrator credentials.");
        return;
      }

      loginStore(payload.user);
      toast.success("Welcome to Administrator Command Center!");
      router.push("/dashboard");
    } catch (err: any) {
      setIsPending(false);
      setErrorMessage(err.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* Left side: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F8FAFC] text-slate-900 relative items-center justify-center p-12 overflow-hidden border-r border-slate-200">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white font-extrabold text-2xl shadow-lg shadow-primary/20">
            A
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              HMS Admin Console
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Hospital operations management, staffing configurations, department allocations, and clinical resource coordination workspace.
            </p>
          </div>
          <div className="border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-500 font-semibold">Authorized Personnel Only:</p>
            <p className="text-xs text-slate-600 mt-1">
              Sign in with your hospital or department administrator credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="space-y-6 w-full max-w-sm">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign In</h2>
            <p className="text-sm text-muted-foreground">
              Enter your administration credentials below.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2.5 text-xs text-destructive font-medium animate-in fade-in duration-200">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Failed</p>
                <p className="mt-0.5 opacity-90">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@hospital.com"
                  disabled={isPending}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                  {...register("email")}
                />
              </div>
              {errors.email?.message && (
                <p className="text-xs text-destructive font-medium mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isPending}
                  className="w-full h-10 pl-10 pr-10 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer select-none transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password?.message && (
                <p className="text-xs text-destructive font-medium mt-1">{errors.password.message}</p>
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
                  Authenticating...
                </>
              ) : (
                "Access Admin Console"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
