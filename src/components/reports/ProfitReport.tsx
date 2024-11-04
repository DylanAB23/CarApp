import React from 'react';
import { Download } from 'lucide-react';
import { Car, Client, Sale, Payment } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';

interface ProfitReportProps {
  cars: Car[];
  clients: Client[];
  sales: Sale[];
  payments: Payment[];
  dateRange: { start: string; end: string };
}

export default function ProfitReport({ cars, clients, sales, payments, dateRange }: ProfitReportProps) {
  // Filter out deleted sales and apply date range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.startDate);
    const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
    const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
    const car = cars.find(c => c.id === sale.carId);
    const client = clients.find(c => c.id === sale.clientId);
    
    // Only include sales that have valid car and client references
    return car && client && saleDate >= startDate && saleDate <= endDate;
  });

  const calculateProfit = (sale: Sale) => {
    const car = cars.find(c => c.id === sale.carId);
    if (!car) return { vehicleProfit: 0, interestCollected: 0, totalProfit: 0 };
    
    const vehicleProfit = sale.salePrice - car.purchasePrice;
    const salePayments = payments.filter(p => p.saleId === sale.id && p.status === 'paid');
    const interestCollected = salePayments.reduce((sum, p) => sum + p.amount, 0) - sale.financedAmount;
    
    return {
      vehicleProfit,
      interestCollected,
      totalProfit: vehicleProfit + interestCollected
    };
  };

  const totalStats = filteredSales.reduce((acc, sale) => {
    const car = cars.find(c => c.id === sale.carId);
    if (!car) return acc;

    const profit = calculateProfit(sale);
    return {
      totalRevenue: acc.totalRevenue + sale.salePrice,
      totalCost: acc.totalCost + car.purchasePrice,
      totalProfit: acc.totalProfit + profit.totalProfit,
      totalInterest: acc.totalInterest + profit.interestCollected
    };
  }, {
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalInterest: 0
  });

  const handleExport = () => {
    const data = filteredSales.map(sale => {
      const car = cars.find(c => c.id === sale.carId);
      const client = clients.find(c => c.id === sale.clientId);
      if (!car || !client) return null;

      const profit = calculateProfit(sale);

      return {
        'Date': new Date(sale.startDate).toLocaleDateString(),
        'Customer': client.name,
        'Vehicle': `${car.year} ${car.make} ${car.model}`,
        'Sale Price': sale.salePrice,
        'Purchase Cost': car.purchasePrice,
        'Vehicle Profit': profit.vehicleProfit,
        'Interest Collected': profit.interestCollected,
        'Total Profit': profit.totalProfit
      };
    }).filter(Boolean);

    exportToCSV(data, 'profit-report');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Profit Report</h3>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm text-gray-500">Total Revenue</h4>
          <p className="text-2xl font-bold">${totalStats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm text-gray-500">Total Cost</h4>
          <p className="text-2xl font-bold">${totalStats.totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm text-gray-500">Total Interest</h4>
          <p className="text-2xl font-bold text-green-600">${totalStats.totalInterest.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm text-gray-500">Net Profit</h4>
          <p className="text-2xl font-bold text-blue-600">${totalStats.totalProfit.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sale Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle Profit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interest
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Profit
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSales.map((sale) => {
              const car = cars.find(c => c.id === sale.carId);
              const client = clients.find(c => c.id === sale.clientId);
              if (!car || !client) return null;

              const profit = calculateProfit(sale);
              
              return (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {`${car.year} ${car.make} ${car.model}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ${sale.salePrice.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ${profit.vehicleProfit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ${profit.interestCollected.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                    ${profit.totalProfit.toLocaleString()}
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