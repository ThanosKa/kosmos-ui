'use client';

import type * as React from 'react';
import { AuthProviders, EmailFirstForm } from '@/registry/kosmos/blocks/auth-forms/auth-forms';
import { cn } from '@/registry/kosmos/lib/cn';

type AuthEmailFirstProps = {
  /** The form. Defaults to EmailFirstForm with Google and GitHub above the email. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * A full page that logs in one question at a time: the email first, then the password or a code sent to the email,
 * in a card in the middle of the page.
 */
function AuthEmailFirst({ children, className }: AuthEmailFirstProps) {
  return (
    <main data-slot="auth-email-first" className={cn('flex min-h-svh w-full flex-col items-center justify-center bg-background px-4 py-16', className)}>
      {children ?? <EmailFirstForm alternatives={<AuthProviders lastUsed="github" />} />}
    </main>
  );
}

export { AuthEmailFirst, type AuthEmailFirstProps };
