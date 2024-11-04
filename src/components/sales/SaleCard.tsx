import React, { useState } from 'react';
import { Sale, SaleNote } from '../../types';
import { Ban, Calendar, DollarSign, Plus, History, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useCars, useClients, usePayments, useSales } from '../../hooks/useDatabase';
import PaymentHistory from '../payments/PaymentHistory';
import EarlyPayoffModal from './EarlyPayoffModal';
import DeleteSaleModal from './DeleteSaleModal';
import NotesModal from './NotesModal';
import { calculateRemainingPayments } from '../../utils/financeCalculator';

interface SaleCardProps {
  sale: Sale;
  onCancel: () => void;
  onAddPayment: () => void;
}

export default function SaleCard({ sale, onCancel, onAddPayment }: SaleCardProps) {
  const { cars } = useCars();
  const { clients } = useClients();
  const { payments, addPayment } = usePayments();
  const { deleteSale } = useSales();
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showEarlyPayoff, setShowEarlyPayoff] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState<SaleNote[]>([]);
  
  const car = cars.find(c => c.id === sale.carId);
  const client = clients.find(c => c.id === sale.clientId);

  const completedPayments = payments.filter(p => p.saleId === sale.id && p.status === 'paid' && p.paidDate);
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0) + sale.downPayment;
  
  const { remainingPayments, remainingAmount } = calculateRemainingPayments({
    originalAmount: sale.financedAmount,
    interestRate: sale.interestRate,
    paymentAmount: sale.paymentAmount,
    paymentFrequency: sale.paymentFrequency,
    totalPaid: totalPaid - sale.downPayment
  });
  
  const totalAmountWithInterest = sale.financedAmount + (sale.paymentAmount * sale.totalPayments - sale.financedAmount);
  const totalAmount = totalAmountWithInterest + sale.downPayment;
  const progress = (totalPaid / totalAmount) * 100;

  const nextPaymentDate = payments
    .filter(p => p.saleId === sale.id && p.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate;

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    defaulted: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const handleAddNote = (content: string) => {
    const newNote: SaleNote = {
      id: `note-${Date.now()}`,
      saleId: sale.id,
      content,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin' // You might want to get this from the logged-in user
    };
    setNotes(prev => [...prev, newNote]);
  };

  if (!car || !client) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header Section */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {client.name}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[sale.status]}`}>
                  {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                </span>
              </h3>
              <p className="text-gray-600">
                {car.year} {car.make} {car.model}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Next Payment</p>
              <p className="font-medium">
                {nextPaymentDate ? new Date(nextPaymentDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Payment Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-4 pb-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium">${totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Paid to Date</p>
            <p className="font-medium text-green-600">${totalPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Remaining</p>
            <p className="font-medium text-blue-600">${(remainingPayments * sale.paymentAmount).toLocaleString()}</p>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Contact Information</p>
                <p className="text-sm">{client.email}</p>
                <p className="text-sm">{client.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sale Details</p>
                <p className="text-sm">Down Payment: ${sale.downPayment.toLocaleString()}</p>
                <p className="text-sm">Interest Rate: {sale.interestRate}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Started {new Date(sale.startDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 py-3 bg-gray-50 border-t flex justify-end gap-2">
          <button
            onClick={() => setShowNotesModal(true)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Notes {notes.length > 0 && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{notes.length}</span>}
          </button>
          <button
            onClick={() => setShowPaymentHistory(true)}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <History className="w-5 h-5" />
            History
          </button>
          {sale.status === 'active' && (
            <>
              <button
                onClick={() => setShowEarlyPayoff(true)}
                className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Payoff
              </button>
              <button
                onClick={onAddPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Payment
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Ban className="w-5 h-5" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {showPaymentHistory && (
        <PaymentHistory
          sale={sale}
          payments={completedPayments}
          onClose={() => setShowPaymentHistory(false)}
        />
      )}

      {showEarlyPayoff && (
        <EarlyPayoffModal
          sale={sale}
          totalPaid={totalPaid}
          remainingAmount={remainingAmount}
          paymentsMade={sale.totalPayments - remainingPayments}
          onClose={() => setShowEarlyPayoff(false)}
          onSubmit={async (amount) => {
            try {
              await addPayment({
                saleId: sale.id,
                amount,
                dueDate: new Date().toISOString(),
                paidDate: new Date().toISOString(),
                status: 'paid'
              });
              setShowEarlyPayoff(false);
            } catch (error) {
              console.error('Error processing early payoff:', error);
              alert('Failed to process early payoff. Please try again.');
            }
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteSaleModal
          onConfirm={async () => {
            await deleteSale(sale.id);
            setShowDeleteModal(false);
          }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {showNotesModal && (
        <NotesModal
          sale={sale}
          notes={notes}
          onAddNote={handleAddNote}
          onClose={() => setShowNotesModal(false)}
        />
      )}
    </>
  );
}