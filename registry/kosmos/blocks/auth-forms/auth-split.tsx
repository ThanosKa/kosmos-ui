'use client';

import type * as React from 'react';
import { AuthForms, AuthProviders } from '@/registry/kosmos/blocks/auth-forms/auth-forms';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';

// Sample data: replace it with your product's name, your links and a quote from one of your customers.
const sampleProductName = 'Acme';
const sampleLinks = { home: '/', privacy: '/privacy', terms: '/terms' };
const sampleQuote = {
  text: 'Acme is the one place where product, design and engineering read the same numbers. When a storm doubled our traffic for three days, the dashboards kept up and so did we.',
  name: 'Grace Whitfield',
  role: 'VP of product, Cirrus Weather',
  avatar: '/avatars/grace.jpg',
};
const sampleCustomers = [
  { id: 'cirrus', name: 'Cirrus Weather' },
  { id: 'fernhill', name: 'Fernhill Books' },
  { id: 'brightloop', name: 'Brightloop Fitness' },
  { id: 'copperline', name: 'Copperline Bank' },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

const quietLink =
  'rounded-sm text-muted-foreground transition-[color] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** A customer's words and the teams that use the product, for the side of the page. */
function SampleStory({ productName }: { productName: string }) {
  return (
    <figure className="flex flex-1 flex-col justify-between gap-12 rounded-2xl border border-transparent bg-muted p-12 shadow-inset">
      <p className="text-caption tracking-[0.05em] text-muted-foreground uppercase">From the teams on {productName}</p>
      <div className="flex max-w-[30em] flex-col gap-8">
        <blockquote className="text-heading font-medium text-pretty text-foreground">“{sampleQuote.text}”</blockquote>
        <figcaption className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={sampleQuote.avatar} alt="" />
            <AvatarFallback>{initials(sampleQuote.name)}</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-col">
            <span className="text-body font-medium text-foreground">{sampleQuote.name}</span>
            <span className="text-small text-muted-foreground">{sampleQuote.role}</span>
          </span>
        </figcaption>
      </div>
      <ul aria-label="Customers" className="flex flex-wrap gap-x-6 gap-y-3">
        {sampleCustomers.map((customer) => (
          <li key={customer.id} className="flex items-center gap-2 text-small text-muted-foreground">
            <Avatar size="sm" className="rounded-md">
              <AvatarImage src={`/logos/${customer.id}.svg`} alt="" />
              <AvatarFallback className="rounded-md">{initials(customer.name)}</AvatarFallback>
            </Avatar>
            {customer.name}
          </li>
        ))}
      </ul>
    </figure>
  );
}

type AuthSplitProps = {
  /** The form. Defaults to AuthForms set on the page, with Google and GitHub side by side above it. */
  children?: React.ReactNode;
  /** The panel on the other half, from 896px wide. Defaults to a customer's quote and the teams that use the product. */
  aside?: React.ReactNode;
  /** Names the product in the header and the footer. */
  productName?: string;
  /** Where the product name in the header goes. */
  homeHref?: string;
  className?: string;
};

/**
 * A full page for log in and sign up in two halves: the form with the product's name above it and the legal links
 * under it, and a panel with a customer's words on the other half. Below 896px wide the form stands alone.
 */
function AuthSplit({ children, aside, productName = sampleProductName, homeHref = sampleLinks.home, className }: AuthSplitProps) {
  return (
    <div data-slot="auth-split" className={cn('@container/split w-full bg-background', className)}>
      <div className="grid min-h-svh @4xl/split:grid-cols-2">
        <div className="flex min-w-0 flex-col p-6 @sm/split:p-8">
          <header>
            <a
              href={homeHref}
              className="inline-flex items-center gap-2 rounded-md text-title text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span
                aria-hidden
                className="flex size-7 items-center justify-center rounded-lg border border-transparent bg-primary text-body font-semibold text-primary-foreground shadow-primary"
              >
                {Array.from(productName.trim())[0]?.toUpperCase()}
              </span>
              {productName}
            </a>
          </header>
          <main className="flex flex-1 flex-col items-center justify-center py-12">
            {children ?? (
              <AuthForms appearance="plain" productName={productName} alternatives={<AuthProviders orientation="horizontal" />} />
            )}
          </main>
          <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-small text-muted-foreground">
            <span>
              © 2026 {productName}
            </span>
            <span className="flex gap-4">
              <a href={sampleLinks.privacy} className={quietLink}>
                Privacy
              </a>
              <a href={sampleLinks.terms} className={quietLink}>
                Terms
              </a>
            </span>
          </footer>
        </div>
        <aside aria-label={`About ${productName}`} className="hidden p-3 @4xl/split:flex">
          {aside ?? <SampleStory productName={productName} />}
        </aside>
      </div>
    </div>
  );
}

export { AuthSplit, type AuthSplitProps };
