"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema, LoginSchemaType } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useLogin";
import { FormField } from "@/components/ui/form-field";
import { ROUTES } from "@/constants/routes";
import { AlertCircle, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginSchemaType) => {
    setErrorMessage(null);
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.push(ROUTES.dashboard);
      },
      onError: (error: any) => {
        setErrorMessage(error.message || "Something went wrong.");
      },
    });
  };

  return (
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
        <FormField
          id="email"
          label="Email Address"
          placeholder="admin@medichain.com"
          error={errors.email?.message}
          disabled={loginMutation.isPending}
          {...register("email")}
        />

        <div className="space-y-1.5">
          <FormField
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={loginMutation.isPending}
            {...register("password")}
          />
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground select-none cursor-pointer">
              <input
                type="checkbox"
                disabled={loginMutation.isPending}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                {...register("rememberMe")}
              />
              Remember Me
            </label>
            <Link
              href={ROUTES.forgotPassword}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full h-10 rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            "Access Command Center"
          )}
        </button>
      </form>
    </div>
  );
}
