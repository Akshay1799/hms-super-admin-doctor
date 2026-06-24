"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OtpInput } from "@/features/auth/components/OtpInput";
import { useVerifyOtp } from "@/features/auth/hooks/useVerifyOtp";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import { Loader2 } from "lucide-react";

export default function MfaPage() {
  const router = useRouter();
  const verifyOtpMutation = useVerifyOtp();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = (otp: string) => {
    verifyOtpMutation.mutate(
      { otp },
      {
        onSuccess: () => {
          toast.success("MFA verification successful.");
          router.push(ROUTES.dashboard);
        },
        onError: (err: any) => {
          toast.error(err.message || "Invalid OTP code.");
        },
      }
    );
  };

  const handleResend = () => {
    setCountdown(60);
    toast.info("A new OTP has been dispatched to your device.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-zinc-950 to-black px-4 text-white">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="space-y-1.5 text-center">
          <h2 className="text-xl font-bold tracking-tight">Security Verification</h2>
          <p className="text-xs text-zinc-400">
            Enter the 6-digit OTP code sent to your authenticator device (Use: <span className="font-mono font-semibold text-primary">123456</span>)
          </p>
        </div>

        <div className="space-y-4">
          <OtpInput
            disabled={verifyOtpMutation.isPending}
            onComplete={handleVerify}
          />

          <div className="text-center pt-2">
            {countdown > 0 ? (
              <p className="text-xs text-zinc-500">
                Resend code in <span className="font-mono font-semibold text-primary">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Resend OTP Verification Code
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
