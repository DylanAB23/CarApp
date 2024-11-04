import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Inventory from './components/inventory/Inventory';
import Clients from './components/clients/Clients';
import Sales from './components/sales/Sales';
import Payments from './components/payments/Payments';
import Reports from './components/reports/Reports';
import Login from './components/auth/Login';
import { useAuth } from './hooks/useAuth';

function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const { isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      if (isAuth !== isAuthenticated) {
        window.location.reload();
      }
    };

    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onLogout={logout}
      />
      <main className="flex-1 ml-64">
        <div className="p-4">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'inventory' && <Inventory />}
          {currentPage === 'clients' && <Clients />}
          {currentPage === 'sales' && <Sales />}
          {currentPage === 'payments' && <Payments />}
          {currentPage === 'reports' && <Reports />}
        </div>
      </main>
    </div>
  );
}

export default App;