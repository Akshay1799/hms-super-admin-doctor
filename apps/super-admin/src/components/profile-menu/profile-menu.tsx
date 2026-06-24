"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "@/components/ui/avatar";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { User as UserIcon, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProfileMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully.");
        router.push(ROUTES.login);
      },
    });
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full focus:outline-hidden cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Avatar fallback={user.name} size="sm" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-xl border border-border bg-card shadow-lg ring-1 ring-black/5 p-1 animate-in fade-in zoom-in-95 duration-100 z-30">
          <div className="px-3.5 py-3 border-b border-border text-left">
            <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
            <span className="inline-block mt-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {user.role}
            </span>
          </div>

          <div className="py-1">
            <Link
              href={ROUTES.settings}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              <UserIcon className="h-4 w-4 shrink-0" /> My Profile
            </Link>
            <Link
              href={ROUTES.settings}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4 shrink-0" /> Settings
            </Link>
          </div>

          <div className="border-t border-border py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
