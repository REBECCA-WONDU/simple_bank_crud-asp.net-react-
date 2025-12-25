import { useState } from 'react';
import HomePage from './components/HomePage';
import CustomerDashboard from './components/CustomerDashboard';
import BankerDashboard from './components/BankerDashboard';
import { Customer } from './types/customer';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'customer' | 'banker'>('home');
  // Centralized state can be kept for Banker, but Customer dashboard manages its own "Login" state.
  // We can keep it simple: App holds Banker customers, CustomerDashboard holds its own.
  // Actually, BankerDashboard expects `customers` prop. Let's keep it for Banker, but separate for Customer.
  const [bankerCustomers, setBankerCustomers] = useState<Customer[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'home' && <HomePage onSelectRole={setCurrentPage} />}
      {currentPage === 'customer' && (
        <CustomerDashboard
          onBack={() => setCurrentPage('home')}
        />
      )}
      {currentPage === 'banker' && (
        <BankerDashboard
          onBack={() => setCurrentPage('home')}
          customers={bankerCustomers}
          setCustomers={setBankerCustomers}
        />
      )}
    </div>
  );
}

export default App;
