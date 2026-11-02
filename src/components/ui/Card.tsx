'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className,
  hover = false,
  padding = 'none',
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/80 shadow-sm',
        hover && 'transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5',
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
