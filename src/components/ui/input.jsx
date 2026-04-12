import * as React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-g border border-google-outline bg-white px-3.5 text-sm text-google-text outline-none transition-colors placeholder:text-google-text-tertiary focus:border-google-blue focus:ring-2 focus:ring-google-blue-light',
        className,
      )}
      {...props}
    />
  );
});
