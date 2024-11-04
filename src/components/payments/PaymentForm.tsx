import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Sale } from '../../types';
import { usePayments } from '../../hooks/useDatabase';
import { getNextPaymentDate } from '../../utils/dateUtils';

interface PaymentFormProps {
  sale: Sale;
  onSubmit: (amount: number, date: string) => void;
  onClose: () => void;
}

export default function PaymentForm({ sale, onSubmit, onClose }: PaymentFormProps) {
  const { payments, updatePayment, addPayment } = usePayments();
  const [amount, setAmount] = useState<number>(sale.paymentAmount);
  const [isEditingDate, setIsEditingDate] = useState(false);

  // Get all payments for this sale
  const salePayments = payments.filter(p => p.saleId === sale.id);
  const pendingPayments = salePayments.filter(p => p.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const nextPayment = pendingPayments[0];
  const [selectedDate, setSelectedDate] = useState(
    nextPayment?.dueDate || new Date().toISOString().split('T')[0]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nextPayment) {
      // Update the current payment's due date if it was changed
      if (selectedDate !== nextPayment.dueDate) {
        await updatePayment(nextPayment.id, {
          ...nextPayment,
          dueDate: selectedDate
        });
      }

      // Mark current payment as paid
      await updatePayment(nextPayment.id, {
        ...nextPayment,
        status: 'paid',
        paidDate: new Date().toISOString(),
        amount: amount
      });

      // Calculate next payment date based on the new due date
      const nextDate = getNextPaymentDate(
        new Date(sale.firstPaymentDate),
        sale.paymentFrequency,
        new Date(selectedDate)
      );

      // Create next payment if it doesn't exist
      if (!pendingPayments.some(p => p.dueDate === nextDate.toISOString())) {
        await addPayment({
          saleId: sale.id,
          amount: sale.paymentAmount,
          dueDate: nextDate.toISOString(),
          status: 'pending'
        });
      }

      // Close the form after successful payment
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Record Payment</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <button
                type="button"
                onClick={() => setIsEditingDate(!isEditingDate)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {isEditingDate ? 'Cancel Edit' : 'Change Date'}
              </button>
            </div>
            {isEditingDate ? (
              <input
                type="date"
                value={selectedDate.split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            ) : (
              <p className="text-lg font-medium">
                {new Date(selectedDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}