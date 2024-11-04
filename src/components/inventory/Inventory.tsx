import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Car, Client, Sale } from '../../types';
import { useCars, useClients, useSales } from '../../hooks/useDatabase';
import CarCard from './CarCard';
import CarForm from './CarForm';
import StraightSaleForm from '../sales/StraightSaleForm';
import BHPHSaleForm from '../sales/BHPHSaleForm';

type TabType = 'inStock' | 'sold';

export default function Inventory() {
  const { cars, addCar, updateCar, deleteCar } = useCars();
  const { clients, addClient } = useClients();
  const { sales, addSale, deleteSale } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<TabType>('inStock');
  const [showCarForm, setShowCarForm] = useState(false);
  const [showStraightSaleForm, setShowStraightSaleForm] = useState(false);
  const [showBHPHSaleForm, setShowBHPHSaleForm] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | undefined>();
  const [error, setError] = useState<string | null>(null);

  const filteredCars = cars.filter((car) => {
    const matchesSearch = `${car.make} ${car.model} ${car.year}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesTab = selectedTab === 'inStock' 
      ? car.status === 'available' || car.status === 'pending'
      : car.status === 'sold';

    return matchesSearch && matchesTab;
  });

  const handleAddCar = async (newCar: Omit<Car, 'id'>) => {
    try {
      await addCar(newCar);
      setShowCarForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to add car. Please try again.');
    }
  };

  const handleEditCar = async (updatedCar: Car) => {
    try {
      await updateCar(updatedCar.id, updatedCar);
      setSelectedCar(undefined);
      setShowCarForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to update car. Please try again.');
    }
  };

  const handleDeleteCar = async (id: string) => {
    try {
      await deleteCar(id);
      setError(null);
    } catch (err) {
      setError('Failed to delete car. Please try again.');
    }
  };

  const handleCreateSale = (car: Car, type: 'straight' | 'bhph') => {
    setSelectedCar(car);
    if (type === 'straight') {
      setShowStraightSaleForm(true);
      setShowBHPHSaleForm(false);
    } else {
      setShowBHPHSaleForm(true);
      setShowStraightSaleForm(false);
    }
    setError(null);
  };

  const handleSaleSubmit = async (saleData: Omit<Sale, 'id' | 'status'>) => {
    try {
      if (!selectedCar) {
        throw new Error('No car selected');
      }

      if (!saleData.clientId || !saleData.salePrice || !saleData.startDate) {
        throw new Error('Missing required sale information');
      }

      const newSale = {
        ...saleData,
        carId: selectedCar.id,
        status: 'active' as const
      };

      await addSale(newSale);
      await updateCar(selectedCar.id, { status: 'sold' });

      setShowStraightSaleForm(false);
      setShowBHPHSaleForm(false);
      setSelectedCar(undefined);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sale';
      setError(errorMessage);
      console.error('Error creating sale:', err);
    }
  };

  const handleClientAdded = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      const newClient = await addClient(clientData);
      setError(null);
      return newClient;
    } catch (err) {
      setError('Failed to add client. Please try again.');
      throw err;
    }
  };

  const handleToggleStatus = async (car: Car) => {
    try {
      const carSales = sales.filter(sale => sale.carId === car.id);
      
      for (const sale of carSales) {
        await deleteSale(sale.id);
      }

      await updateCar(car.id, { status: 'available' });
      setError(null);
    } catch (err) {
      setError('Failed to update car status. Please try again.');
    }
  };

  const tabStyle = (tab: TabType) => `
    px-4 py-2 text-sm font-medium rounded-lg
    ${selectedTab === tab ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
  `;

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Car Inventory</h2>
        <button
          onClick={() => setShowCarForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add New Car
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            className={tabStyle('inStock')}
            onClick={() => setSelectedTab('inStock')}
          >
            In Stock ({cars.filter(c => c.status === 'available' || c.status === 'pending').length})
          </button>
          <button
            className={tabStyle('sold')}
            onClick={() => setSelectedTab('sold')}
          >
            Sold ({cars.filter(c => c.status === 'sold').length})
          </button>
        </div>

        <div className="w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search cars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onEdit={(car) => {
              setSelectedCar(car);
              setShowCarForm(true);
            }}
            onDelete={handleDeleteCar}
            onCreateSale={handleCreateSale}
            onToggleStatus={handleToggleStatus}
          />
        ))}

        {filteredCars.length === 0 && (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {searchTerm 
                ? 'No cars found matching your search'
                : selectedTab === 'inStock'
                  ? 'No cars currently in stock'
                  : 'No sold cars'
              }
            </p>
          </div>
        )}
      </div>

      {showCarForm && (
        <CarForm
          car={selectedCar}
          onSubmit={selectedCar ? handleEditCar : handleAddCar}
          onClose={() => {
            setShowCarForm(false);
            setSelectedCar(undefined);
            setError(null);
          }}
        />
      )}

      {showStraightSaleForm && selectedCar && (
        <StraightSaleForm
          car={selectedCar}
          clients={clients}
          onSubmit={handleSaleSubmit}
          onClose={() => {
            setShowStraightSaleForm(false);
            setSelectedCar(undefined);
            setError(null);
          }}
          onClientAdded={handleClientAdded}
        />
      )}

      {showBHPHSaleForm && selectedCar && (
        <BHPHSaleForm
          car={selectedCar}
          clients={clients}
          onSubmit={handleSaleSubmit}
          onClose={() => {
            setShowBHPHSaleForm(false);
            setSelectedCar(undefined);
            setError(null);
          }}
          onClientAdded={handleClientAdded}
        />
      )}
    </div>
  );
}