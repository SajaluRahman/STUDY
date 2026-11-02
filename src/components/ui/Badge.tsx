'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type BadgeVariant =
  | 'default'
  | 'premium'
  | 'free'
  | 'success'
  | 'error'
  | 'danger'
  | 'warning'
  | 'info'
  | 'primary'
  | 'teal'
  | 'neutral';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  neutral: 'bg-slate-100 text-slate-700',
  premium: 'bg-amber-100 text-amber-800',
  free: 'bg-emerald-100 text-emerald-700',
  success: 'bg-emerald-100 text-emerald-700',
  error: 'bg-red-100 text-red-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-700',
  primary: 'bg-teal-50 text-teal-700 border border-teal-200/80',
  teal: 'bg-teal-50 text-teal-700 border border-teal-200/80',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export function Badge({ variant = 'default', size = 'md', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
