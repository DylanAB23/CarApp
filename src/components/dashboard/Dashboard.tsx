import React from 'react';
import { Car, DollarSign, Users, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';
import ActivityFeed from './ActivityFeed';
import { useDashboardStats, useRecentActivity } from '../../hooks/useDatabase';

export default function Dashboard() {
  const stats = useDashboardStats();
  const activities = useRecentActivity();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Cars"
          value={stats.totalCars}
          icon={Car}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Loans"
          value={stats.activeLoans}
          icon={Users}
        />
        <StatCard
          title="Overdue Payments"
          value={stats.overduePayments}
          icon={AlertCircle}
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
          {/* Revenue chart will be added here */}
          <div className="h-64 flex items-center justify-center text-gray-500">
            Revenue chart placeholder
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}