"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { FormField } from "@/components/ui/form-field";
import { ROUTES } from "@/constants/routes";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success(`Reset link dispatched to ${data.email}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-zinc-950 to-black px-4 text-white">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="space-y-1.5 text-center">
          <h2 className="text-xl font-bold tracking-tight">Recover Password</h2>
          <p className="text-xs text-zinc-400">Enter your email to dispatch a verification recovery link</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            id="email"
            label="Email Address"
            placeholder="admin@platform.hms"
            error={errors.email?.message}
            disabled={isSubmitting}
            className="bg-zinc-950/50 border-zinc-800 text-white"
            {...register("email")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
          >
            {isSubmitting ? "Sending..." : "Dispatch Password Reset Link"}
          </button>
        </form>

        <div className="text-center">
          <Link
            href={ROUTES.login}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
