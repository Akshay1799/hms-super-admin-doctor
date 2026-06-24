import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notifications.service";

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: (data) => {
      queryClient.setQueryData(["notifications"], data);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: (data) => {
      queryClient.setQueryData(["notifications"], data);
    },
  });

  const clearNotificationsMutation = useMutation({
    mutationFn: notificationService.clearNotifications,
    onSuccess: (data) => {
      queryClient.setQueryData(["notifications"], data);
    },
  });

  const unreadCount = query.data?.filter((n) => !n.isRead).length || 0;

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    unreadCount,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    clearAll: clearNotificationsMutation.mutate,
  };
}
