import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './store/AuthContext';
import { CartProvider } from './store/CartContext';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage from './pages/MyOrdersPage';
import MyReservationsPage from './pages/MyReservationsPage';
import RestaurantDashboard from './pages/RestaurantDashboard';
import ReviewPage from './pages/ReviewPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={styles.loading}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const PartnerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'RESTAURANT_PARTNER') return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order/:id/track" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
        <Route path="/reservations" element={<ProtectedRoute><MyReservationsPage /></ProtectedRoute>} />
        <Route path="/order/:id/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<PartnerRoute><RestaurantDashboard /></PartnerRoute>} />
      </Routes>
    </>
  );
}

const styles = {
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 18 }
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-right" />
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
