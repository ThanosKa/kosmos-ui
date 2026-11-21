'use client';

import type { Button as ButtonPrimitive } from '@base-ui/react/button';
import { LoaderCircle } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';

type ProviderButtonGroupProps = React.ComponentProps<'div'> & {
  /** `horizontal` sets the buttons side by side when they fit, with the provider's name alone as the visible label. */
  orientation?: 'horizontal' | 'vertical';
};

/** Lays out provider buttons in a column, or side by side when they fit. */
function ProviderButtonGroup({ orientation = 'vertical', className, ...props }: ProviderButtonGroupProps) {
  return (
    <div
      data-slot="provider-button-group"
      data-orientation={orientation}
      className={cn(
        // The row gap and the top padding keep the "Last used" badge on a button's top edge clear of what sits above it.
        'group/providers grid gap-x-2 gap-y-3 has-[[data-last-used]]:pt-2.5',
        orientation === 'horizontal' && 'grid-cols-[repeat(auto-fit,minmax(min(100%,calc(var(--spacing)*32)),1fr))]',
        className,
      )}
      {...props}
    />
  );
}

type ProviderButtonProps = Omit<ButtonPrimitive.Props, 'children' | 'className'> & {
  className?: string;
  /** The provider's name, such as Google. The label reads "Continue with" and the name. */
  name: string;
  /** The provider's mark, 16px. It gives way to a spinner while `pending`. */
  icon: React.ReactNode;
  /** Marks the way this browser logged in last time with a "Last used" badge. */
  lastUsed?: boolean;
  /** Shows a spinner in place of the mark and stops more clicks, while the provider's page opens. */
  pending?: boolean;
};

/** A button that logs in with another account, such as Google or GitHub. */
function ProviderButton({ name, icon, lastUsed = false, pending = false, disabled, className, ...props }: ProviderButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      data-slot="provider-button"
      data-last-used={lastUsed || undefined}
      data-pending={pending || undefined}
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      focusableWhenDisabled
      className={cn('relative w-full min-w-0', className)}
      {...props}
    >
      {pending ? <LoaderCircle aria-hidden data-icon="inline-start" className="motion-safe:animate-spin motion-reduce:animate-pulse" /> : icon}
      {/* The prefix gives way first, so a narrow button still shows the provider's name. */}
      <span className="flex min-w-0">
        <span className="shrink-[100] truncate whitespace-pre group-data-[orientation=horizontal]/providers:sr-only" title={`Continue with ${name}`}>
          Continue with{' '}
        </span>
        <span className="truncate" title={name}>
          {name}
        </span>
      </span>
      {lastUsed ? (
        <Badge
          data-slot="provider-button-badge"
          variant="secondary"
          className="pointer-events-none absolute end-2 -top-2.5"
        >
          <span className="sr-only">, </span>
          Last used
        </Badge>
      ) : null}
    </Button>
  );
}

/** Google's mark in one color, from Simple Icons (CC0). */
function GoogleIcon({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden data-icon="inline-start" className={className} {...props}>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}

/** GitHub's mark, from Simple Icons (CC0). */
function GitHubIcon({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden data-icon="inline-start" className={className} {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.6 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export { GitHubIcon, GoogleIcon, ProviderButton, ProviderButtonGroup, type ProviderButtonGroupProps, type ProviderButtonProps };
