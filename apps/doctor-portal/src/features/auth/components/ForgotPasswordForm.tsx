"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema, ForgotPasswordSchemaType } from "../schemas/auth.schema";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { FormField } from "@/components/ui/form-field";
import { ROUTES } from "@/constants/routes";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPassword();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordSchemaType) => {
    setErrorMessage(null);
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => {
        setIsSuccess(true);
      },
      onError: (error: any) => {
        setErrorMessage(error.message || "Something went wrong.");
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 w-full max-w-sm">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Email Sent</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If an account exists for that email address, we have sent instructions to reset your password.
          </p>
          <div className="pt-4 w-full">
            <Link
              href={ROUTES.login}
              className="inline-flex w-full h-10 items-center justify-center rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-sm">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Reset Password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your physician email to receive recovery instructions.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2.5 text-xs text-destructive font-medium animate-in fade-in duration-200">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Request Failed</p>
            <p className="mt-0.5 opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          id="email"
          label="Registered Email"
          placeholder="doctor@medichain.com"
          error={errors.email?.message}
          disabled={forgotPasswordMutation.isPending}
          {...register("email")}
        />

        <button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="w-full h-10 rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {forgotPasswordMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending Code...
            </>
          ) : (
            "Send Reset Instructions"
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href={ROUTES.login}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
