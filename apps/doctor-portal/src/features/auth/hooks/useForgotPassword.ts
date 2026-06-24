import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export function useForgotPassword() {
  return useMutation({
    mutationKey: ["auth", "forgot-password"],
    mutationFn: authService.forgotPassword,
  });
}
