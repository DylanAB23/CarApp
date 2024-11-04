import React from 'react';
import { Calendar } from 'lucide-react';

interface PaymentSchedulerProps {
  startDate: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  onStartDateChange: (date: string) => void;
  onFrequencyChange: (frequency: 'weekly' | 'biweekly' | 'monthly') => void;
}

export default function PaymentScheduler({
  startDate,
  frequency,
  onStartDateChange,
  onFrequencyChange
}: PaymentSchedulerProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">First Payment Date</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Select the date of the first payment (typically aligned with customer's pay date)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Payment Frequency</label>
        <select
          value={frequency}
          onChange={(e) => onFrequencyChange(e.target.value as any)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Choose a payment schedule that matches the customer's income frequency
        </p>
      </div>
    </div>
  );
}