import React from 'react';
import { Download } from 'lucide-react';
import { Car, Client, Sale, Payment } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';

interface CustomerReportProps {
  cars: Car[];
  clients: Client[];
  sales: Sale[];
  payments: Payment[];
  dateRange: { start: string; end: string };
}

export default function CustomerReport({ cars, clients, sales, payments }: CustomerReportProps) {
  // Filter out sales with deleted cars
  const validSales = sales.filter(sale => {
    const car = cars.find(c => c.id === sale.carId);
    return car !== undefined;
  });

  const getCustomerStats = (client: Client) => {
    const customerSales = validSales.filter(sale => sale.clientId === client.id);
    const totalPurchases = customerSales.length;
    const activeSales = customerSales.filter(sale => sale.status === 'active').length;
    
    const totalOwed = customerSales.reduce((sum, sale) => {
      const salePayments = payments.filter(p => p.saleId === sale.id && p.status === 'paid');
      const paidAmount = salePayments.reduce((total, payment) => total + payment.amount, 0);
      return sum + (sale.salePrice - paidAmount);
    }, 0);

    return { totalPurchases, activeSales, totalOwed };
  };

  const handleExport = () => {
    const data = clients.map(client => {
      const stats = getCustomerStats(client);
      return {
        'Name': client.name,
        'Email': client.email,
        'Phone': client.phone,
        'Credit Rating': client.creditRating,
        'Total Purchases': stats.totalPurchases,
        'Active Sales': stats.activeSales,
        'Total Outstanding': stats.totalOwed,
      };
    });

    exportToCSV(data, 'customer-report');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Customer Report</h3>
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
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credit Rating
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Purchases
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active Sales
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Outstanding Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => {
              const stats = getCustomerStats(client);
              
              return (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{client.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      <div>{client.email}</div>
                      <div>{client.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.creditRating === 'A' ? 'bg-green-100 text-green-800' :
                      client.creditRating === 'B' ? 'bg-blue-100 text-blue-800' :
                      client.creditRating === 'C' ? 'bg-yellow-100 text-yellow-800' :
                      client.creditRating === 'D' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {client.creditRating}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {stats.totalPurchases}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {stats.activeSales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    ${stats.totalOwed.toLocaleString()}
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