import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TableProperties,
  Kanban,
  BarChart3,
  UserCog,
  Rocket,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { ROLE_LABELS } from '../../lib/constants';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'comercial', 'demo', 'onboarding'] },
  { to: '/leads', icon: TableProperties, label: 'Leads', roles: ['admin', 'comercial', 'demo', 'onboarding'] },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline', roles: ['admin', 'comercial', 'demo', 'onboarding'] },
  { to: '/stats', icon: BarChart3, label: 'Estadísticas', roles: ['admin', 'comercial', 'demo', 'onboarding'] },
  { to: '/onboarding', icon: Rocket, label: 'Onboarding', roles: ['admin', 'onboarding'] },
  { to: '/users', icon: UserCog, label: 'Usuarios', roles: ['admin'] },
] as const;

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);

  const visibleItems = navItems.filter(
    (item) => user && (item.roles as readonly string[]).includes(user.role)
  );

  return (
    <aside
      className={cn(
        'h-screen flex flex-col bg-surface-800 border-r border-border transition-all duration-300 sticky top-0',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">RF</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-white text-base tracking-tight">
            RF Marketing
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted hover:text-white hover:bg-white/5'
              )
            }
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white truncate">{user.nombre}</p>
            <p className="text-xs text-muted">{ROLE_LABELS[user.role]}</p>
          </div>
        )}
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
