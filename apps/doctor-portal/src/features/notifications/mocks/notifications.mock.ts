export interface DoctorNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "critical";
  isRead: boolean;
  createdAt: string;
}

export const MOCK_NOTIFICATIONS: DoctorNotification[] = [
  {
    id: "notif-1",
    title: "Critical Lab Value",
    message: "Patient John Doe (ICU-3) Potassium level is 6.2 mEq/L (Critical High).",
    type: "critical",
    isRead: false,
    createdAt: "10 mins ago",
  },
  {
    id: "notif-2",
    title: "New Admission",
    message: "Patient Sarah Connor has been admitted to Ward 4-B, Bed 12 assigned under your care.",
    type: "warning",
    isRead: false,
    createdAt: "35 mins ago",
  },
  {
    id: "notif-3",
    title: "Prescription Signed",
    message: "Prescription for Bruce Wayne was successfully digitally signed and queued for pharmacy.",
    type: "success",
    isRead: true,
    createdAt: "2 hours ago",
  },
  {
    id: "notif-4",
    title: "Follow-up Scheduled",
    message: "Clark Kent scheduled a Cardiology follow-up for tomorrow at 09:30 AM.",
    type: "info",
    isRead: true,
    createdAt: "4 hours ago",
  },
];
