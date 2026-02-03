import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import ShipperRegisterPage from './pages/RegisterPage/ShipperRegisterPage';
import VehicleRegistrationPage from './pages/VehicleRegistrationPage/VehicleRegistrationPage';
import ShipperDashboard from './pages/Dashboard/ShipperDashboard';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import EarningsPage from './pages/EarningsPage/EarningsPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = localStorage.getItem('shipper_authenticated') === 'true';
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<ShipperRegisterPage />} />
                <Route path="/vehicle-register" element={
                    <ProtectedRoute><VehicleRegistrationPage /></ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                    <ProtectedRoute><ShipperDashboard /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />
                <Route path="/history" element={
                    <ProtectedRoute><HistoryPage /></ProtectedRoute>
                } />
                <Route path="/earnings" element={
                    <ProtectedRoute><EarningsPage /></ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute><SettingsPage /></ProtectedRoute>
                } />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
