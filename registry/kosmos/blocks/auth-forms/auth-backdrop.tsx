'use client';

import type * as React from 'react';
import { AuthForms, AuthProviders } from '@/registry/kosmos/blocks/auth-forms/auth-forms';
import { cn } from '@/registry/kosmos/lib/cn';
import { FlickeringGrid } from '@/registry/kosmos/ui/flickering-grid';
import { Glow } from '@/registry/kosmos/ui/glow';

type AuthBackdropProps = {
  /** The form. Defaults to AuthForms set on the page, with Google and GitHub side by side above it. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * A full page for log in and sign up: the form stands on the page itself, with no card, over a flickering grid that
 * fades out toward the middle and a glow at the top.
 */
function AuthBackdrop({ children, className }: AuthBackdropProps) {
  return (
    <div data-slot="auth-backdrop" className={cn('relative isolate flex min-h-svh w-full flex-col overflow-hidden bg-background', className)}>
      {/* The clear zone is a fixed size that covers the form, so no cell sits behind its text at any width. */}
      <FlickeringGrid spotlight className="-z-10 mask-[radial-gradient(ellipse_28rem_36rem_at_50%_45%,transparent_70%,black)]" />
      {/* In light mode the glow behind muted text drops it below 4.5:1, so it shows in dark mode only. */}
      <Glow position="top" className="hidden dark:block" />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        {children ?? <AuthForms appearance="plain" alternatives={<AuthProviders orientation="horizontal" lastUsed="google" />} />}
      </main>
    </div>
  );
}

export { AuthBackdrop, type AuthBackdropProps };
