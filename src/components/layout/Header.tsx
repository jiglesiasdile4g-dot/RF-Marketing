import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuthStore } from '../../stores/authStore';
import { ROLE_LABELS } from '../../lib/constants';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/pipeline': 'Pipeline',
  '/stats': 'Estadísticas',
  '/onboarding': 'Onboarding',
  '/users': 'Gestión de Usuarios',
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const basePath = '/' + (location.pathname.split('/')[1] || '');
  const title = PAGE_TITLES[basePath] || 'RF Marketing';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-surface-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <NotificationDropdown />
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-sm font-semibold">
              {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">{user?.nombre}</p>
            <p className="text-xs text-muted">{user ? ROLE_LABELS[user.role] : ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-3 p-2 text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
