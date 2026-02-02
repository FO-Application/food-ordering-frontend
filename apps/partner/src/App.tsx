import { Routes, Route } from 'react-router-dom';
import PartnerLoginPage from './pages/PartnerLoginPage/PartnerLoginPage';
import PartnerDashboard from './pages/PartnerDashboard/PartnerDashboard';
import PartnerRegisterPage from './pages/PartnerRegisterPage/PartnerRegisterPage';
import RestaurantSelectionPage from './pages/RestaurantSelection/RestaurantSelectionPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import RestaurantProfilePage from './pages/RestaurantProfile/RestaurantProfilePage';
import MenuManagementPage from './pages/MenuManagement/MenuManagementPage';
import OrderManagementPage from './pages/OrderManagement/OrderManagementPage';
import ReviewManagementPage from './pages/ReviewManagement/ReviewManagementPage';
import SettingsPage from './pages/Settings/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PartnerLoginPage />} />
      <Route path="/login" element={<PartnerLoginPage />} />
      <Route path="/register" element={<PartnerRegisterPage />} />

      {/* Specific Dashboard Routes */}
      <Route path="/dashboard/menu" element={<MenuManagementPage />} />
      <Route path="/dashboard/profile" element={<RestaurantProfilePage />} />
      <Route path="/dashboard/orders" element={<OrderManagementPage />} />
      <Route path="/dashboard/reviews" element={<ReviewManagementPage />} />
      <Route path="/dashboard/settings" element={<SettingsPage />} />

      {/* Default Dashboard Route */}
      <Route path="/dashboard" element={<PartnerDashboard />} />

      <Route path="/restaurant-selection" element={<RestaurantSelectionPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;

