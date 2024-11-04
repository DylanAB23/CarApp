import { Car, DashboardStats, RecentActivity } from '../types';

export const cars: Car[] = [
  {
    id: 'car-001',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    price: 25000,
    mileage: 35000,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800',
  },
  {
    id: 'car-002',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 22000,
    mileage: 28000,
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&w=800',
  },
  {
    id: 'car-003',
    make: 'Tesla',
    model: 'Model 3',
    year: 2022,
    price: 45000,
    mileage: 15000,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800',
  },
];

export const dashboardStats: DashboardStats = {
  totalCars: 25,
  availableCars: 15,
  soldCars: 8,
  pendingCars: 2,
  totalRevenue: 750000,
  monthlyRevenue: 125000,
  activeLoans: 12,
  overduePayments: 3,
};

export const recentActivity: RecentActivity[] = [
  {
    id: 'act-001',
    type: 'sale',
    description: 'Tesla Model 3 sold to John Smith',
    date: '2024-03-15',
    amount: 45000,
  },
  {
    id: 'act-002',
    type: 'payment',
    description: 'Loan payment received from Sarah Johnson',
    date: '2024-03-14',
    amount: 550,
  },
  {
    id: 'act-003',
    type: 'inventory',
    description: 'New Honda Civic added to inventory',
    date: '2024-03-13',
  },
];