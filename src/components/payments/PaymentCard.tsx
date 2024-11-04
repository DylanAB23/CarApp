import React, { useState } from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { Sale, Payment } from '../../types';
import { useCars, useClients } from '../../hooks/useDatabase';
import { isOverdue } from '../../utils/dateUtils';
import AllPaymentsModal from './AllPaymentsModal';

interface PaymentCardProps {
  sale: Sale;
  highlightedPayments: Payment[];
  onPaymentClick: (payment: Payment) => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ sale, highlightedPayments, onPaymentClick }) => {
  const { cars } = useCars();
  const { clients } = useClients();
  const [showAllPayments, setShowAllPayments] = useState(false);
  
  const car = cars.find(c => c.id === sale.carId);
  const client = clients.find(c => c.id === sale.clientId);

  if (!car || !client) return null;

  const sortedPayments = [...highlightedPayments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium">
              {car.make} {car.model}
            </h3>
            <p className="text-sm text-gray-600">{client.name}</p>
          </div>
          <button
            onClick={() => setShowAllPayments(true)}
            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            View Schedule
          </button>
        </div>

        <div className="space-y-3">
          {sortedPayments.map(payment => (
            <div
              key={payment.id}
              className={`p-4 rounded-lg ${
                isOverdue(payment.dueDate)
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">
                    Due: {new Date(payment.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${payment.amount.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => onPaymentClick(payment)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  Record
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAllPayments && (
        <AllPaymentsModal
          sale={sale}
          payments={highlightedPayments}
          onClose={() => setShowAllPayments(false)}
          onAddPayment={(payment) => {
            setShowAllPayments(false);
            onPaymentClick(payment);
          }}
        />
      )}
    </>
  );
};

export default PaymentCard;