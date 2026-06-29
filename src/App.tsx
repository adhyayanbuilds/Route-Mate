import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AppLayout } from './components/layout/AppLayout';
import { FullPageSpinner } from './components/ui/Spinner';

// Lazy-load all app pages for optimal bundle splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const MapPage        = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })));
const WeatherPage    = lazy(() => import('./pages/WeatherPage').then((m) => ({ default: m.WeatherPage })));
const FavoritesPage  = lazy(() => import('./pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })));
const ProfilePage    = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage   = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ServiceCategoryPage = lazy(() =>
  import('./pages/ServiceCategoryPage').then((m) => ({ default: m.ServiceCategoryPage })),
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="w-9 h-9 rounded-full border-2 border-emerald-500/25 border-t-emerald-500 animate-spin" />
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (session) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />

      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard"          element={<Wrap><DashboardPage /></Wrap>} />
        <Route path="map"                element={<Wrap><MapPage /></Wrap>} />
        <Route path="weather"            element={<Wrap><WeatherPage /></Wrap>} />
        <Route path="favorites"          element={<Wrap><FavoritesPage /></Wrap>} />
        <Route path="profile"            element={<Wrap><ProfilePage /></Wrap>} />
        <Route path="settings"           element={<Wrap><SettingsPage /></Wrap>} />
        <Route path="services/:category" element={<Wrap><ServiceCategoryPage /></Wrap>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
