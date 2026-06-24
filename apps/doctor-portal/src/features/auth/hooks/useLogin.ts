import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function useLogin() {
  const loginStore = useAuthStore((state) => state.login);
  
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: authService.login,
    onSuccess: (data) => {
      loginStore(data.user);
    },
  });
}
