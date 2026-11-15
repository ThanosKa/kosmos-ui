import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

/** A placeholder shaped like the content that is loading. Size and shape it with `className`. */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="skeleton" className={cn('animate-pulse rounded-lg bg-muted', className)} {...props} />;
}

export { Skeleton };
