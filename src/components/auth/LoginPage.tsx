import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useLogin } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loginMutation = useLogin();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <span className="text-white font-bold text-xl">RF</span>
          </div>
          <h1 className="text-2xl font-bold text-white">RF Marketing</h1>
          <p className="text-muted text-sm mt-1">Centro de control de leads</p>
        </div>

        {/* Form card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {loginMutation.isError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-alert/10 border border-alert/20">
                <AlertCircle size={16} className="text-alert shrink-0" />
                <p className="text-sm text-alert">
                  {(loginMutation.error as Error)?.message || 'Credenciales incorrectas'}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                <>
                  <LogIn size={18} />
                  Iniciar sesión
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-dim mt-6">
          RentAFlow &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
