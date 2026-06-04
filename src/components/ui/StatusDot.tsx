import React from 'react';
import { cn } from '../../utils/simulators';

interface StatusDotProps {
  status: 'active' | 'inactive' | 'warning' | 'busy';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, size = 'md', label }) => {
  const colors = {
    active: 'bg-emerald-500',
    inactive: 'bg-slate-300',
    warning: 'bg-yellow-500',
    busy: 'bg-orange-500',
  };

  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const isAnimated = status === 'active' || status === 'busy';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-flex">
        {isAnimated && (
          <span className={cn('absolute inline-flex rounded-full opacity-75 animate-ping', colors[status], sizes[size])} />
        )}
        <span className={cn('relative inline-flex rounded-full', colors[status], sizes[size])} />
      </span>
      {label && <span className="text-xs text-slate-600 font-medium">{label}</span>}
    </span>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'orange' | 'red' | 'purple';
  trend?: { value: string; up: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, color = 'green', trend }) => {
  const colors = {
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-emerald-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-100' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', badge: 'bg-orange-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', badge: 'bg-red-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'bg-purple-100' },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors[color].bg)}>
          <span className={colors[color].icon}>{icon}</span>
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-lg',
            trend.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          )}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
      </div>
    </div>
  );
};
