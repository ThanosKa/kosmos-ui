import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * One key of a keyboard shortcut. An icon inside takes its key name
 * (`<Kbd><ArrowUp role="img" aria-label="Up arrow" /></Kbd>`), so a screen reader says the key.
 */
function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'inline-flex h-5 min-w-5 shrink-0 items-center justify-center gap-1 rounded-sm border border-transparent bg-secondary px-1 font-sans text-caption font-medium text-muted-foreground tabular-nums shadow-control',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}

/** Keys pressed together, such as ⌘ K. Sets the keys 4px apart. */
function KbdGroup({ className, ...props }: React.ComponentProps<'kbd'>) {
  return <kbd data-slot="kbd-group" className={cn('inline-flex items-center gap-1 font-sans', className)} {...props} />;
}

export { Kbd, KbdGroup };
