import React, { useState } from 'react';
import { Client } from '../../types';
import { Mail, Phone, Edit, Trash2, ChevronRight } from 'lucide-react';
import { useSales, usePayments } from '../../hooks/useDatabase';
import ClientSalesModal from './ClientSalesModal';
import { calculateRemainingPayments } from '../../utils/financeCalculator';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const { sales } = useSales();
  const { payments } = usePayments();
  const [showSales, setShowSales] = useState(false);

  const clientSales = sales.filter(sale => sale.clientId === client.id);
  const activeSales = clientSales.filter(sale => sale.status === 'active').length;
  
  // Calculate total owed including interest
  const totalOwed = clientSales.reduce((sum, sale) => {
    const salePayments = payments.filter(p => p.saleId === sale.id && p.status === 'paid');
    const totalPaid = salePayments.reduce((total, payment) => total + payment.amount, 0) + sale.downPayment;
    
    if (sale.status === 'active') {
      const { remainingAmount } = calculateRemainingPayments({
        originalAmount: sale.financedAmount,
        interestRate: sale.interestRate,
        paymentAmount: sale.paymentAmount,
        paymentFrequency: sale.paymentFrequency,
        totalPaid: totalPaid - sale.downPayment
      });
      return sum + remainingAmount;
    }
    return sum;
  }, 0);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{client.name}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(client)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(client.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <a href={`mailto:${client.email}`} className="hover:text-blue-600">
              {client.email}
            </a>
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <a href={`tel:${client.phone}`} className="hover:text-blue-600">
              {client.phone}
            </a>
          </div>
        </div>

        <button
          onClick={() => setShowSales(true)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div>
            <p className="text-sm text-gray-600">Active Sales: {activeSales}</p>
            <p className="text-sm font-medium">Balance: ${totalOwed.toLocaleString()}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {showSales && (
        <ClientSalesModal
          client={client}
          sales={clientSales}
          onClose={() => setShowSales(false)}
        />
      )}
    </>
  );
}