import React from 'react';
import { Download } from 'lucide-react';
import { Car, Client, Sale, Payment } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';

interface InventoryReportProps {
  cars: Car[];
  clients: Client[];
  sales: Sale[];
  payments: Payment[];
  dateRange: { start: string; end: string };
}

export default function InventoryReport({ cars, sales }: InventoryReportProps) {
  const getCarStats = (car: Car) => {
    const carSales = sales.filter(sale => sale.carId === car.id);
    const purchaseDate = car.purchaseDate ? new Date(car.purchaseDate) : new Date();
    const daysInInventory = car.status === 'available' 
      ? Math.floor((new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    const profit = (car.price || 0) - (car.purchasePrice || 0);
    const profitMargin = car.purchasePrice 
      ? ((profit / car.purchasePrice) * 100).toFixed(1)
      : '0.0';

    return {
      daysInInventory: isNaN(daysInInventory) ? 0 : daysInInventory,
      profit: isNaN(profit) ? 0 : profit,
      profitMargin: isNaN(parseFloat(profitMargin)) ? '0.0' : profitMargin
    };
  };

  const handleExport = () => {
    const data = cars.map(car => {
      const stats = getCarStats(car);
      return {
        'Vehicle': `${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim(),
        'Type': car.vehicleType || 'Unknown',
        'Status': car.status || 'Unknown',
        'Purchase Price': car.purchasePrice || 0,
        'Selling Price': car.price || 0,
        'Potential Profit': stats.profit,
        'Profit Margin': `${stats.profitMargin}%`,
        'Days in Inventory': stats.daysInInventory,
        'Mileage': car.mileage || 0
      };
    });

    exportToCSV(data, 'inventory-report');
  };

  const totalStats = cars.reduce((acc, car) => {
    const stats = getCarStats(car);
    return {
      totalValue: acc.totalValue + (car.price || 0),
      totalCost: acc.totalCost + (car.purchasePrice || 0),
      totalProfit: acc.totalProfit + stats.profit,
      availableCount: acc.availableCount + (car.status === 'available' ? 1 : 0),
      soldCount: acc.soldCount + (car.status === 'sold' ? 1 : 0),
      pendingCount: acc.pendingCount + (car.status === 'pending' ? 1 : 0)
    };
  }, {
    totalValue: 0,
    totalCost: 0,
    totalProfit: 0,
    availableCount: 0,
    soldCount: 0,
    pendingCount: 0
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Inventory Report</h3>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm text-gray-500">Inventory Value</h4>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {cars.length} Total Vehicles
            </span>
          </div>
          <p className="text-2xl font-bold">${totalStats.totalValue.toLocaleString()}</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Available</p>
              <p className="font-medium">{totalStats.availableCount}</p>
            </div>
            <div>
              <p className="text-gray-500">Pending</p>
              <p className="font-medium">{totalStats.pendingCount}</p>
            </div>
            <div>
              <p className="text-gray-500">Sold</p>
              <p className="font-medium">{totalStats.soldCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm text-gray-500 mb-2">Total Investment</h4>
          <p className="text-2xl font-bold">${totalStats.totalCost.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">Purchase cost of all vehicles</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm text-gray-500 mb-2">Potential Profit</h4>
          <p className="text-2xl font-bold text-green-600">
            ${totalStats.totalProfit.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Based on current selling prices
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purchase Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Selling Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit Margin
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days in Stock
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cars.map((car) => {
              const stats = getCarStats(car);
              const mileage = car.mileage || 0;
              
              return (
                <tr key={car.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {[car.year, car.make, car.model].filter(Boolean).join(' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {mileage.toLocaleString()} miles
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {car.vehicleType || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      car.status === 'available' ? 'bg-green-100 text-green-800' :
                      car.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {(car.status || 'Unknown').charAt(0).toUpperCase() + (car.status || 'Unknown').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ${(car.purchasePrice || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ${(car.price || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-medium ${
                      parseFloat(stats.profitMargin) > 20 ? 'text-green-600' :
                      parseFloat(stats.profitMargin) > 10 ? 'text-blue-600' :
                      'text-gray-900'
                    }`}>
                      {stats.profitMargin}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {stats.daysInInventory}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}