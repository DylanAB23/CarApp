import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Car, Client, Sale, Payment } from '../types';
import { isOverdue, generatePaymentSchedule } from '../utils/dateUtils';

export function useCars() {
  const cars = useLiveQuery(() => db.cars.toArray()) ?? [];

  const addCar = async (car: Omit<Car, 'id'>) => {
    const id = `car-${Date.now()}`;
    await db.cars.add({ ...car, id });
  };

  const updateCar = async (id: string, updates: Partial<Car>) => {
    await db.cars.update(id, updates);
  };

  const deleteCar = async (id: string) => {
    await db.cars.delete(id);
  };

  return { cars, addCar, updateCar, deleteCar };
}

export function useClients() {
  const clients = useLiveQuery(() => db.clients.toArray()) ?? [];

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    const id = `client-${Date.now()}`;
    await db.clients.add({
      ...client,
      id,
      createdAt: new Date().toISOString()
    });
  };

  const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
    await db.clients.where('id').equals(id).modify(updates);
  };

  const deleteClient = async (id: string) => {
    await db.clients.delete(id);
  };

  return { clients, addClient, updateClient, deleteClient };
}

export function useSales() {
  const sales = useLiveQuery(() => 
    db.sales
      .orderBy('startDate')
      .reverse()
      .toArray()
  ) ?? [];

  const addSale = async (saleData: Omit<Sale, 'id' | 'status'>) => {
    const id = `sale-${Date.now()}`;
    const sale = { 
      ...saleData, 
      id,
      status: 'active' as const
    };

    await db.transaction('rw', [db.sales, db.cars, db.payments], async () => {
      await db.sales.add(sale);
      await db.cars.update(sale.carId, { status: 'sold' });

      const schedule = generatePaymentSchedule(
        new Date(sale.firstPaymentDate),
        sale.paymentFrequency,
        sale.totalPayments,
        sale.paymentAmount
      );

      await db.payments.bulkAdd(
        schedule.map((payment, index) => ({
          ...payment,
          id: `payment-${id}-${index}`,
          saleId: id
        }))
      );
    });

    return sale;
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    await db.sales.update(id, updates);
  };

  const deleteSale = async (id: string) => {
    await db.transaction('rw', [db.sales, db.payments, db.cars], async () => {
      const sale = await db.sales.get(id);
      if (sale) {
        await db.cars.update(sale.carId, { status: 'available' });
        await db.payments.where('saleId').equals(id).delete();
        await db.sales.delete(id);
      }
    });
  };

  return { sales, addSale, updateSale, deleteSale };
}

export function usePayments() {
  const payments = useLiveQuery(() => 
    db.payments
      .orderBy('dueDate')
      .toArray()
      .then(payments => {
        return payments.map(payment => {
          if (payment.status === 'pending' && isOverdue(payment.dueDate)) {
            return { ...payment, status: 'overdue' };
          }
          return payment;
        });
      })
  ) ?? [];

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    const id = `payment-${Date.now()}`;
    await db.payments.add({ ...payment, id });
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    await db.payments.update(id, updates);
  };

  const deletePayment = async (id: string) => {
    await db.payments.delete(id);
  };

  return { payments, addPayment, updatePayment, deletePayment };
}

export function useDashboardStats() {
  const stats = useLiveQuery(async () => {
    const [cars, sales, payments] = await Promise.all([
      db.cars.toArray(),
      db.sales.toArray(),
      db.payments.toArray()
    ]);

    const totalCars = cars.length;
    const availableCars = cars.filter(car => car.status === 'available').length;
    const soldCars = cars.filter(car => car.status === 'sold').length;
    const pendingCars = cars.filter(car => car.status === 'pending').length;

    const activeLoans = sales.filter(sale => sale.status === 'active').length;
    
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyPayments = payments.filter(p => 
      p.status === 'paid' && 
      p.paidDate && 
      new Date(p.paidDate) >= monthStart
    );

    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const overduePayments = payments.filter(p => 
      p.status === 'pending' && isOverdue(p.dueDate)
    ).length;

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
  }) ?? {
    totalCars: 0,
    availableCars: 0,
    soldCars: 0,
    pendingCars: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeLoans: 0,
    overduePayments: 0
  };

  return stats;
}

export function useRecentActivity() {
  return useLiveQuery(async () => {
    const [recentSales, recentPayments] = await Promise.all([
      db.sales
        .orderBy('startDate')
        .reverse()
        .limit(5)
        .toArray(),
      db.payments
        .where('status')
        .equals('paid')
        .reverse()
        .limit(5)
        .toArray()
    ]);

    const activities = [
      ...recentSales.map(sale => ({
        id: `sale-${sale.id}`,
        type: 'sale' as const,
        description: `New sale created`,
        date: sale.startDate,
        amount: sale.salePrice
      })),
      ...recentPayments.map(payment => ({
        id: `payment-${payment.id}`,
        type: 'payment' as const,
        description: 'Payment received',
        date: payment.paidDate!,
        amount: payment.amount
      }))
    ];

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }) ?? [];
}