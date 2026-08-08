import React from 'react';
import { Users, BedDouble, Clock, FileCheck } from 'lucide-react';

interface IPDKpiCardsProps {
  data: {
    activeAdmissions: number;
    occupancyRate: number;
    alos: number;
    dischargesToday: number;
  };
  isLoading: boolean;
}

export function IPDKpiCards({ data, isLoading }: IPDKpiCardsProps) {
  const kpis = [
    {
      title: "Active Admissions",
      value: data.activeAdmissions,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      border: "border-blue-200 dark:border-blue-800"
    },
    {
      title: "Bed Occupancy Rate",
      value: `${data.occupancyRate}%`,
      icon: BedDouble,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      border: "border-orange-200 dark:border-orange-800"
    },
    {
      title: "Avg Length of Stay",
      value: `${data.alos} Days`,
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      border: "border-indigo-200 dark:border-indigo-800"
    },
    {
      title: "Discharges Today",
      value: data.dischargesToday,
      icon: FileCheck,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
      border: "border-green-200 dark:border-green-800"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <div key={idx} className={`p-5 rounded-xl border ${kpi.border} bg-card shadow-sm flex items-center justify-between`}>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">{kpi.title}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <h3 className="text-2xl font-bold mt-1 text-foreground">{kpi.value}</h3>
            )}
          </div>
          <div className={`p-3 rounded-xl ${kpi.bg}`}>
            <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
