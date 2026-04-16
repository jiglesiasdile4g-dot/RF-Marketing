import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: number;
}

export function Rating({ value, max = 3, onChange, size = 16 }: RatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            'transition-colors',
            i < value ? 'fill-accent text-accent' : 'text-muted-dim',
            onChange && 'cursor-pointer hover:text-accent'
          )}
          onClick={() => onChange?.(i + 1 === value ? 0 : i + 1)}
        />
      ))}
    </div>
  );
}
