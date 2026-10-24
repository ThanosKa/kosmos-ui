'use client';

import { Check } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

type PricingBilling = 'monthly' | 'yearly';

/** A value that is the same for both billings, or one per billing. */
type PerBilling<T> = T | Record<PricingBilling, T>;

type PricingPlan = {
  name: string;
  /** One line under the name: who the plan is for. */
  description?: React.ReactNode;
  /** The price as it reads, such as `'$49'`: one for both billings, or `{ monthly, yearly }`. */
  price: PerBilling<string>;
  /** The muted words after the price, such as `'per month'`. */
  period?: PerBilling<string>;
  /** A badge beside the name, such as "Most popular". */
  badge?: React.ReactNode;
  features?: React.ReactNode[];
  /** The plan's link: a `primary` Button on the featured plan, `secondary` on the rest. A function gets the billing shown. */
  action?: React.ReactNode | ((billing: PricingBilling) => React.ReactNode);
  /** Raises the plan on a card while the others stay recessed. One plan at most. */
  featured?: boolean;
};

// Sample data: replace it with your product's title, line, plans and links.
const sampleTitle = 'Start free, pay as you grow';
const sampleDescription = 'Every plan collects events from web, iOS, Android and server apps. Pay yearly and save 20%.';
const samplePlans: PricingPlan[] = [
  {
    name: 'Free',
    description: 'For a side project or a first app.',
    price: '$0',
    period: 'forever',
    features: ['1 project', '50,000 events a month', '30 days of history', 'Community support'],
    action: (
      <Button variant="secondary" size="lg" href="/signup">
        Start for free
      </Button>
    ),
  },
  {
    name: 'Pro',
    description: 'For a team with an app in production.',
    price: { monthly: '$49', yearly: '$39' },
    period: { monthly: 'per month', yearly: 'per month, billed yearly' },
    badge: <Badge variant="secondary">Most popular</Badge>,
    features: ['Everything in Free', '10 projects', '3,000,000 events a month', 'Funnels and retention', 'Email support'],
    action: (billing) => (
      <Button variant="primary" size="lg" href={`/signup?plan=pro&billing=${billing}`}>
        Start a trial
      </Button>
    ),
    featured: true,
  },
  {
    name: 'Scale',
    description: 'For apps that send millions of events.',
    price: { monthly: '$1,200', yearly: '$960' },
    period: { monthly: 'per month', yearly: 'per month, billed yearly' },
    features: ['Everything in Pro', 'Unlimited projects', '8,000,000 events a month', 'EU data region', 'Priority support'],
    action: (
      <Button variant="secondary" size="lg" href="/demo">
        Book a demo
      </Button>
    ),
  },
];

const defaultBillingLabels: Record<PricingBilling, string> = { monthly: 'Monthly', yearly: 'Yearly' };

function isPerBilling<T>(value: PerBilling<T> | undefined): value is Record<PricingBilling, T> {
  return typeof value === 'object' && value !== null && 'monthly' in value && 'yearly' in value;
}

function forBilling<T>(value: PerBilling<T> | undefined, billing: PricingBilling) {
  return isPerBilling(value) ? value[billing] : value;
}

/** What screen readers hear after the billing changes: the billing, then each plan's name, price and period. */
function billingAnnouncement(plans: PricingPlan[], billing: PricingBilling, label: string) {
  const prices = plans.map((plan) => {
    const period = forBilling(plan.period, billing);
    return `${plan.name}: ${forBilling(plan.price, billing)}${period ? ` ${period}` : ''}.`;
  });
  return [`${label}.`, ...prices].join(' ');
}

/** Columns by plan count, so two or four plans never leave one alone on a row. */
const columns: Record<number, string> = {
  1: 'mx-auto w-full max-w-sm',
  2: 'mx-auto w-full max-w-3xl @xl:grid-cols-2',
  3: '@3xl:grid-cols-3',
  4: '@xl:grid-cols-2 @5xl:grid-cols-4',
};

