import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Numbered steps. Each `Step` usually opens with a `###` heading, which the number lines up with. */
export function Steps({ className, ...props }: ComponentProps<'ol'>) {
  return <ol className={cn('my-8 list-none ps-0 [counter-reset:step]', className)} {...props} />;
}

export function Step({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      className={cn(
        'relative my-0 min-w-0 ps-10 pb-8 [counter-increment:step] last:pb-0 [&>:first-child]:mt-0 [&>:last-child]:mb-0',
        'before:absolute before:start-0 before:top-1 before:flex before:size-6 before:items-center before:justify-center before:rounded-full before:border before:border-transparent before:bg-card before:text-caption before:font-medium before:text-foreground before:tabular-nums before:shadow-card before:content-[counter(step)]',
        'after:absolute after:start-3 after:top-9 after:bottom-1 after:border-s after:border-border last:after:hidden',
        className,
      )}
      {...props}
    />
  );
}
