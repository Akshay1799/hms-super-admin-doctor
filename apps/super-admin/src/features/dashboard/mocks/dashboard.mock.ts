import { KPI, RevenueMetric, HospitalPerformanceMetric } from "../types/dashboard.types";

export const MOCK_KPIS: KPI[] = [
  { id: "kpi-1", title: "Total Tenants", value: 14, percentage: 12.5, trend: "up", color: "blue", icon: "Building2" },
  { id: "kpi-2", title: "Total Hospitals", value: 42, percentage: 5.4, trend: "up", color: "green", icon: "Building" },
  { id: "kpi-3", title: "Active Doctors", value: 894, percentage: 8.2, trend: "up", color: "purple", icon: "User" },
  { id: "kpi-4", title: "Total Patients", value: 14205, percentage: 14.8, trend: "up", color: "teal", icon: "Users2" },
  { id: "kpi-5", title: "Monthly Revenue", value: "₹14.8L", percentage: 18.4, trend: "up", color: "emerald", icon: "IndianRupee" },
  { id: "kpi-6", title: "Active Sessions", value: 1492, percentage: 0.8, trend: "down", color: "orange", icon: "Shield" },
  { id: "kpi-7", title: "Critical Alerts", value: 3, percentage: 0, trend: "neutral", color: "red", icon: "TriangleAlert" },
  { id: "kpi-8", title: "Storage Used", value: "84%", percentage: 4.2, trend: "up", color: "gray", icon: "Database" },
];

export const MOCK_REVENUE_TREND: RevenueMetric[] = [
  { period: "Jan", revenue: 450000, collections: 410000, expenses: 210000 },
  { period: "Feb", revenue: 520000, collections: 490000, expenses: 230000 },
  { period: "Mar", revenue: 610000, collections: 580000, expenses: 250000 },
  { period: "Apr", revenue: 580000, collections: 560000, expenses: 240000 },
  { period: "May", revenue: 730000, collections: 710000, expenses: 280000 },
  { period: "Jun", revenue: 890000, collections: 850000, expenses: 310000 },
];

export const MOCK_HOSPITALS_PERFORMANCE: HospitalPerformanceMetric[] = [
  { name: "Apollo Delhi", admissions: 1420, revenue: 3200000, patients: 8400 },
  { name: "Fortis Mumbai", admissions: 980, revenue: 2100000, patients: 5900 },
  { name: "Max Bangalore", admissions: 1100, revenue: 2400000, patients: 6300 },
  { name: "Medanta Gurgaon", admissions: 1300, revenue: 2900000, patients: 7800 },
  { name: "Manipal Goa", admissions: 640, revenue: 1400000, patients: 3800 },
];
