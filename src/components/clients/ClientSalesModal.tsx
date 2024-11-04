import React from 'react';
import { X, Car, Calendar, DollarSign } from 'lucide-react';
import { Client, Sale } from '../../types';
import { useCars, usePayments } from '../../hooks/useDatabase';

interface ClientSalesModalProps {
  client: Client;
  sales: Sale[];
  onClose: () => void;
}

export default function ClientSalesModal({ client, sales, onClose }: ClientSalesModalProps) {
  const { cars } = useCars();
  const { payments } = usePayments();

  const getSaleDetails = (sale: Sale) => {
    const car = cars.find(c => c.id === sale.carId);
    const salePayments = payments.filter(p => p.saleId === sale.id && p.status === 'paid');
    const totalPaid = salePayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = sale.salePrice - totalPaid;
    const progress = (totalPaid / sale.salePrice) * 100;

    return { car, totalPaid, remainingAmount, progress };
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    defaulted: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const totalOwed = sales.reduce((sum, sale) => {
    const { remainingAmount } = getSaleDetails(sale);
    return sum + remainingAmount;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Sales History</h2>
            <p className="text-sm text-gray-600">Client: {client.name}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-2">Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-lg font-semibold">{sales.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Sales</p>
              <p className="text-lg font-semibold">
                {sales.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Outstanding</p>
              <p className="text-lg font-semibold">${totalOwed.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {sales.map((sale) => {
            const { car, totalPaid, remainingAmount, progress } = getSaleDetails(sale);
            if (!car) return null;

            return (
              <div key={sale.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-gray-600" />
                    <div>
                      <h3 className="font-medium">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(sale.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[sale.status]}`}>
                    {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Sale Price</p>
                    <p className="font-medium">${sale.salePrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Paid to Date</p>
                    <p className="font-medium text-green-600">${totalPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remaining</p>
                    <p className="font-medium text-blue-600">${remainingAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}