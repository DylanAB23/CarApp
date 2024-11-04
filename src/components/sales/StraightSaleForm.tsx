import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Car, Client } from '../../types';
import ClientForm from '../clients/ClientForm';

interface StraightSaleFormProps {
  car: Car;
  clients: Client[];
  onSubmit: (saleData: any) => void;
  onClose: () => void;
  onClientAdded?: (client: Client) => void;
}

type PaymentMethod = 'cash' | 'card' | 'check' | 'bank_transfer' | 'external_finance';

export default function StraightSaleForm({ car, clients, onSubmit, onClose, onClientAdded }: StraightSaleFormProps) {
  const [showClientForm, setShowClientForm] = useState(false);
  const [formData, setFormData] = useState({
    carId: car.id,
    clientId: '',
    salePrice: car.price,
    paymentMethod: 'cash' as PaymentMethod,
    externalFinanceDetails: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: new Date().toISOString(),
      status: 'completed'
    });
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Straight Sale</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Vehicle Details</h3>
            <p className="text-sm text-gray-600">
              {car.year} {car.make} {car.model}
            </p>
            <p className="text-sm text-gray-600">
              Stock #: {car.stockNumber}
            </p>
          </div>

          {/* Client Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Select Client</label>
              <button
                type="button"
                onClick={() => setShowClientForm(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add New Client
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

          {/* Sale Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Sale Price</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min={0}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="check">Check</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="external_finance">External Financing</option>
            </select>
          </div>

          {/* External Finance Details */}
          {formData.paymentMethod === 'external_finance' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Finance Details</label>
              <textarea
                value={formData.externalFinanceDetails}
                onChange={(e) => setFormData({ ...formData, externalFinanceDetails: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter financing company details, terms, etc."
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add any additional notes about the sale..."
            />
          </div>

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
            >
              Complete Sale
            </button>
          </div>
        </form>
      </div>

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