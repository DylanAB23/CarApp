import React from 'react';
import { Download } from 'lucide-react';
import { Car, Client, Sale, Payment } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';

interface SalesReportProps {
  cars: Car[];
  clients: Client[];
  sales: Sale[];
  payments: Payment[];
  dateRange: { start: string; end: string };
}

export default function SalesReport({ cars, clients, sales, payments, dateRange }: SalesReportProps) {
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

  const handleExport = () => {
    const data = filteredSales.map(sale => {
      const car = cars.find(c => c.id === sale.carId);
      const client = clients.find(c => c.id === sale.clientId);
      const salePayments = payments.filter(p => p.saleId === sale.id && p.status === 'paid');
      const totalPaid = salePayments.reduce((sum, p) => sum + p.amount, 0);

      return {
        'Sale Date': new Date(sale.startDate).toLocaleDateString(),
        'Customer': client?.name || '',
        'Vehicle': `${car?.year} ${car?.make} ${car?.model}`,
        'Sale Price': sale.salePrice,
        'Down Payment': sale.downPayment,
        'Amount Financed': sale.financedAmount,
        'Total Paid': totalPaid,
        'Status': sale.status,
      };
    });

    exportToCSV(data, 'sales-report');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sales Report</h3>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
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
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSales.map((sale) => {
              const car = cars.find(c => c.id === sale.carId);
              const client = clients.find(c => c.id === sale.clientId);
              
              if (!car || !client) return null;
              
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sale.status === 'active' ? 'bg-green-100 text-green-800' :
                      sale.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </span>
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