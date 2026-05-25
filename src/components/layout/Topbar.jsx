import { MobileMenuButton } from './Sidebar';
import Badge from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';

export default function Topbar({ title, onMenu }) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <MobileMenuButton onClick={onMenu} />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-normal text-muted">Taleb, Bantay, Ilocos Sur</p>
            <h1 className="truncate text-lg font-black text-ink sm:text-2xl">{title}</h1>
          </div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-sm font-bold text-ink">{profile?.full_name || 'User'}</p>
          <Badge value={profile?.role || 'Viewer'} />
        </div>
      </div>
    </header>
  );
}

