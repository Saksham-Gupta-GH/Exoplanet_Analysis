import { Card } from './ui/card';
import { cn } from '../lib/utils';

export function FeatureCard({ eyebrow, title, children, className }) {
  return (
    <Card className={cn('p-5', className)}>
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-wide text-google-blue">{eyebrow}</p>
      ) : null}
      {title ? (
        <h3 className="mt-2 text-base font-medium text-google-text">{title}</h3>
      ) : null}
      <div className="mt-2 text-sm leading-6 text-google-text-secondary">{children}</div>
    </Card>
  );
}
