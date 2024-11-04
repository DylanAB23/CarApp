import React from 'react';
import { RecentActivity } from '../../types';
import { Car, DollarSign, Package } from 'lucide-react';

interface ActivityFeedProps {
  activities: RecentActivity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'sale':
        return Car;
      case 'payment':
        return DollarSign;
      case 'inventory':
        return Package;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                {activity.amount && (
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    ${activity.amount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}