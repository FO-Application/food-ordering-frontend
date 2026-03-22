import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLoginPage from './pages/AdminLoginPage/AdminLoginPage';
import AdminLayout from './components/AdminLayout/AdminLayout';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import UsersPage from './pages/UsersPage/UsersPage';
import RestaurantsPage from './pages/RestaurantsPage/RestaurantsPage';
import OrdersPage from './pages/OrdersPage/OrdersPage';
import TransactionsPage from './pages/TransactionsPage/TransactionsPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<AdminLoginPage />} />
      
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
