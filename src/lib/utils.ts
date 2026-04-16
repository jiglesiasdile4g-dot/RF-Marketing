import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null): string {
  if (!date) return '—';
  return format(new Date(date), 'dd/MM/yyyy', { locale: es });
}

export function formatRelative(date: string | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}
