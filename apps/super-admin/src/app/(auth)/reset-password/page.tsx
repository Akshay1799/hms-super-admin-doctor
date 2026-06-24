"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormField } from "@/components/ui/form-field";
import { ROUTES } from "@/constants/routes";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Password reset completed successfully.");
    router.push(ROUTES.login);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-zinc-950 to-black px-4 text-white">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="space-y-1.5 text-center">
          <h2 className="text-xl font-bold tracking-tight">Configure New Password</h2>
          <p className="text-xs text-zinc-400">Establish a new credential password for your governance profile</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            id="password"
            type="password"
            label="New Password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={isSubmitting}
            className="bg-zinc-950/50 border-zinc-800 text-white"
            {...register("password")}
          />

          <FormField
            id="confirmPassword"
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
            className="bg-zinc-950/50 border-zinc-800 text-white"
            {...register("confirmPassword")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
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
