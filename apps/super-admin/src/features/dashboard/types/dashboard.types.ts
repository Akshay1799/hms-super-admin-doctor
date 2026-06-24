export interface KPI {
  id: string;
  title: string;
  value: string | number;
  percentage: number;
  trend: "up" | "down" | "neutral";
  color: string;
  icon: string;
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  createdAt: string;
}

export interface RevenueMetric {
  period: string;
  revenue: number;
  collections: number;
  expenses: number;
}

export interface HospitalPerformanceMetric {
  name: string;
  admissions: number;
  revenue: number;
  patients: number;
}
