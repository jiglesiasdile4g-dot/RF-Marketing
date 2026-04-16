import { cn } from '../../lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  glow?: 'primary' | 'secondary';
}

export function Card({ children, hover, glow, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        hover ? 'glass-card-hover' : 'glass-card',
        glow === 'primary' && 'glow-primary',
        glow === 'secondary' && 'glow-secondary',
        'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
