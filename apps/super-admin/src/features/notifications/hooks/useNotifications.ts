import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notifications.service';

// --- Notifications ---
export function useNotifications() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['notifications'], queryFn: notificationService.getNotifications });
  const markReadMutation = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: (data) => queryClient.setQueryData(['notifications'], data),
  });
  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: (data) => queryClient.setQueryData(['notifications'], data),
  });
  const clearNotificationsMutation = useMutation({
    mutationFn: notificationService.clearNotifications,
    onSuccess: (data) => queryClient.setQueryData(['notifications'], data),
  });
  const unreadCount = query.data?.filter(n => !n.isRead).length || 0;
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

// --- Templates ---
export function useTemplates() {
  return useQuery({ queryKey: ['templates'], queryFn: notificationService.getTemplates });
}

export function useTemplateById(id: string) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => notificationService.getTemplateById(id),
    enabled: !!id,
  });
}

// --- Broadcasts ---
export function useBroadcasts() {
  return useQuery({ queryKey: ['broadcasts'], queryFn: notificationService.getBroadcasts });
}

// --- Delivery Logs ---
export function useDeliveryLogs() {
  return useQuery({ queryKey: ['delivery-logs'], queryFn: notificationService.getDeliveryLogs });
}

// --- Analytics ---
export function useNotificationAnalytics() {
  return useQuery({ queryKey: ['notification-analytics'], queryFn: notificationService.getAnalytics });
}

export function useChannelDistribution() {
  return useQuery({ queryKey: ['notification-analytics', 'channels'], queryFn: notificationService.getChannelDistribution });
}

export function useDeliveryTrend() {
  return useQuery({ queryKey: ['notification-analytics', 'trend'], queryFn: notificationService.getDeliveryTrend });
}
