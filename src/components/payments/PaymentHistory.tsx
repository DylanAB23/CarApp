import React, { useState } from 'react';
import { X, Calendar, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import { Payment, Sale } from '../../types';
import { usePayments, useCars } from '../../hooks/useDatabase';
import { db } from '../../db';
import { getNextPaymentDate } from '../../utils/dateUtils';

interface PaymentHistoryProps {
  sale: Sale;
  payments: Payment[];
  onClose: () => void;
}

interface DeleteConfirmationProps {
  payment: Payment;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmation({ payment, onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold">Delete Payment</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the payment of ${payment.amount.toLocaleString()} made on {new Date(payment.paidDate!).toLocaleDateString()}? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentHistory({ sale, payments, onClose }: PaymentHistoryProps) {
  const { deletePayment, addPayment, updatePayment } = usePayments();
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Filter to only show completed payments
  const completedPayments = payments.filter(p => p.status === 'paid' && p.paidDate);
  
  // Sort payments by paid date, most recent first
  const sortedPayments = [...completedPayments].sort((a, b) => 
    new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime()
  );

  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = sale.salePrice - totalPaid;

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;

    try {
      await db.transaction('rw', [db.payments, db.sales], async () => {
        // Get all payments for this sale
        const allSalePayments = await db.payments
          .where('saleId')
          .equals(sale.id)
          .toArray();

        // Find the deleted payment's original due date
        const deletedPaymentDueDate = paymentToDelete.dueDate;

        // Delete the payment
        await db.payments.delete(paymentToDelete.id);

        // Calculate new total paid
        const remainingPayments = allSalePayments.filter(p => p.id !== paymentToDelete.id);
        const newTotalPaid = remainingPayments.reduce((sum, p) => {
          if (p.status === 'paid' && p.paidDate) {
            return sum + p.amount;
          }
          return sum;
        }, 0);

        // If the sale was completed and now has remaining balance, revert to active
        if (sale.status === 'completed' && newTotalPaid < sale.salePrice) {
          await db.sales.update(sale.id, { status: 'active' });
        }

        // Create a new pending payment with the original due date
        const newPayment = {
          saleId: sale.id,
          amount: sale.paymentAmount,
          dueDate: deletedPaymentDueDate,
          status: 'pending' as const
        };

        // Add the new pending payment
        await addPayment(newPayment);

        // Recalculate and update subsequent payment due dates
        const pendingPayments = remainingPayments
          .filter(p => p.status === 'pending')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        for (let i = 0; i < pendingPayments.length; i++) {
          const payment = pendingPayments[i];
          const previousDate = i === 0 ? deletedPaymentDueDate : pendingPayments[i - 1].dueDate;
          const nextDueDate = getNextPaymentDate(
            new Date(sale.firstPaymentDate),
            sale.paymentFrequency,
            new Date(previousDate)
          );

          await updatePayment(payment.id, {
            ...payment,
            dueDate: nextDueDate.toISOString()
          });
        }
      });

      setPaymentToDelete(null);
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('An error occurred while deleting the payment. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Payment History</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Amount Due</p>
            <p className="text-lg font-semibold">${sale.salePrice.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-lg font-semibold text-green-600">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Remaining Balance</p>
            <p className="text-lg font-semibold text-blue-600">${remainingAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="overflow-y-auto max-h-96">
          {sortedPayments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {new Date(payment.paidDate!).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() => setPaymentToDelete(payment)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Payment"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payments have been recorded yet.
            </div>
          )}
        </div>
      </div>

      {paymentToDelete && (
        <DeleteConfirmation
          payment={paymentToDelete}
          onConfirm={handleDeletePayment}
          onCancel={() => setPaymentToDelete(null)}
        />
      )}
    </div>
  );
}