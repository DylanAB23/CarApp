import React from 'react';
import { Car, Users, DollarSign, AlertCircle } from 'lucide-react';
import { dashboardStats } from '../data/mockData';

export default function Dashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Car}
          title="Total Cars"
          value={dashboardStats.totalCars}
          subtitle={`${dashboardStats.availableCars} Available`}
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Total Clients"
          value={dashboardStats.totalClients}
          subtitle="Active Customers"
          color="green"
        />
        <StatCard
          icon={DollarSign}
          title="Monthly Revenue"
          value={`$${dashboardStats.monthlyRevenue.toLocaleString()}`}
          subtitle="Current Month"
          color="yellow"
        />
        <StatCard
          icon={AlertCircle}
          title="Pending Payments"
          value={dashboardStats.pendingPayments}
          subtitle="Requires Action"
          color="red"
        />
      </div>

      {/* Add more dashboard content here */}
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

function StatCard({ icon: Icon, title, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${colorClasses[color]} bg-opacity-10`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
      </div>
      <h3 className="text-gray-600 text-sm">{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );
}