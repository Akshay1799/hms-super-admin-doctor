import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function useLogout() {
  const logoutStore = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: authService.logout,
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
    },
  });
}
