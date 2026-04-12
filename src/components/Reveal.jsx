import { cn } from '../lib/utils';

export function Reveal({ as: Component = 'div', className, children }) {
  return <Component className={cn(className)}>{children}</Component>;
}
