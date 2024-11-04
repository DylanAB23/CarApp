import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useSales, usePayments } from '../../hooks/useDatabase';
import { Payment } from '../../types';
import PaymentForm from './PaymentForm';
import PaymentCard from './PaymentCard';
import { isOverdue } from '../../utils/dateUtils';

type TabType = 'month' | 'today' | 'week';

export default function Payments() {
  const { sales } = useSales();
  const { payments } = usePayments();
  const [selectedTab, setSelectedTab] = useState<TabType>('month');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activeSales = sales.filter(sale => 
    sale.status === 'active' &&
    (searchTerm === '' || sale.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getFilteredPayments = (tab: TabType) => {
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    switch (tab) {
      case 'today':
        return pendingPayments.filter(p => {
          const dueDate = new Date(p.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime();
        });
      case 'week':
        return pendingPayments.filter(p => {
          const dueDate = new Date(p.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate >= today && dueDate <= endOfWeek;
        });
      case 'month':
        return pendingPayments.filter(p => {
          const dueDate = new Date(p.dueDate);
          return dueDate >= startOfMonth && dueDate <= endOfMonth;
        });
      default:
        return pendingPayments;
    }
  };

  const groupPaymentsBySale = (payments: Payment[]) => {
    const grouped = new Map<string, Payment[]>();
    
    payments.forEach(payment => {
      const sale = sales.find(s => s.id === payment.saleId);
      if (!sale) return;

      if (!grouped.has(sale.id)) {
        grouped.set(sale.id, []);
      }
      grouped.get(sale.id)?.push(payment);
    });

    return grouped;
  };

  const filteredPayments = getFilteredPayments(selectedTab);
  const groupedPayments = groupPaymentsBySale(filteredPayments);

  const tabStyle = (tab: TabType) => `
    px-4 py-2 text-sm font-medium rounded-lg
    ${selectedTab === tab ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
  `;

  const handlePaymentClick = (saleId: string, payment: Payment) => {
    setSelectedSaleId(saleId);
    setSelectedPayment(payment);
    setShowPaymentForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Payments</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          className={tabStyle('month')}
          onClick={() => setSelectedTab('month')}
        >
          This Month
        </button>
        <button
          className={tabStyle('week')}
          onClick={() => setSelectedTab('week')}
        >
          This Week
        </button>
        <button
          className={tabStyle('today')}
          onClick={() => setSelectedTab('today')}
        >
          Due Today
        </button>
      </div>

      <div className="space-y-4">
        {Array.from(groupedPayments.entries()).map(([saleId, payments]) => {
          const sale = sales.find(s => s.id === saleId);
          if (!sale) return null;

          return (
            <PaymentCard
              key={saleId}
              sale={sale}
              highlightedPayments={payments}
              onPaymentClick={(payment) => handlePaymentClick(saleId, payment)}
            />
          );
        })}

        {groupedPayments.size === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {searchTerm 
                ? 'No payments found matching your search'
                : `No payments ${
                    selectedTab === 'today' 
                      ? 'due today' 
                      : selectedTab === 'week'
                        ? 'due this week'
                        : 'due this month'
                  }`
              }
            </p>
          </div>
        )}
      </div>

      {showPaymentForm && selectedSaleId && selectedPayment && (
        <PaymentForm
          sale={sales.find(s => s.id === selectedSaleId)!}
          payment={selectedPayment}
          onClose={() => {
            setShowPaymentForm(false);
            setSelectedSaleId(null);
            setSelectedPayment(null);
          }}
          onSubmit={() => {
            setShowPaymentForm(false);
            setSelectedSaleId(null);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
}