import { cn } from '../../lib/utils';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-surface-700/60 border border-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-muted-dim transition-all duration-300 ease-out',
            'focus:outline-none focus:bg-surface-700/80 focus:border-primary focus:ring-2 focus:ring-primary/40 focus:shadow-lg focus:shadow-primary/20',
            'hover:border-border-hover hover:bg-surface-700/70',
            error && 'border-alert/60 focus:border-alert focus:ring-alert/40 focus:shadow-alert/20 hover:border-alert/70',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-alert mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
