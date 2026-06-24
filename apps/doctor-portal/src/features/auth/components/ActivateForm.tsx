"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { activateAccountSchema, ActivateAccountSchemaType } from "../schemas/auth.schema";
import { useActivateAccount } from "../hooks/useActivateAccount";
import { FormField } from "@/components/ui/form-field";
import { ROUTES } from "@/constants/routes";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activateMutation = useActivateAccount();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ActivateAccountSchemaType>({
    resolver: zodResolver(activateAccountSchema),
    defaultValues: {
      token: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setValue("token", token);
    }
  }, [searchParams, setValue]);

  const onSubmit = (data: ActivateAccountSchemaType) => {
    setErrorMessage(null);
    activateMutation.mutate(data, {
      onSuccess: () => {
        setIsSuccess(true);
        toast.success("Account activated successfully! You can now log in.");
        setTimeout(() => {
          router.push(ROUTES.login);
        }, 1500);
      },
      onError: (error: any) => {
        setErrorMessage(error.message || "Failed to activate account.");
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 w-full max-w-sm text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success mb-2">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Activation Complete</h2>
        <p className="text-sm text-muted-foreground">
          Your physician account has been successfully set up. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-sm">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Activate Your Account</h2>
        <p className="text-sm text-muted-foreground">
          Complete your registration by choosing a password.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2.5 text-xs text-destructive font-medium animate-in fade-in duration-200">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Activation Failed</p>
            <p className="mt-0.5 opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          id="token"
          label="Activation Code / Token"
          placeholder="Enter the code from your invitation email"
          error={errors.token?.message}
          disabled={activateMutation.isPending}
          {...register("token")}
        />

        <FormField
          id="password"
          type="password"
          label="Choose Password"
          placeholder="••••••••"
          error={errors.password?.message}
          disabled={activateMutation.isPending}
          {...register("password")}
        />

        <FormField
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          disabled={activateMutation.isPending}
          {...register("confirmPassword")}
        />

        <button
          type="submit"
          disabled={activateMutation.isPending}
          className="w-full h-10 rounded-[var(--radius-button)] bg-primary text-white text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {activateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Activating Account...
            </>
          ) : (
            "Complete Account Setup"
          )}
        </button>
      </form>
    </div>
  );
}
