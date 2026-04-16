import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 shadow-sm hover:shadow-md',
        className
      )}
      style={
        color
          ? {
              backgroundColor: `${color}25`,
              color: color,
              border: `1.5px solid ${color}50`,
              boxShadow: `0 0 12px ${color}20`,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
