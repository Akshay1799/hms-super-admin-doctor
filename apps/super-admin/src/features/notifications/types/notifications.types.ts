// --- Core Notification ---
export type NotificationType = "info" | "success" | "warning" | "error" | "critical";
export type NotificationStatus = "unread" | "read" | "archived";
export type NotificationChannel = "email" | "sms" | "whatsapp" | "in-app";
export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  priority: NotificationPriority;
  status: NotificationStatus;
  isRead: boolean;
  createdAt: string;
}

// --- Templates ---
export type TemplateStatus = "active" | "inactive" | "draft";
export type TemplateCategory =
  | "appointment"
  | "billing"
  | "invoice"
  | "claims"
  | "user-management"
  | "security"
  | "password-reset"
  | "subscription"
  | "broadcast"
  | "custom";

export interface Template {
  id: string;
  name: string;
  channel: NotificationChannel;
  category: TemplateCategory;
  subject?: string;
  body: string;
  variables: string[];
  status: TemplateStatus;
  createdAt: string;
  updatedAt: string;
}

// --- Broadcasts ---
export type BroadcastStatus = "draft" | "scheduled" | "sent" | "failed" | "cancelled";
export type BroadcastAudience =
  | "all-tenants"
  | "specific-tenant"
  | "hospitals"
  | "doctors"
  | "staff"
  | "admins"
  | "custom-users";

export interface Broadcast {
  id: string;
  title: string;
  description: string;
  channel: NotificationChannel;
  audience: BroadcastAudience;
  message: string;
  status: BroadcastStatus;
  priority: NotificationPriority;
  scheduledAt: string;
  sentAt?: string;
  recipientCount: number;
}

// --- Delivery Logs ---
export type DeliveryStatus = "pending" | "delivered" | "failed" | "read" | "retrying";

export interface DeliveryLog {
  id: string;
  notificationId: string;
  recipient: string;
  recipientEmail: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  deliveredAt?: string;
  readAt?: string;
  retries: number;
  errorMessage?: string;
}

// --- Analytics ---
export interface NotificationAnalytics {
  totalSent: number;
  delivered: number;
  failed: number;
  readRate: number;
  openRate: number;
  ctr: number;
}

export interface ChannelDistribution {
  channel: string;
  sent: number;
  delivered: number;
  failed: number;
}

export interface DeliveryTrend {
  date: string;
  sent: number;
  delivered: number;
  failed: number;
}
