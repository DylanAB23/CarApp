import React, { useState } from 'react';
import { Car } from '../../types';
import { Edit, Trash2, DollarSign, RefreshCw } from 'lucide-react';
import MarkAvailableModal from './MarkAvailableModal';

interface CarCardProps {
  car: Car;
  onEdit: (car: Car) => void;
  onDelete: (id: string) => void;
  onCreateSale: (car: Car, type: 'straight' | 'bhph') => void;
  onToggleStatus: (car: Car) => void;
}

export default function CarCard({ car, onEdit, onDelete, onCreateSale, onToggleStatus }: CarCardProps) {
  const [showMarkAvailableModal, setShowMarkAvailableModal] = useState(false);

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    sold: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  const profit = car.price - car.purchasePrice;
  const profitMargin = ((profit / car.purchasePrice) * 100).toFixed(1);

  const handleMarkAvailable = () => {
    setShowMarkAvailableModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {car.make} {car.model}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{car.vehicleType}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[car.status]}`}>
                {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
              </span>
              <button
                onClick={() => onDelete(car.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2 text-gray-600">
            <p>Year: {car.year}</p>
            <p>Purchase Price: ${car.purchasePrice.toLocaleString()}</p>
            <p>Selling Price: ${car.price.toLocaleString()}</p>
            <p>Potential Profit: ${profit.toLocaleString()} ({profitMargin}%)</p>
            <p>Mileage: {car.mileage.toLocaleString()} miles</p>
          </div>
          
          <div className="mt-4 flex flex-col gap-2">
            {car.status === 'available' ? (
              <>
                <button
                  onClick={() => onCreateSale(car, 'straight')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <DollarSign className="w-5 h-5" />
                  Straight Sale
                </button>
                <button
                  onClick={() => onCreateSale(car, 'bhph')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <DollarSign className="w-5 h-5" />
                  Buy Here Pay Here
                </button>
              </>
            ) : car.status === 'sold' ? (
              <button
                onClick={handleMarkAvailable}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Mark as Available
              </button>
            ) : null}
            
            <button
              onClick={() => onEdit(car)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Edit Details
            </button>
          </div>
        </div>
      </div>

      {showMarkAvailableModal && (
        <MarkAvailableModal
          onConfirm={() => {
            onToggleStatus(car);
            setShowMarkAvailableModal(false);
          }}
          onClose={() => setShowMarkAvailableModal(false)}
        />
      )}
    </>
  );
}