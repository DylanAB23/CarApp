import React, { useState, useEffect } from 'react';
import { Car, VehicleType, VehicleCondition, TransmissionType, DriveTrainType } from '../../types';
import { X } from 'lucide-react';

interface CarFormProps {
  car?: Car;
  onSubmit: (car: Omit<Car, 'id'>) => void;
  onClose: () => void;
}

const vehicleTypes: { type: VehicleType; label: string }[] = [
  { type: 'sedan', label: 'Sedan' },
  { type: 'suv', label: 'SUV' },
  { type: 'truck', label: 'Truck' },
  { type: 'van', label: 'Van' },
  { type: 'coupe', label: 'Coupe' },
  { type: 'wagon', label: 'Wagon' },
  { type: 'convertible', label: 'Convertible' },
  { type: 'motorcycle', label: 'Motorcycle' },
];

const conditions: { value: VehicleCondition; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const transmissions: { value: TransmissionType; label: string }[] = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'cvt', label: 'CVT' },
];

const driveTrains: { value: DriveTrainType; label: string }[] = [
  { value: 'fwd', label: 'Front Wheel Drive' },
  { value: 'rwd', label: 'Rear Wheel Drive' },
  { value: 'awd', label: 'All Wheel Drive' },
  { value: '4wd', label: '4 Wheel Drive' },
];

const generateStockNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `STK${timestamp}`;
};

const defaultFormData = {
  stockNumber: generateStockNumber(),
  vin: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  price: 0,
  purchasePrice: 0,
  mileage: 0,
  status: 'available' as const,
  vehicleType: 'sedan' as VehicleType,
  condition: 'good' as VehicleCondition,
  bodyStyle: '',
  color: '',
  transmission: 'automatic' as TransmissionType,
  driveTrain: 'fwd' as DriveTrainType,
  notes: ''
};

export default function CarForm({ car, onSubmit, onClose }: CarFormProps) {
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (car) {
      // Ensure all fields have values when editing
      setFormData({
        ...defaultFormData,
        ...car
      });
    } else {
      // Reset to defaults for new car
      setFormData({
        ...defaultFormData,
        stockNumber: generateStockNumber()
      });
    }
  }, [car]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Generate years from next year back to 1950
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear + 1 - i);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'price' | 'purchasePrice') => {
    const value = parseInt(e.target.value.replace(/\D/g, '')) || 0;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatMileage = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/\D/g, '')) || 0;
    setFormData(prev => ({ ...prev, mileage: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{car ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Identification Section */}
            <div className="space-y-4 lg:col-span-3">
              <h3 className="font-medium text-gray-900 border-b pb-2">Vehicle Identification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Number</label>
                  <input
                    type="text"
                    value={formData.stockNumber}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                    disabled
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">VIN</label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    maxLength={17}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="space-y-4 lg:col-span-3">
              <h3 className="font-medium text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Make</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Details Section */}
            <div className="space-y-4 lg:col-span-3">
              <h3 className="font-medium text-gray-900 border-b pb-2">Vehicle Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value as VehicleType }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {vehicleTypes.map(({ type, label }) => (
                      <option key={type} value={type}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as VehicleCondition }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {conditions.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Body Style</label>
                  <input
                    type="text"
                    value={formData.bodyStyle}
                    onChange={(e) => setFormData(prev => ({ ...prev, bodyStyle: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value as TransmissionType }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {transmissions.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Drive Train</label>
                  <select
                    value={formData.driveTrain}
                    onChange={(e) => setFormData(prev => ({ ...prev, driveTrain: e.target.value as DriveTrainType }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {driveTrains.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="space-y-4 lg:col-span-3">
              <h3 className="font-medium text-gray-900 border-b pb-2">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      value={formatPrice(formData.purchasePrice)}
                      onChange={(e) => handlePriceChange(e, 'purchasePrice')}
                      className="block w-full pl-7 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      value={formatPrice(formData.price)}
                      onChange={(e) => handlePriceChange(e, 'price')}
                      className="block w-full pl-7 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mileage</label>
                  <input
                    type="text"
                    value={formatMileage(formData.mileage)}
                    onChange={handleMileageChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4 lg:col-span-3">
              <h3 className="font-medium text-gray-900 border-b pb-2">Additional Notes</h3>
              <div>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter any additional notes about the vehicle..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
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
              {car ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}