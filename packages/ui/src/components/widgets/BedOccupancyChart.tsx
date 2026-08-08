"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

interface BedOccupancyChartProps {
  data: {
    name: string;
    total: number;
    occupied: number;
    available: number;
  }[];
  isLoading: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function BedOccupancyChart({ data, isLoading }: BedOccupancyChartProps) {
  // Transform data for PieChart (we want to show Occupied beds by Ward)
  const chartData = data.map((d, index) => ({
    name: d.name,
    value: d.occupied,
    total: d.total,
    color: COLORS[index % COLORS.length]
  })).filter(d => d.value > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-full flex flex-col">
      <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" /> Bed Occupancy Distribution
      </h3>
      
      <div className="flex-1 w-full flex items-center justify-center min-h-[250px]">
        {isLoading ? (
          <div className="animate-pulse flex items-center justify-center h-full w-full">
            <div className="h-40 w-40 rounded-full border-4 border-muted border-t-primary/50"></div>
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center">No occupied beds found.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [`${value} Beds (${Math.round((value/props.payload.total)*100)}% of ${name})`, name]} 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
