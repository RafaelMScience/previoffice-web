import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Reusable animated skeleton placeholder to prevent layout shifts (CLS)
 * and provide perceived performance during asynchronous data fetching.
 */
export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse motion-reduce:animate-none rounded-md bg-slate-200/80 dark:bg-slate-700/50 ${className}`}
      {...props}
    />
  );
}
