import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Loading from './components/ui/Loading';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ActivityLogsPage from './pages/activity-logs/ActivityLogsPage';
import LoginPage from './pages/auth/LoginPage';
import CleaningSanitationPage from './pages/cleaning-sanitation/CleaningSanitationPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DeliveryTruckPage from './pages/delivery-truck/DeliveryTruckPage';
import OilTemperaturePage from './pages/oil-temperature/OilTemperaturePage';
import PestControlPage from './pages/pest-control/PestControlPage';
import RawMaterialsPage from './pages/raw-materials/RawMaterialsPage';
import ReportsPage from './pages/reports/ReportsPage';
import StockManagementPage from './pages/stock-management/StockManagementPage';
import UsersPage from './pages/users/UsersPage';

function ProtectedApp() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4"><Loading label="Starting application..." /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="stock-management" element={<StockManagementPage />} />
        <Route path="stock-management/:id" element={<StockManagementPage />} />
        <Route path="raw-materials" element={<RawMaterialsPage />} />
        <Route path="raw-materials/:id" element={<RawMaterialsPage />} />
        <Route path="delivery-truck" element={<DeliveryTruckPage />} />
        <Route path="delivery-truck/:id" element={<DeliveryTruckPage />} />
        <Route path="pest-control" element={<PestControlPage />} />
        <Route path="pest-control/:id" element={<PestControlPage />} />
        <Route path="oil-temperature" element={<OilTemperaturePage />} />
        <Route path="oil-temperature/:id" element={<OilTemperaturePage />} />
        <Route path="cleaning-sanitation" element={<CleaningSanitationPage />} />
        <Route path="cleaning-sanitation/:id" element={<CleaningSanitationPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="activity-logs" element={<ActivityLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
    </AuthProvider>
  );
}

