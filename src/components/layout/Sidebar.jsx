import {
  Activity,
  BarChart3,
  Bug,
  ClipboardList,
  Droplets,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Thermometer,
  Truck,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Stock Management', to: '/stock-management', icon: Package },
  { label: 'Raw Materials Receiving', to: '/raw-materials', icon: Truck },
  { label: 'Delivery Truck Monitoring', to: '/delivery-truck', icon: Wrench },
  { label: 'Pest Control', to: '/pest-control', icon: Bug },
  { label: 'Oil Temperature / Deep Frying', to: '/oil-temperature', icon: Thermometer },
  { label: 'Cleaning & Sanitation', to: '/cleaning-sanitation', icon: Droplets },
  { label: 'Reports', to: '/reports', icon: FileBarChart },
  { label: 'Users', to: '/users', icon: Users },
  { label: 'Activity Logs', to: '/activity-logs', icon: Activity },
];

export function MobileMenuButton({ onClick }) {
  return (
    <button className="btn btn-secondary lg:hidden" type="button" onClick={onClick} aria-label="Open menu">
      <Menu size={20} />
    </button>
  );
}

export default function Sidebar({ open, onClose }) {
  const { signOut } = useAuth();

  const content = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white px-4 py-5">
      <div className="mb-5 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3" onClick={onClose}>
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-lg font-black text-white">S</span>
          <span>
            <span className="block text-sm font-black text-ink">SSOP Records</span>
            <span className="block text-xs font-medium text-muted">Ilocos Food Products</span>
          </span>
        </NavLink>
        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" type="button" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  isActive ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        type="button"
        onClick={signOut}
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{content}</div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-900/40" type="button" onClick={onClose} aria-label="Close menu" />
          <div className="relative h-full">{content}</div>
        </div>
      )}
    </>
  );
}

