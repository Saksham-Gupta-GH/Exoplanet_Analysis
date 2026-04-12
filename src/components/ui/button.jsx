import * as React from 'react';
import { cn } from '../../lib/utils';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';

const variants = {
  filled:
    'bg-google-blue text-white rounded-g-xl px-6 h-10 text-sm hover:bg-google-blue-hover hover:shadow-g-1 active:bg-[#1557b0]',
  tonal:
    'bg-google-blue-light text-google-blue rounded-g-xl px-6 h-10 text-sm hover:bg-google-blue-surface active:bg-[#c4d7f5]',
  outlined:
    'border border-google-outline text-google-blue rounded-g-xl px-6 h-10 text-sm hover:bg-google-blue-light hover:border-google-blue-surface active:bg-google-blue-surface',
  text:
    'text-google-blue rounded-g px-3 h-10 text-sm hover:bg-google-blue-light active:bg-google-blue-surface',
  secondary:
    'border border-google-outline text-google-text-secondary rounded-g-xl px-5 h-10 text-sm hover:bg-google-surface-dim active:bg-google-surface-container',
  danger:
    'bg-google-red text-white rounded-g-xl px-6 h-10 text-sm hover:opacity-90',
};

const sizes = {
  default: 'h-10',
  sm: 'h-9 px-4 text-[13px]',
  lg: 'h-12 px-8 text-base',
};

export function Button({ className, variant = 'filled', size = 'default', asChild = false, children, ...props }) {
  const Comp = asChild ? 'span' : 'button';
  return (
    <Comp
      className={cn(base, variants[variant] || variants.filled, sizes[size] !== sizes.default && sizes[size], className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
