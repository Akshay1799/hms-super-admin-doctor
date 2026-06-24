import {
  LayoutDashboard,
  Building2,
  Building,
  Users2,
  Settings,
  Stethoscope,
  Users,
  Activity,
  Bed,
  Calendar,
  ClipboardList,
  DollarSign,
  FileText,
  CreditCard,
  Repeat,
  ShieldAlert,
  PieChart,
  Receipt,
  Bell,
  LayoutTemplate,
  Megaphone,
  MailCheck,
  BarChart3,
  Plug,
  ShieldCheck,
  HeartPulse,
  Webhook,
  Mail,
  MessageSquare,
  MessageCircle,
  HardDrive,
  KeyRound,
  ActivitySquare,
  Network,
  ListTree,
  Database,
  Bug,
  LayoutList,
  Clock,
  Server,
  Shield,
  Fingerprint,
  Scale,
  Download,
  Palette,
  SunMoon,
  Globe,
  ToggleLeft,
  Archive,
  Cpu,
} from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

export interface SidebarGroup {
  groupName: string;
  items: SidebarItem[];
}

export const sidebarConfig: SidebarGroup[] = [
  {
    groupName: "Core",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    groupName: "Tenant Management",
    items: [
      { label: "Tenants", href: "/tenants", icon: Building2 },
    ],
  },
  {
    groupName: "Hospital Management",
    items: [
      { label: "Hospitals", href: "/hospitals", icon: Building },
    ],
  },
  {
    groupName: "Clinical Oversight",
    items: [
      { label: "Clinical Analytics", href: "/clinical-analytics", icon: Activity },
      { label: "Bed Occupancy", href: "/bed-occupancy", icon: Bed },
      { label: "Doctors Registry", href: "/doctors", icon: Stethoscope },
      { label: "Patients Supervision", href: "/patients", icon: Users },
      { label: "Nurses Duty Roster", href: "/nurses", icon: ClipboardList },
      { label: "Staff Directory", href: "/staff", icon: Users2 },
      { label: "Appointments Tracker", href: "/appointments", icon: Calendar },
      { label: "Admissions Log", href: "/admissions", icon: ClipboardList },
    ],
  },
  {
    groupName: "Billing & Revenue",
    items: [
      { label: "Revenue Overview", href: "/revenue", icon: PieChart },
      { label: "Invoices", href: "/invoices", icon: Receipt },
      { label: "Subscriptions", href: "/subscriptions", icon: Repeat },
      { label: "Payments", href: "/payments", icon: CreditCard },
      { label: "Insurance Claims", href: "/claims", icon: ShieldAlert },
      { label: "Refunds", href: "/refunds", icon: DollarSign },
      { label: "Financial Reports", href: "/financial-reports", icon: FileText },
    ],
  },
  {
    groupName: "Notification Center",
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Templates", href: "/templates", icon: LayoutTemplate },
      { label: "Broadcasts", href: "/broadcasts", icon: Megaphone },
      { label: "Delivery Logs", href: "/delivery-logs", icon: MailCheck },
      { label: "Analytics", href: "/notification-analytics", icon: BarChart3 },
    ],
  },
  {
    groupName: "Integrations",
    items: [
      { label: "All Integrations", href: "/integrations", icon: Plug },
      { label: "Payment Gateways", href: "/payment-gateways", icon: CreditCard },
      { label: "Insurance Providers", href: "/insurance-providers", icon: ShieldCheck },
      { label: "HL7 / FHIR", href: "/hl7-fhir", icon: HeartPulse },
      { label: "Webhooks", href: "/webhooks", icon: Webhook },
      { label: "Email Providers", href: "/email-providers", icon: Mail },
      { label: "SMS Providers", href: "/sms-providers", icon: MessageSquare },
      { label: "WhatsApp Providers", href: "/whatsapp-providers", icon: MessageCircle },
      { label: "Storage", href: "/storage", icon: HardDrive },
      { label: "API Keys", href: "/api-keys", icon: KeyRound },
    ],
  },
  {
    groupName: "Platform Monitoring",
    items: [
      { label: "Dashboard", href: "/monitoring", icon: ActivitySquare },
      { label: "System Health", href: "/system-health", icon: HeartPulse },
      { label: "API Health", href: "/api-health", icon: Network },
      { label: "Queue Monitor", href: "/queue-monitor", icon: ListTree },
      { label: "Database Health", href: "/database-health", icon: Database },
      { label: "Storage Monitor", href: "/storage-monitor", icon: HardDrive },
      { label: "Error Tracker", href: "/error-tracker", icon: Bug },
      { label: "Job Monitor", href: "/job-monitor", icon: LayoutList },
      { label: "Uptime", href: "/uptime", icon: Clock },
      { label: "Service Status", href: "/service-status", icon: Server },
    ],
  },
  {
    groupName: "Audit Center",
    items: [
      { label: "Dashboard", href: "/audit", icon: Shield },
      { label: "Audit Logs", href: "/audit/logs", icon: FileText },
      { label: "Activity Timeline", href: "/audit/activity", icon: Activity },
      { label: "Access History", href: "/audit/access-history", icon: Fingerprint },
      { label: "Security Events", href: "/audit/security-events", icon: ShieldAlert },
      { label: "Data Access", href: "/audit/data-access", icon: Database },
      { label: "Compliance", href: "/audit/compliance", icon: Scale },
      { label: "Export Data", href: "/audit/export", icon: Download },
    ],
  },
  {
    groupName: "Reports Hub",
    items: [
      { label: "Dashboard", href: "/reports", icon: BarChart3 },
      { label: "Revenue", href: "/reports/revenue", icon: DollarSign },
      { label: "Tenants", href: "/reports/tenants", icon: Building },
      { label: "Hospitals", href: "/reports/hospitals", icon: Building2 },
      { label: "Users & Staff", href: "/reports/users", icon: Users2 },
      { label: "Scheduled", href: "/reports/scheduled", icon: Clock },
      { label: "Export History", href: "/reports/export-history", icon: Download },
      { label: "Custom Builder", href: "/reports/custom", icon: PieChart },
    ],
  },
  {
    groupName: "Identity & Access",
    items: [
      { label: "Users & Access", href: "/users", icon: Users2 },
    ],
  },
  {
    groupName: "Platform Settings",
    items: [
      { label: "General", href: "/settings/general", icon: Settings },
      { label: "Branding", href: "/settings/branding", icon: Palette },
      { label: "Theme", href: "/settings/theme", icon: SunMoon },
      { label: "Localization", href: "/settings/localization", icon: Globe },
      { label: "Security", href: "/settings/security", icon: ShieldCheck },
      { label: "Notifications", href: "/settings/notifications", icon: Bell },
      { label: "Feature Flags", href: "/settings/feature-flags", icon: ToggleLeft },
      { label: "Storage", href: "/settings/storage", icon: HardDrive },
      { label: "Retention", href: "/settings/retention", icon: Archive },
      { label: "Environment", href: "/settings/environment", icon: Server },
      { label: "System", href: "/settings/system", icon: Cpu },
    ],
  },
];

