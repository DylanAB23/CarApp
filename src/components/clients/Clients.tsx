import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Client } from '../../types';
import { useClients } from '../../hooks/useDatabase';
import ClientCard from './ClientCard';
import ClientForm from './ClientForm';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();

  const filteredClients = clients.filter((client) =>
    `${client.name} ${client.email} ${client.phone}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleAddClient = async (newClient: Omit<Client, 'id' | 'createdAt'>) => {
    await addClient(newClient);
    setShowForm(false);
  };

  const handleEditClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    if (!selectedClient) return;
    await updateClient(selectedClient.id, clientData);
    setSelectedClient(undefined);
    setShowForm(false);
  };

  const handleDeleteClient = async (id: string) => {
    await deleteClient(id);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add New Client
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={(client) => {
              setSelectedClient(client);
              setShowForm(true);
            }}
            onDelete={handleDeleteClient}
          />
        ))}
      </div>

      {showForm && (
        <ClientForm
          client={selectedClient}
          onSubmit={selectedClient ? handleEditClient : handleAddClient}
          onClose={() => {
            setShowForm(false);
            setSelectedClient(undefined);
          }}
        />
      )}
    </div>
  );
}