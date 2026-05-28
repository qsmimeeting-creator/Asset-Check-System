import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import ScanQR from './pages/ScanQR';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isSupabaseConfigured } from './lib/api';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const dbConfigured = isSupabaseConfigured();

  // If DB is not configured, we allow access to mock mode
  if (!dbConfigured) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const dbConfigured = isSupabaseConfigured();

  if (loading && dbConfigured) return null;

  const isAdmin = user?.role === 'Super Admin' || user?.role === 'Admin' || !dbConfigured;
  
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function Home() {
  const { user } = useAuth();
  if (user?.role === 'User') {
    return <Navigate to="/assets" replace />;
  }
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route 
                      path="/" 
                      element={<Home />} 
                    />
                    <Route path="/assets" element={<Assets />} />
                    <Route path="/assets/:id" element={<AssetDetail />} />
                    <Route path="/scan" element={<ScanQR />} />
                    <Route 
                      path="/reports" 
                      element={
                        <AdminRoute>
                          <Reports /> 
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/users" 
                      element={
                        <AdminRoute>
                          <Users /> 
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <AdminRoute>
                          <Settings /> 
                        </AdminRoute>
                      } 
                    />
                    <Route path="*" element={<div className="p-8 text-center text-slate-500">ไม่พบหน้านี้</div>} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
