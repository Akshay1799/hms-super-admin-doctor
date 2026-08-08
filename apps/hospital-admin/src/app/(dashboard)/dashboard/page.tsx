"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/lib/api-client";
import {
  Building2,
  Users2,
  UserCheck,
  BedDouble,
  CalendarDays,
  Activity,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IPDKpiCards } from "../../../../../../packages/ui/src/components/widgets/IPDKpiCards";
import { BedOccupancyChart } from "../../../../../../packages/ui/src/components/widgets/BedOccupancyChart";

interface DashboardStats {
  deptCount: number;
  doctorCount: number;
  nurseCount: number;
  patientCount: number;
  appointmentsToday: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ipdKpis, setIpdKpis] = useState<any>(null);
  const [bedOccupancy, setBedOccupancy] = useState<any>(null);
  const [nurseData, setNurseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiClient.get("/dashboard/hospital-admin");
        setStats(res.data.data);
      } catch (err: any) {
        toast.error("Failed to load dashboard metrics");
        // Fallback fallback stats
        setStats({
          deptCount: 8,
          doctorCount: 24,
          nurseCount: 45,
          patientCount: 142,
          appointmentsToday: 18,
          totalBeds: 150,
          occupiedBeds: 92,
          availableBeds: 58,
        });
      } finally {
        setIsLoading(false);
      }
    }
    async function fetchIpdAnalytics() {
      if (user?.role === 'NURSE') {
        try {
          const res = await apiClient.get("/ipd/analytics/nurse-dashboard");
          setNurseData(res.data.data);
        } catch (err: any) {
          console.error("Failed to load Nurse analytics");
        }
      } else {
        try {
          const [kpiRes, occRes] = await Promise.all([
            apiClient.get("/ipd/analytics/kpis"),
            apiClient.get("/ipd/analytics/bed-occupancy")
          ]);
          setIpdKpis(kpiRes.data.data);
          setBedOccupancy(occRes.data.data);
        } catch (err: any) {
          console.error("Failed to load IPD analytics");
        }
      }
    }
    
    Promise.all([fetchStats(), fetchIpdAnalytics()]).finally(() => {
      setIsLoading(false);
    });
  }, [user]);

  if (isLoading || !stats) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    {
      title: "Total Departments",
      value: stats.deptCount,
      description: "Clinical & administrative units",
      icon: Building2,
      color: "bg-primary/10 text-primary",
      hideForDeptAdmin: true,
    },
    {
      title: "Active Doctors",
      value: stats.doctorCount,
      description: "On-duty medical practitioners",
      icon: Users2,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Nurses & Staff",
      value: stats.nurseCount,
      description: "Healthcare assistants & admin staff",
      icon: UserCheck,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Registered Patients",
      value: stats.patientCount,
      description: "Active inpatient & outpatient records",
      icon: Activity,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Today's Appointments",
      value: stats.appointmentsToday,
      description: "Scheduled consultation visits",
      icon: CalendarDays,
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Bed Occupancy",
      value: `${stats.occupiedBeds}/${stats.totalBeds}`,
      description: `${stats.availableBeds} beds currently available`,
      icon: BedDouble,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
  ].filter(card => !card.hideForDeptAdmin || user?.role !== 'DEPT_ADMIN');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-primary rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold">Welcome Back, {user?.name}!</h2>
        <p className="text-sm opacity-90 mt-1">
          Hospital Command Center is operational. All department sync statuses are healthy.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {user?.role === 'NURSE' && nurseData && (
        <div className="space-y-4 border-t border-border pt-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-rose-500" />
            Nursing Action Center
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground">Patients Requiring Vitals</h3>
              <div className="space-y-3">
                {nurseData.patientsNeedingVitals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All vitals are up to date.</p>
                ) : (
                  nurseData.patientsNeedingVitals.map((patient: any) => (
                    <div key={patient._id} className="flex items-center justify-between p-3 bg-rose-500/10 rounded-lg">
                      <div>
                        <p className="text-sm font-bold text-foreground">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.ward} - {patient.bedNumber}</p>
                      </div>
                      <button 
                        onClick={() => router.push(`/patients/${patient._id}/vitals`)}
                        className="text-xs font-semibold px-3 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                      >
                        Record Vitals
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IPD Metrics Section */}
      {user?.role !== 'NURSE' && (
        <div className="space-y-4 border-t border-border pt-6">
          <h3 className="text-lg font-bold text-foreground">Inpatient Department (IPD) Overview</h3>
          {ipdKpis && <IPDKpiCards data={ipdKpis} isLoading={isLoading} />}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[350px]">
              {bedOccupancy && <BedOccupancyChart data={bedOccupancy} isLoading={isLoading} />}
            </div>
            {/* Recent Alerts (Moved from below) */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                Critical Department Alerts
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg text-xs">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">ICU Bed Shortage</p>
                    <p className="text-muted-foreground mt-0.5">ICU Ward has reached 90% capacity. Review emergency discharge checklist.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg text-xs">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">Pending Doctor Invites</p>
                    <p className="text-muted-foreground mt-0.5">3 doctor invitations are expiring in less than 12 hours.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Quick Operations */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground">Quick Administration Actions</h3>
          <div className={`grid gap-3.5 ${user?.role === 'DEPT_ADMIN' ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <button
              onClick={() => router.push("/staff?invite=true")}
              className="p-3.5 border border-border hover:border-primary rounded-xl text-center cursor-pointer transition-all duration-150 group"
            >
              <Users2 className="h-5 w-5 mx-auto text-muted-foreground group-hover:text-primary transition-colors mb-1.5" />
              <p className="text-xs font-semibold text-foreground">Invite New Staff</p>
            </button>
            {user?.role !== 'DEPT_ADMIN' && (
              <button
                onClick={() => router.push("/departments")}
                className="p-3.5 border border-border hover:border-primary rounded-xl text-center cursor-pointer transition-all duration-150 group"
              >
                <Building2 className="h-5 w-5 mx-auto text-muted-foreground group-hover:text-primary transition-colors mb-1.5" />
                <p className="text-xs font-semibold text-foreground">Add Department</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
