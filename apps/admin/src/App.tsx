import { Routes, Route } from 'react-router-dom';
import AdminLoginPage from './pages/AdminLoginPage/AdminLoginPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLoginPage />} />
      <Route path="/login" element={<AdminLoginPage />} />
      {/* Dashboard and other admin routes will be added here */}
      <Route path="/dashboard" element={<div>Admin Dashboard - Coming Soon</div>} />
    </Routes>
  );
}

export default App;
