import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export function useResetPassword() {
  return useMutation({
    mutationKey: ["auth", "reset-password"],
    mutationFn: authService.resetPassword,
  });
}
