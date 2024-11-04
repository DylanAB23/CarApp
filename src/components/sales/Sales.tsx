import React, { useState } from 'react';
import { useSales, usePayments, useClients } from '../../hooks/useDatabase';
import SaleCard from './SaleCard';
import PaymentForm from '../payments/PaymentForm';
import { Sale } from '../../types';
import { Search } from 'lucide-react';

export default function Sales() {
  const { sales, updateSale } = useSales();
  const { addPayment } = usePayments();
  const { clients } = useClients();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCancelSale = async (sale: Sale) => {
    await updateSale({ ...sale, status: 'cancelled' });
  };

  const handleAddPayment = async (saleId: string, amount: number, date: string) => {
    if (!addPayment) return;
    
    await addPayment({
      saleId,
      amount,
      dueDate: date,
      paidDate: date,
      status: 'paid'
    });
    setShowPaymentForm(false);
    setSelectedSale(null);
  };

  const handleShowPaymentForm = (sale: Sale) => {
    setSelectedSale(sale);
    setShowPaymentForm(true);
  };

  // Filter sales based on customer name
  const filteredSales = sales.filter(sale => {
    const client = clients.find(c => c.id === sale.clientId);
    if (!client) return false;
    return client.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sales</h2>
        <div className="w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredSales.map((sale) => (
          <SaleCard
            key={sale.id}
            sale={sale}
            onCancel={() => handleCancelSale(sale)}
            onAddPayment={() => handleShowPaymentForm(sale)}
          />
        ))}

        {filteredSales.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {searchTerm ? 'No sales found matching your search' : 'No sales records found'}
            </p>
          </div>
        )}
      </div>

      {showPaymentForm && selectedSale && (
        <PaymentForm
          sale={selectedSale}
          onSubmit={(amount, date) => handleAddPayment(selectedSale.id, amount, date)}
          onClose={() => {
            setShowPaymentForm(false);
            setSelectedSale(null);
          }}
        />
      )}
    </div>
  );
}