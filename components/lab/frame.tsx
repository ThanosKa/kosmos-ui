import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * One labelled state in a candidate's preview. `host="card"` puts a surface-less candidate on the card
 * it would sit in; `host="none"` leaves a candidate that is its own card on the page, so no card nests in another.
 */
function Frame({
  label,
  host = 'card',
  className,
  children,
}: {
  label: string;
  host?: 'card' | 'none';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-caption text-muted-foreground">{label}</p>
      <div
        className={cn(
          'min-w-0',
          host === 'card' && 'rounded-2xl border border-transparent bg-card p-4 shadow-card',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export { Frame };
