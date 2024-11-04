import React, { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { useCars, useClients, useSales, usePayments } from '../../hooks/useDatabase';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import CustomerReport from './CustomerReport';
import ProfitReport from './ProfitReport';
import DateRangePicker from './DateRangePicker';

type ReportType = 'sales' | 'inventory' | 'customers' | 'profit';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('sales');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { cars } = useCars();
  const { clients } = useClients();
  const { sales } = useSales();
  const { payments } = usePayments();

  const reportComponents = {
    sales: SalesReport,
    inventory: InventoryReport,
    customers: CustomerReport,
    profit: ProfitReport,
  };

  const ReportComponent = reportComponents[selectedReport];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports</h2>
        <div className="flex gap-4">
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value as ReportType)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="customers">Customer Report</option>
            <option value="profit">Profit Report</option>
          </select>
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onDateChange={setDateRange}
          />
        </div>
      </div>

      <ReportComponent
        cars={cars}
        clients={clients}
        sales={sales}
        payments={payments}
        dateRange={dateRange}
      />
    </div>
  );
}