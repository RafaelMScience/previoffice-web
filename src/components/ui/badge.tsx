import React from 'react';

export type BadgeVariant =
  | 'first-time'
  | 'recurring'
  | 'pending'
  | 'closed'
  | 'prospect'
  | 'default'
  | 'info'
  | 'warning'
  | 'success'
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (variant === 'first-time' || variant === 'info') {
    styleClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (variant === 'recurring') {
    styleClasses = 'bg-[#FDF8ED] text-[#92400E] border-[#C89543]/40';
  } else if (variant === 'pending' || variant === 'warning') {
    styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (variant === 'closed' || variant === 'success') {
    styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (variant === 'prospect' || variant === 'neutral') {
    styleClasses = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClasses} ${className}`}
    >
      {children}
    </span>
  );
}
