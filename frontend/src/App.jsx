import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { TenantProvider, useTenant } from './context/TenantContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Categories from './pages/Categories';
import Dishes from './pages/Dishes';
import Orders from './pages/Orders';
import CustomerMenu from './pages/CustomerMenu';
import AgencyPortal from './pages/AgencyPortal';
import Offers from './pages/Offers';
import QrCenter from './pages/QrCenter';
import LandingPage from './pages/LandingPage';
import LegalPages from './pages/LegalPages';

// Protected Route Wrapper for Restaurant Owners
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-2 p-6 text-slate-800">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin"></div>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Validating Session...</span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// SuperAdmin Protected Route for Agency / Freelancer
const SuperAdminRoute = ({ children }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-2 p-6 text-slate-800">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin"></div>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Checking Super Admin Privileges...</span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Dynamic Home Route: Domain-Aware Resolver
const DynamicHome = () => {
  const { isWhiteLabelTenant, tenantLoading } = useTenant();
  const { token, user, loading: authLoading } = useAuth();

  if (tenantLoading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 p-6 text-slate-800">
        <div className="w-9 h-9 rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin"></div>
        <span className="text-xs text-slate-500 font-medium">Resolving digital menu...</span>
      </div>
    );
  }

  // If visitor is on a custom domain (e.g. order.theburgerbar.com), show Customer Menu directly!
  if (isWhiteLabelTenant) {
    return <CustomerMenu />;
  }

  // On central host (localhost or main SaaS domain), always render the Landing Page!
  // If the user is logged in, the Landing Page navbar displays a direct "Go to Dashboard" button.
  return <LandingPage />;
};

const App = () => {
  return (
    <TenantProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* Domain-aware root / */}
              <Route path="/" element={<DynamicHome />} />
              <Route path="/home" element={<LandingPage />} />
              <Route path="/legal" element={<LegalPages />} />
              <Route path="/policies" element={<LegalPages />} />

              {/* Public Customer Menu (Explicit ID or Custom Domain) */}
              <Route path="/menu/:restaurantId" element={<CustomerMenu />} />

              {/* Auth Views */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Navigate to="/login" replace />} />
              <Route path="/signup" element={<Signup />} />

              {/* Freelancer / Agency Super-Admin Console */}
              <Route
                path="/agency"
                element={
                  <SuperAdminRoute>
                    <AgencyPortal />
                  </SuperAdminRoute>
                }
              />
              <Route path="/superadmin" element={<Navigate to="/agency" replace />} />

              {/* Protected Owner Dashboard Console */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dishes"
                element={
                  <ProtectedRoute>
                    <Dishes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/offers"
                element={
                  <ProtectedRoute>
                    <Offers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/qr-center"
                element={
                  <ProtectedRoute>
                    <QrCenter />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </TenantProvider>
  );
};

export default App;
