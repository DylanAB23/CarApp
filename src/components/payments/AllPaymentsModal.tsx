import React, { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';
import { Sale, Payment } from '../../types';
import { isOverdue } from '../../utils/dateUtils';

interface AllPaymentsModalProps {
  sale: Sale;
  payments: Payment[];
  onClose: () => void;
  onAddPayment: (type: 'overdue' | 'due' | 'upcoming') => void;
}

export default function AllPaymentsModal({ sale, payments, onClose, onAddPayment }: AllPaymentsModalProps) {
  const [selectedTab, setSelectedTab] = useState<'overdue' | 'due' | 'upcoming'>('due');

  const categorizePayments = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return payments.reduce((acc, payment) => {
      const dueDate = new Date(payment.dueDate);

      if (isOverdue(payment.dueDate)) {
        acc.overdue.push(payment);
      } else if (dueDate.toDateString() === now.toDateString()) {
        acc.due.push(payment);
      } else if (dueDate >= startOfMonth && dueDate <= endOfMonth) {
        acc.upcoming.push(payment);
      }

      return acc;
    }, { overdue: [] as Payment[], due: [] as Payment[], upcoming: [] as Payment[] });
  };

  const { overdue, due, upcoming } = categorizePayments();

  const getPaymentsList = () => {
    switch (selectedTab) {
      case 'overdue':
        return overdue;
      case 'due':
        return due;
      case 'upcoming':
        return upcoming;
    }
  };

  const tabStyle = (tab: 'overdue' | 'due' | 'upcoming') => `
    px-4 py-2 text-sm font-medium rounded-lg
    ${selectedTab === tab ? 
      tab === 'overdue' ? 'bg-red-100 text-red-800' :
      tab === 'due' ? 'bg-yellow-100 text-yellow-800' :
      'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
  `;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Payment Schedule</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              className={tabStyle('overdue')}
              onClick={() => setSelectedTab('overdue')}
            >
              Overdue ({overdue.length})
            </button>
            <button
              className={tabStyle('due')}
              onClick={() => setSelectedTab('due')}
            >
              Due Today ({due.length})
            </button>
            <button
              className={tabStyle('upcoming')}
              onClick={() => setSelectedTab('upcoming')}
            >
              This Month ({upcoming.length})
            </button>
          </div>
          <button
            onClick={() => onAddPayment(selectedTab)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Payment
          </button>
        </div>

        <div className="space-y-4">
          {getPaymentsList().map((payment) => (
            <div
              key={payment.id}
              className={`p-4 rounded-lg ${
                isOverdue(payment.dueDate) ? 'bg-red-50 border border-red-200' :
                new Date(payment.dueDate).toDateString() === new Date().toDateString() ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Amount: ${payment.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
                {isOverdue(payment.dueDate) && (
                  <span className="text-xs text-red-600 font-medium">
                    {Math.floor((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))}d overdue
                  </span>
                )}
              </div>
            </div>
          ))}

          {getPaymentsList().length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No payments found for this category
            </p>
          )}
        </div>
      </div>
    </div>
  );
}