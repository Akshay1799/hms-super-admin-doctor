import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";

export function useCurrentUser() {
  const { user, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      if (!isAuthenticated || !user) return null;
      return user;
    },
    enabled: isAuthenticated,
  });
}
