'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

/** What fills a page, table or panel that has nothing to show yet: what is missing and what to do next. */
function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center',
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn('flex max-w-[32em] flex-col items-center gap-1', className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva('mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0', {
  variants: {
    variant: {
      default: 'bg-transparent',
      icon: "size-10 rounded-xl border border-transparent bg-card text-foreground shadow-card [&_svg:not([class*='size-'])]:size-5",
    },
  },
  defaultVariants: { variant: 'default' },
});

/** An icon, illustration or avatar group above the title. `variant="icon"` sets a single icon on a small card. */
function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      aria-hidden
      className={cn(emptyMediaVariants({ variant }), className)}
      {...props}
    />
  );
}

/** Renders a `<div>`. Pass `render={<h2 />}` (the level that fits the page) so screen readers can jump to it. */
function EmptyTitle({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>({ className: cn('text-title text-balance text-foreground', className) }, props, {
      'data-slot': 'empty-title',
    } as React.ComponentProps<'div'>),
  });
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        'text-small text-pretty text-muted-foreground',
        '[&>a]:rounded-sm [&>a]:font-medium [&>a]:text-foreground [&>a]:underline [&>a]:underline-offset-4',
        '[&>a]:focus-visible:outline-2 [&>a]:focus-visible:outline-offset-2 [&>a]:focus-visible:outline-ring',
        className,
      )}
      {...props}
    />
  );
}

/** The next step: one or two buttons, a link or a short form. */
function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn('flex w-full max-w-[32em] min-w-0 flex-wrap items-center justify-center gap-2', className)}
      {...props}
    />
  );
}

export { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, emptyMediaVariants };
