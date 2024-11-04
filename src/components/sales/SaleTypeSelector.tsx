import React from 'react';
import { CreditCard, Calculator } from 'lucide-react';

interface SaleTypeSelectorProps {
  onSelect: (type: 'straight' | 'bhph') => void;
  onClose: () => void;
}

export default function SaleTypeSelector({ onSelect, onClose }: SaleTypeSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <h2 className="text-xl font-bold mb-6">Select Sale Type</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => onSelect('straight')}
            className="flex flex-col items-center gap-4 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="p-4 bg-blue-100 rounded-full">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Straight Sale</h3>
              <p className="text-sm text-gray-600">
                One-time payment via cash, card, or external financing
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelect('bhph')}
            className="flex flex-col items-center gap-4 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="p-4 bg-blue-100 rounded-full">
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Buy Here Pay Here</h3>
              <p className="text-sm text-gray-600">
                In-house financing with payment plans and credit checks
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}