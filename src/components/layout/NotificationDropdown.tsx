import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { Badge } from '../ui/Badge';
import { getLeadStatusColor, getLeadStatusLabel } from '../../lib/constants';
import { formatRelative } from '../../lib/utils';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } =
    useNotificationStore();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
      >
        <Bell size={20} className="text-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-alert rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] glass-card p-0 overflow-hidden z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Notificaciones</h3>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors cursor-pointer"
                  title="Marcar todas como leídas"
                >
                  <Check size={14} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-alert transition-colors cursor-pointer"
                  title="Limpiar todo"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted text-sm">
                Sin notificaciones
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-white/3 transition-colors cursor-pointer ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{n.leadName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge color={getLeadStatusColor(n.oldStatus)}>{getLeadStatusLabel(n.oldStatus)}</Badge>
                        <span className="text-muted-dim text-xs">&rarr;</span>
                        <Badge color={getLeadStatusColor(n.newStatus)}>{getLeadStatusLabel(n.newStatus)}</Badge>
                      </div>
                      <p className="text-xs text-muted-dim mt-1">
                        {formatRelative(n.timestamp)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
