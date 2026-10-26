'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { Inbox, Lock, RotateCw, SearchX, TriangleAlert } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/registry/kosmos/ui/button';
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
      icon: "size-12 rounded-2xl border border-transparent bg-card text-muted-foreground shadow-card [&_svg:not([class*='size-'])]:size-5",
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
    props: mergeProps<'div'>({ className: cn('text-body font-medium text-balance text-foreground', className) }, props, {
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

type EmptyStateVariant = 'first-use' | 'no-results' | 'filtered' | 'error' | 'no-permission';

type EmptyStateProps = Omit<React.ComponentProps<typeof Empty>, 'title'> & {
  /**
   * Why there is nothing: `first-use` (never filled), `no-results` (a search found nothing), `filtered` (filters hide
   * everything), `error` (the data did not load) or `no-permission` (the viewer may not see it).
   */
  variant: EmptyStateVariant;
  /** What the list holds, plural, for the default copy: "projects" gives "No projects yet". */
  noun?: string;
  /** The search text, quoted in the `no-results` title. */
  query?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Replaces the variant's icon. */
  icon?: React.ReactNode;
  /** The primary action: the button that creates the first item, or asks for access. */
  action?: React.ReactNode;
  /** Shows "Clear filters" in `no-results` and `filtered`. */
  onClear?: () => void;
  clearLabel?: React.ReactNode;
  /** Shows "Try again" in `error`. */
  onRetry?: () => void;
  retryLabel?: React.ReactNode;
  /** Heading level of the title; leave out for a plain `<div>`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Drops the icon and tightens the spacing, for a narrow column or a small card. */
  compact?: boolean;
};

const stateIcons: Record<EmptyStateVariant, React.ReactNode> = {
  'first-use': <Inbox />,
  'no-results': <SearchX />,
  filtered: <SearchX />,
  error: <TriangleAlert />,
  'no-permission': <Lock />,
};

function stateCopy(variant: EmptyStateVariant, noun: string, query?: string) {
  const trimmed = query?.trim();
  switch (variant) {
    case 'first-use':
      return { title: `No ${noun} yet`, description: `${noun[0].toUpperCase()}${noun.slice(1)} you add show up here.` };
    case 'no-results':
      return {
        title: trimmed ? `No ${noun} match “${trimmed}”` : `No ${noun} match`,
        description: 'Check the spelling or try another search.',
      };
    case 'filtered':
      return { title: `No ${noun} match these filters`, description: `Clear the filters to see every ${noun.replace(/s$/, '')}.` };
    case 'error':
      return { title: `Couldn’t load ${noun}`, description: 'The server didn’t answer. Your data is safe.' };
    case 'no-permission':
      return { title: `You can’t view ${noun}`, description: 'Ask an admin of this workspace for access.' };
  }
}

/** An `Empty` with the five usual reasons built in: icon, title, one sentence and the next step for each. Every piece can be replaced. */
function EmptyState({
  variant,
  noun = 'items',
  query,
  title,
  description,
  icon,
  action,
  onClear,
  clearLabel = 'Clear filters',
  onRetry,
  retryLabel = 'Try again',
  headingLevel,
  compact = false,
  className,
  ...props
}: EmptyStateProps) {
  const copy = stateCopy(variant, noun, query);
  const clearable = (variant === 'no-results' || variant === 'filtered') && onClear;
  const retryable = variant === 'error' && onRetry;

  return (
    <Empty
      data-variant={variant}
      role={variant === 'error' ? 'alert' : undefined}
      className={cn(compact && 'gap-3 p-3', className)}
      {...props}
    >
      <EmptyHeader>
        {compact ? null : (
          <EmptyMedia variant="icon" className={cn(variant === 'error' && 'text-destructive')}>
            {icon ?? stateIcons[variant]}
          </EmptyMedia>
        )}
        <EmptyTitle render={headingLevel ? React.createElement(`h${headingLevel}`) : undefined}>
          {title ?? copy.title}
        </EmptyTitle>
        <EmptyDescription>{description ?? copy.description}</EmptyDescription>
      </EmptyHeader>
      {action || clearable || retryable ? (
        <EmptyContent>
          {clearable ? (
            <Button variant="secondary" size={compact ? 'sm' : 'md'} onClick={onClear}>
              {clearLabel}
            </Button>
          ) : null}
          {retryable ? (
            <Button variant="secondary" size={compact ? 'sm' : 'md'} onClick={onRetry}>
              <RotateCw data-icon="inline-start" />
              {retryLabel}
            </Button>
          ) : null}
          {action}
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

export { Empty, EmptyState, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, emptyMediaVariants };
export type { EmptyStateProps, EmptyStateVariant };
