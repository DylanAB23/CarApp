import React from 'react';
import { X, Calculator, DollarSign, PiggyBank } from 'lucide-react';
import { Sale } from '../../types';
import { calculateEarlyPayoff } from '../../utils/financeCalculator';

interface EarlyPayoffModalProps {
  sale: Sale;
  totalPaid: number;
  remainingAmount: number;
  paymentsMade: number;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

export default function EarlyPayoffModal({ 
  sale, 
  totalPaid,
  remainingAmount,
  paymentsMade,
  onClose,
  onSubmit 
}: EarlyPayoffModalProps) {
  const remainingPayments = sale.totalPayments - paymentsMade;

  const {
    payoffAmount,
    totalSavings,
    interestSaved
  } = calculateEarlyPayoff({
    remainingPrincipal: remainingAmount,
    originalLoanAmount: sale.financedAmount,
    totalInterest: sale.totalPayments * sale.paymentAmount - sale.financedAmount,
    remainingPayments,
    totalPayments: sale.totalPayments
  });

  const handlePayoff = () => {
    if (window.confirm('Are you sure you want to process this early payoff?')) {
      onSubmit(payoffAmount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Early Payoff Calculator</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-gray-600">Regular Payoff</p>
              </div>
              <p className="text-lg font-semibold">
                ${(remainingAmount + (sale.paymentAmount * remainingPayments - remainingAmount)).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {remainingPayments} payments remaining
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-4 h-4 text-green-600" />
                <p className="text-sm text-gray-600">Early Payoff</p>
              </div>
              <p className="text-lg font-semibold text-green-600">
                ${payoffAmount.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Save ${totalSavings.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-medium">Payment Summary</h3>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Original Loan</p>
                <p className="font-medium">${sale.financedAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Paid</p>
                <p className="font-medium">${totalPaid.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Interest Rate</p>
                <p className="font-medium">{sale.interestRate}%</p>
              </div>
              <div>
                <p className="text-gray-600">Interest Saved</p>
                <p className="font-medium text-green-600">${interestSaved.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayoff}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Process Payoff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}