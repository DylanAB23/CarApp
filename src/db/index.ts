import Dexie, { type Table } from 'dexie';
import type { Car, Client, Sale, Payment } from '../types';

export class CarDealerDB extends Dexie {
  cars!: Table<Car>;
  clients!: Table<Client>;
  sales!: Table<Sale>;
  payments!: Table<Payment>;

  constructor() {
    super('CarDealerDB');
    
    // Define database schema with proper indexes
    this.version(1).stores({
      cars: '++id, make, model, year, price, mileage, status',
      clients: '++id, name, email, phone, createdAt',
      sales: '++id, carId, clientId, salePrice, startDate, status',
      payments: '++id, saleId, dueDate, paidDate, status'
    });

    // Define table hooks after schema is set
    this.cars.hook('creating', (primKey, obj) => {
      if (!obj.id) obj.id = `car-${Date.now()}`;
      return obj;
    });

    this.clients.hook('creating', (primKey, obj) => {
      if (!obj.id) obj.id = `client-${Date.now()}`;
      if (!obj.createdAt) obj.createdAt = new Date().toISOString();
      return obj;
    });

    this.sales.hook('creating', (primKey, obj) => {
      if (!obj.id) obj.id = `sale-${Date.now()}`;
      if (!obj.startDate) obj.startDate = new Date().toISOString();
      if (!obj.status) obj.status = 'active';
      return obj;
    });

    this.payments.hook('creating', (primKey, obj) => {
      if (!obj.id) obj.id = `payment-${Date.now()}`;
      return obj;
    });
  }

  async getDashboardStats() {
    try {
      const [
        totalCars,
        availableCars,
        soldCars,
        pendingCars,
        activeLoans,
        overduePayments
      ] = await Promise.all([
        this.cars.count(),
        this.cars.where('status').equals('available').count(),
        this.cars.where('status').equals('sold').count(),
        this.cars.where('status').equals('pending').count(),
        this.sales.where('status').equals('active').count(),
        this.payments.where('status').equals('overdue').count()
      ]);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthlyRevenue = await this.payments
        .where('paidDate')
        .above(monthStart.toISOString())
        .toArray()
        .then(payments => payments.reduce((sum, p) => sum + p.amount, 0));

      const totalRevenue = await this.payments
        .where('status')
        .equals('paid')
        .toArray()
        .then(payments => payments.reduce((sum, p) => sum + p.amount, 0));

      return {
        totalCars,
        availableCars,
        soldCars,
        pendingCars,
        totalRevenue,
        monthlyRevenue,
        activeLoans,
        overduePayments
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalCars: 0,
        availableCars: 0,
        soldCars: 0,
        pendingCars: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeLoans: 0,
        overduePayments: 0
      };
    }
  }

  async getRecentActivity() {
    try {
      const activities = await Promise.all([
        this.sales
          .orderBy('startDate')
          .reverse()
          .limit(5)
          .toArray()
          .then(sales => sales.map(sale => ({
            id: sale.id,
            type: 'sale' as const,
            description: `New sale created`,
            date: sale.startDate,
            amount: sale.salePrice
          }))),
        this.payments
          .where('status')
          .equals('paid')
          .reverse()
          .limit(5)
          .toArray()
          .then(payments => payments.map(payment => ({
            id: payment.id,
            type: 'payment' as const,
            description: 'Payment received',
            date: payment.paidDate!,
            amount: payment.amount
          })))
      ]);

      return activities
        .flat()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  async deleteSale(saleId: string) {
    try {
      await this.transaction('rw', [this.sales, this.payments], async () => {
        await this.payments.where('saleId').equals(saleId).delete();
        await this.sales.delete(saleId);
      });
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw new Error('Failed to delete sale and associated payments');
    }
  }

  async deletePayment(paymentId: string) {
    try {
      await this.payments.delete(paymentId);
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw new Error('Failed to delete payment');
    }
  }
}

// Initialize database
export const db = new CarDealerDB();