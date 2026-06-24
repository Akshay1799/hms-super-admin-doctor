import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export function useActivateAccount() {
  return useMutation({
    mutationKey: ["auth", "activate-account"],
    mutationFn: authService.activateAccount,
  });
}
