import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  as?: "input" | "textarea" | "select";
  children?: React.ReactNode;
}

export const FormField = forwardRef<any, FormFieldProps>(
  ({ label, error, helperText, as = "input", children, className, id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const inputClassName = cn(
      "w-full rounded-[var(--radius-input)] border border-input bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-muted/50",
      as !== "textarea" ? "h-10" : "min-h-[80px] py-2",
      isPassword && "pr-10",
      error && "border-destructive focus:border-destructive focus:ring-destructive",
      className
    );

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-foreground tracking-wide uppercase select-none">
            {label}
          </label>
        )}
        
        {as === "input" && (
          <div className="relative w-full">
            <input
              ref={ref}
              id={id}
              type={inputType}
              className={inputClassName}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer select-none transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}

        {as === "textarea" && (
          <textarea
            ref={ref}
            id={id}
            className={inputClassName}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        )}

        {as === "select" && (
          <select
            ref={ref}
            id={id}
            className={inputClassName}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {children}
          </select>
        )}

        {error && <span className="text-xs text-destructive font-medium mt-0.5">{error}</span>}
        {helperText && !error && <span className="text-xs text-muted-foreground mt-0.5">{helperText}</span>}
      </div>
    );
  }
);

FormField.displayName = "FormField";
