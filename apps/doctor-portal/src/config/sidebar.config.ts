import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
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
    groupName: "Clinical Management",
    items: [
      { label: "My Patients", href: "/my-patients", icon: Users },
      { label: "Appointments", href: "/appointments", icon: Calendar },
    ],
  },
  {
    groupName: "Practice Insights",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    groupName: "Account",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
