import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { modules } from '../../utils/modules';

function titleFromPath(pathname) {
  const module = modules.find((item) => pathname.startsWith(item.route));
  if (module) return module.shortTitle;
  if (pathname.startsWith('/reports')) return 'Reports';
  if (pathname.startsWith('/users')) return 'Users';
  if (pathname.startsWith('/activity-logs')) return 'Activity Logs';
  return 'Dashboard';
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <Topbar title={titleFromPath(location.pathname)} onMenu={() => setSidebarOpen(true)} />
        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

