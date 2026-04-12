import * as React from 'react';
import { cn } from '../../lib/utils';

export function Progress({ value = 0, className, indicatorClassName }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-google-surface-container', className)}>
      <div
        className={cn(
          'h-full rounded-full bg-google-blue transition-all duration-500',
          indicatorClassName,
        )}
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}
