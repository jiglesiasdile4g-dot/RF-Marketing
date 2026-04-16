import { cn } from '../../lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  // Primary: Solid purple with glow, most prominent
  primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-95',

  // Secondary: Teal accent with glass effect
  secondary: 'bg-secondary/20 hover:bg-secondary/30 text-secondary-light border border-secondary/40 hover:border-secondary/60 shadow-md shadow-secondary/10',

  // Ghost: Minimal, text-only with color change
  ghost: 'bg-transparent hover:bg-white/8 text-muted hover:text-white border border-transparent hover:border-border active:bg-white/12',

  // Accent: Golden/yellow for success or special actions
  accent: 'bg-accent/20 hover:bg-accent/30 text-accent-bright border border-accent/40 hover:border-accent/60 shadow-md shadow-accent/10',

  // Danger: Red alert style (previously 'danger')
  danger: 'bg-alert/15 hover:bg-alert/25 text-alert border border-alert/30 hover:border-alert/50 shadow-md shadow-alert/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-900 focus:ring-primary/60 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer hover:translate-y-[-1px] active:translate-y-[0px]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
