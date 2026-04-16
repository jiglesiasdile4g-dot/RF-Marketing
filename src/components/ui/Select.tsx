import { cn } from '../../lib/utils';
import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-muted">{label}</label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-surface-700 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors appearance-none cursor-pointer',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';
