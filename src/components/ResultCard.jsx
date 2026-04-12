import { Card } from './ui/card';
import { cn } from '../lib/utils';

export function ResultCard({ eyebrow, title, children, className, tone = 'default' }) {
  return (
    <Card
      className={cn(
        'p-5',
        tone === 'focus' && 'border-google-blue bg-google-blue-light/40',
        tone === 'alert' && 'border-google-red/40 bg-red-50',
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-wide text-google-blue">{eyebrow}</p>
      ) : null}
      {title ? (
        <h3 className="mt-2 text-base font-medium text-google-text">{title}</h3>
      ) : null}
      <div className="mt-3">{children}</div>
    </Card>
  );
}
