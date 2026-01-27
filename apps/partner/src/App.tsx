import { Routes, Route } from 'react-router-dom';
import PartnerLoginPage from './pages/PartnerLoginPage/PartnerLoginPage';
import PartnerDashboard from './pages/PartnerDashboard/PartnerDashboard';
import RestaurantSelectionPage from './pages/RestaurantSelection/RestaurantSelectionPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import RestaurantProfilePage from './pages/RestaurantProfile/RestaurantProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PartnerLoginPage />} />
      <Route path="/login" element={<PartnerLoginPage />} />
      <Route path="/dashboard" element={<PartnerDashboard />} />
      <Route path="/dashboard/profile" element={<RestaurantProfilePage />} />
      <Route path="/dashboard/menu" element={<PartnerDashboard />} />
      <Route path="/dashboard/orders" element={<PartnerDashboard />} />
      <Route path="/dashboard/reviews" element={<PartnerDashboard />} />
      <Route path="/dashboard/settings" element={<PartnerDashboard />} />
      <Route path="/restaurant-selection" element={<RestaurantSelectionPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