function PricingPlanCard({ plan, billing }: { plan: PricingPlan; billing: PricingBilling }) {
  const period = forBilling(plan.period, billing);
  const action = typeof plan.action === 'function' ? plan.action(billing) : plan.action;
  return (
    <li
      data-slot="pricing-plan"
      data-featured={plan.featured ? '' : undefined}
      className={cn(
        // Each plan spans four rows of the grid, so names, prices, lists and links line up across plans.
        'row-span-4 grid min-w-0 grid-cols-1 grid-rows-subgrid gap-0 rounded-2xl border border-transparent p-5',
        plan.featured ? 'bg-card shadow-card' : 'bg-muted shadow-inset',
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="min-w-0 text-title wrap-break-word text-foreground">
            {plan.name}
          </h3>
          {plan.badge}
        </div>
        {plan.description ? <p className="text-small text-pretty text-muted-foreground">{plan.description}</p> : null}
      </div>
      <p data-slot="pricing-price" className="mt-5 flex min-w-0 flex-wrap items-baseline gap-x-1.5">
        {/* A new key mounts the price again, so it fades in from `starting:opacity-0` when the billing changes. */}
        <span
          key={`price-${billing}`}
          className="min-w-0 text-display font-semibold wrap-break-word text-foreground tabular-nums transition-[opacity] duration-fast starting:opacity-0"
        >
          {forBilling(plan.price, billing)}
        </span>
        {period ? (
          <span key={`period-${billing}`} className="text-small text-muted-foreground transition-[opacity] duration-fast starting:opacity-0">
            {period}
          </span>
        ) : null}
      </p>
      {plan.features?.length ? (
        <ul role="list" className="mt-5 flex flex-col gap-2.5 border-t border-border pt-5 pb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex min-w-0 items-start gap-2.5 text-body text-foreground">
              <span aria-hidden className="mt-px flex size-4.5 shrink-0 items-center justify-center rounded-full bg-accent">
                <Check className="size-3" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 wrap-break-word">{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 border-t border-border pb-6" />
      )}
      {action ? <div className="flex min-w-0 flex-col justify-end *:w-full">{action}</div> : null}
    </li>
  );
}

type PricingProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  title?: React.ReactNode;
  /** One line under the title. `null` leaves it out. */
  description?: React.ReactNode;
  /** One to four plans, in order. A plan with a price per billing brings the monthly and yearly switch. */
  plans?: PricingPlan[];
  /** The billing shown. Use with `onBillingChange`. */
  billing?: PricingBilling;
  /** The billing shown at first, when the block keeps its own state. */
  defaultBilling?: PricingBilling;
  onBillingChange?: (billing: PricingBilling) => void;
  /** The words on the switch, also read out when the billing changes. */
  billingLabels?: Record<PricingBilling, string>;
  /** A line under the plans, such as a note on taxes or a link to the license. */
  footnote?: React.ReactNode;
  /** The title is an `<h2>` and plan names `<h3>`; pass 1 when the block opens a pricing page. */
  headingLevel?: 1 | 2;
};

/**
 * Plans side by side, with a monthly and yearly switch, the featured plan raised on a card, a list of features and
 * a link at the foot of each plan. Lays itself out by its own width: plans stack in a narrow container.
 */
function Pricing({
  title = sampleTitle,
  description = sampleDescription,
  plans = samplePlans,
  billing: billingProp,
  defaultBilling = 'monthly',
  onBillingChange,
  billingLabels = defaultBillingLabels,
  footnote,
  headingLevel = 2,
  className,
  ...props
}: PricingProps) {
  const [ownBilling, setOwnBilling] = React.useState(defaultBilling);
  const billing = billingProp ?? ownBilling;
  const [announcement, setAnnouncement] = React.useState('');
  const id = React.useId();
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const hasBillingChoice = plans.some((plan) => isPerBilling(plan.price));

  const changeBilling = (value: string) => {
    const next = value as PricingBilling;
    setOwnBilling(next);
    setAnnouncement(billingAnnouncement(plans, next, billingLabels[next]));
    onBillingChange?.(next);
  };

  if (plans.length === 0) return null;

  return (
    <section
      data-slot="pricing"
      aria-labelledby={title ? `${id}-title` : undefined}
      className={cn('@container', className)}
      {...props}
    >
      {/* The padding sits inside the container, since a container query never matches the container itself. */}
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-14 @2xl:px-6 @2xl:py-24">
        {title ? (
          <Heading id={`${id}-title`} className="max-w-[20em] text-center text-heading text-balance text-foreground @2xl:text-display @2xl:font-semibold">
            {title}
          </Heading>
        ) : null}
        {description ? (
          <p className="mt-3 max-w-[34em] text-center text-body text-pretty text-muted-foreground @2xl:mt-4 @2xl:text-lead">{description}</p>
        ) : null}
        {hasBillingChoice ? (
          <SegmentedControl
            aria-label="Billing"
            value={billing}
            onValueChange={changeBilling}
            className={cn(title || description ? 'mt-8' : null)}
          >
            <SegmentedControlItem value="monthly">{billingLabels.monthly}</SegmentedControlItem>
            <SegmentedControlItem value="yearly">{billingLabels.yearly}</SegmentedControlItem>
          </SegmentedControl>
        ) : null}
        <span role="status" className="sr-only">
          {announcement}
        </span>
        <ul
          role="list"
          data-slot="pricing-plans"
          className={cn(
            // Each plan sets its own row gap to 0, so the 8px gap opens between plans, not between the rows a plan spans.
            'grid w-full grid-cols-1 gap-2',
            columns[plans.length] ?? '@xl:grid-cols-2 @3xl:grid-cols-3',
            title || description || hasBillingChoice ? 'mt-8 @2xl:mt-10' : null,
          )}
        >
          {plans.map((plan, index) => (
            <PricingPlanCard key={index} plan={plan} billing={billing} />
          ))}
        </ul>
        {footnote ? <p className="mt-6 max-w-[40em] text-center text-small text-pretty text-muted-foreground">{footnote}</p> : null}
      </div>
    </section>
  );
}

export { Pricing, type PricingBilling, type PricingPlan, type PricingProps };
