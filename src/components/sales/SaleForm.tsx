import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Car, Client, Sale } from '../../types';
import { calculateLoanDetails } from '../../utils/financeCalculator';
import { calculateFirstPaymentDate } from '../../utils/dateUtils';
import ClientForm from '../clients/ClientForm';

interface SaleFormProps {
  cars: Car[];
  clients: Client[];
  onSubmit: (sale: Omit<Sale, 'id' | 'status'>) => void;
  onClose: () => void;
  onClientAdded?: (client: Client) => void;
}

export default function SaleForm({ cars, clients, onSubmit, onClose, onClientAdded }: SaleFormProps) {
  const [selectedCar, setSelectedCar] = useState<Car | null>(cars[0] || null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [formData, setFormData] = useState({
    carId: cars[0]?.id || '',
    clientId: '',
    downPayment: cars[0] ? Math.round(cars[0].price * 0.1) : 0,
    interestRate: 5.9,
    loanTermYears: 3,
    paymentFrequency: 'monthly' as const,
    firstPaymentDate: calculateFirstPaymentDate(new Date(), 'monthly').toISOString().split('T')[0]
  });

  // Update first payment date when frequency changes
  useEffect(() => {
    const newFirstPaymentDate = calculateFirstPaymentDate(
      new Date(),
      formData.paymentFrequency
    );
    setFormData(prev => ({
      ...prev,
      firstPaymentDate: newFirstPaymentDate.toISOString().split('T')[0]
    }));
  }, [formData.paymentFrequency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar) return;

    const loanDetails = calculateLoanDetails({
      vehiclePrice: selectedCar.price,
      downPayment: formData.downPayment,
      interestRate: formData.interestRate,
      loanTermYears: formData.loanTermYears,
      paymentFrequency: formData.paymentFrequency,
    });

    const sale: Omit<Sale, 'id' | 'status'> = {
      carId: selectedCar.id,
      clientId: formData.clientId,
      salePrice: selectedCar.price,
      purchasePrice: selectedCar.purchasePrice,
      downPayment: formData.downPayment,
      financedAmount: loanDetails.financedAmount,
      interestRate: formData.interestRate,
      loanTermYears: formData.loanTermYears,
      paymentFrequency: formData.paymentFrequency,
      paymentAmount: loanDetails.paymentAmount,
      totalPayments: loanDetails.totalPayments,
      startDate: new Date().toISOString(),
      firstPaymentDate: formData.firstPaymentDate,
      totalProfit: selectedCar.price - selectedCar.purchasePrice + loanDetails.totalInterest
    };

    onSubmit(sale);
  };

  const handleClientCreated = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    setShowClientForm(false);
    if (onClientAdded) {
      const newClient = await onClientAdded(clientData as Client);
      if (newClient?.id) {
        setFormData(prev => ({ ...prev, clientId: newClient.id }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New Sale</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Select Client</label>
              <button
                type="button"
                onClick={() => setShowClientForm(true)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add New Client
              </button>
            </div>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Choose a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>

          {selectedCar && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Vehicle Details</h3>
                <p className="text-sm text-gray-600">
                  {selectedCar.year} {selectedCar.make} {selectedCar.model}
                </p>
                <p className="text-sm text-gray-600">
                  Price: ${selectedCar.price.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Down Payment</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={formData.downPayment}
                      onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      min={0}
                      max={selectedCar.price}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    step="0.1"
                    min={0}
                    max={30}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Loan Term</label>
                  <select
                    value={formData.loanTermYears}
                    onChange={(e) => setFormData({ ...formData, loanTermYears: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {[1, 2, 3, 4, 5].map((years) => (
                      <option key={years} value={years}>
                        {years} {years === 1 ? 'Year' : 'Years'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Payment Date</label>
                  <input
                    type="date"
                    value={formData.firstPaymentDate}
                    onChange={(e) => setFormData({ ...formData, firstPaymentDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min={calculateFirstPaymentDate(new Date(), formData.paymentFrequency).toISOString().split('T')[0]}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    First payment will be due {formData.paymentFrequency === 'weekly' ? '1 week' : 
                      formData.paymentFrequency === 'biweekly' ? '2 weeks' : '1 month'} from sale date
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Frequency</label>
                  <select
                    value={formData.paymentFrequency}
                    onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value as any })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Payment Preview */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Payment Preview</h3>
                {(() => {
                  const loanDetails = calculateLoanDetails({
                    vehiclePrice: selectedCar.price,
                    downPayment: formData.downPayment,
                    interestRate: formData.interestRate,
                    loanTermYears: formData.loanTermYears,
                    paymentFrequency: formData.paymentFrequency,
                  });

                  return (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Vehicle Price: ${selectedCar.price.toLocaleString()}</p>
                        <p className="text-gray-600">Down Payment: ${formData.downPayment.toLocaleString()}</p>
                        <p className="text-gray-600">Financed Amount: ${loanDetails.financedAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          {formData.paymentFrequency.charAt(0).toUpperCase() + formData.paymentFrequency.slice(1)} Payment: ${loanDetails.paymentAmount.toLocaleString()}
                        </p>
                        <p className="text-gray-600">Total Payments: {loanDetails.totalPayments}</p>
                        <p className="text-gray-600">Total Interest: ${loanDetails.totalInterest.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={!selectedCar || !formData.clientId}
            >
              Create Sale
            </button>
          </div>
        </form>
      </div>

      {/* Nested Client Form Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <ClientForm
            onSubmit={handleClientCreated}
            onClose={() => setShowClientForm(false)}
          />
        </div>
      )}
    </div>
  );
}