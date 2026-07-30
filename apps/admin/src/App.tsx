import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Categories } from './pages/Categories';
import { Products } from './pages/Products';
import { ImageGallery } from './pages/ImageGallery';
import { Variants } from './pages/Variants';
import { Inventory } from './pages/Inventory';
import { Orders } from './pages/Orders';
import { Discounts } from './pages/Discounts';
import { PosSync } from './pages/PosSync';
import { Staff } from './pages/Staff';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <AuthGuard>
                <AppShell />
              </AuthGuard>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/images" element={<ImageGallery />} />
            <Route path="/products/variants" element={<Variants />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/pos-sync" element={<PosSync />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
