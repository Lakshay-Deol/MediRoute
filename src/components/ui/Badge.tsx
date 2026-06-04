import React from 'react';
import { cn } from '../../utils/simulators';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'orange' | 'gray' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  size = 'sm',
  dot = false,
  className,
}) => {
  const variants = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border border-orange-200',
    gray: 'bg-slate-50 text-slate-600 border border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  };

  const dotColors = {
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    gray: 'bg-slate-400',
    purple: 'bg-purple-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-medium rounded-lg',
    md: 'px-3 py-1 text-sm font-medium rounded-xl',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5', variants[variant], sizes[size], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};
