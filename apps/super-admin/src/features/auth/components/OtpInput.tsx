"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
}

export function OtpInput({ length = 6, onComplete, disabled }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const nextOtp = [...otp];
    nextOtp[index] = value.substring(value.length - 1);
    setOtp(nextOtp);

    // Focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = nextOtp.join("");
    if (fullCode.length === length) {
      onComplete(fullCode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, idx) => (
        <input
          key={idx}
          type="text"
          maxLength={1}
          value={digit}
          disabled={disabled}
          ref={(el) => {
            inputRefs.current[idx] = el as HTMLInputElement;
          }}
          onChange={(e) => handleChange(e.target.value, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className={cn(
            "h-12 w-12 rounded-[var(--radius-input)] border border-input bg-card text-center text-lg font-bold text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          )}
        />
      ))}
    </div>
  );
}
