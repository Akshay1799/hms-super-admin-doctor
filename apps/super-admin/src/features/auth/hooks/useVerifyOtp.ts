import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export function useVerifyOtp() {
  return useMutation({
    mutationKey: ["auth", "mfa"],
    mutationFn: authService.verifyOtp,
  });
}
