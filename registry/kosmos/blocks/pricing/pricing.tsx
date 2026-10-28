'use client';

import { Check } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

type PricingBilling = 'monthly' | 'yearly';

/** Text that is the same for both billings, or one per billing. */
type PerBilling = string | Record<PricingBilling, string>;

type PricingPlan = {
  name: string;
  /** One line under the name: who the plan is for. */
  description?: React.ReactNode;
  /** The price as it reads, such as `'$49'`: one for both billings, or `{ monthly, yearly }`. */
  price: PerBilling;
  /** The muted words after the price, such as `'per month'`. */
  period?: PerBilling;
  /** One muted line under the price, such as `'No card needed'` or `{ monthly: 'Billed monthly', yearly: '$468 billed yearly' }`. */
  note?: PerBilling;
  /** What a year costs less on yearly billing, such as `'You save $120'`: shown in green after the note on Yearly only. */
  saving?: string;
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
const sampleYearlyDiscount = '−20%';
const samplePlans: PricingPlan[] = [
  {
    name: 'Free',
    description: 'For a side project or a first app.',
    price: '$0',
    period: 'forever',
    note: 'No card needed',
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
    period: 'per month',
    note: { monthly: 'Billed monthly', yearly: '$468 billed yearly' },
    saving: 'You save $120',
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
    period: 'per month',
    note: { monthly: 'Billed monthly', yearly: '$11,520 billed yearly' },
    saving: 'You save $2,880',
    features: ['Everything in Pro', 'Unlimited projects', '8,000,000 events a month', 'EU data region', 'Priority support'],
    action: (
      <Button variant="secondary" size="lg" href="/demo">
        Book a demo
      </Button>
    ),
  },
];

const defaultBillingLabels: Record<PricingBilling, string> = { monthly: 'Monthly', yearly: 'Yearly' };

function isPerBilling(value: PerBilling | undefined): value is Record<PricingBilling, string> {
  return typeof value === 'object';
}

function forBilling(value: PerBilling | undefined, billing: PricingBilling) {
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
const columnsByPlanCount: Record<number, string> = {
  1: 'mx-auto w-full max-w-sm',
  2: 'mx-auto w-full max-w-3xl @xl:grid-cols-2',
  3: '@3xl:grid-cols-3',
  4: '@xl:grid-cols-2 @5xl:grid-cols-4',
};

const billings: PricingBilling[] = ['monthly', 'yearly'];

/**
 * Text that differs by billing, such as a period or a note. Every billing's text sits in the same spot, sized to the
 * widest so a line never rewraps, and only the shown one is visible: the old text leaves the way the switch moved and
 * the new one rises in from the other side. Under reduced motion the texts cross-fade in place.
 */
function BillingText({ value, billing, className }: { value: Record<PricingBilling, string>; billing: PricingBilling; className?: string }) {
  const shownIndex = billings.indexOf(billing);
  return (
    <span className={cn('inline-grid max-w-full', className)}>
      {billings.map((item, index) => {
        const shown = index === shownIndex;
        return (
          <span
            key={item}
            aria-hidden={shown ? undefined : true}
            className={cn(
              'col-start-1 row-start-1 transition-[opacity,translate,filter]',
              shown ? 'duration-slow' : 'pointer-events-none opacity-0 duration-fast motion-safe:blur-[2px]',
              index < shownIndex && 'motion-safe:-translate-y-[0.4em]',
              index > shownIndex && 'motion-safe:translate-y-[0.4em]',
            )}
          >
            {value[item]}
          </span>
        );
      })}
    </span>
  );
}

function amountOf(price: string) {
  return Number(price.replace(/[^\d.]/g, '')) || 0;
}

const hasDigit = (price: string) => /\d/.test(price);

/** Splits `$1,200` into the prefix that never moves (`$`) and the characters after it, last one first. */
function splitPrice(price: string) {
  const prefix = /^\D*/.exec(price)?.[0] ?? '';
  return { prefix, chars: [...price.slice(prefix.length)].reverse() };
}

/**
 * Lines a price up by place from the right, so units stay over units, and remembers the most places it has had, so
 * a place that empties ($1,200 to $960) collapses showing what it held instead of vanishing. The direction is whether
 * the amount rose or fell.
 */
function usePricePlaces(price: string) {
  const { prefix, chars } = splitPrice(price);
  const [state, setState] = React.useState({ price, held: chars, rising: true });
  if (state.price !== price) {
    const held = Array.from({ length: Math.max(state.held.length, chars.length) }, (_, place) => chars[place] ?? state.held[place]);
    setState({ price, held, rising: amountOf(price) >= amountOf(state.price) });
  }
  const held = Array.from({ length: Math.max(state.held.length, chars.length) }, (_, place) => chars[place] ?? state.held[place]);
  return { prefix, chars, held, rising: state.rising };
}

/** Eases its width to nothing while hidden, so the text after it slides instead of jumping. */
function Collapse({ shown, children, className }: { shown: boolean; children: React.ReactNode; className?: string }) {
  return (
    <span
      aria-hidden={shown ? undefined : true}
      className={cn(
        'inline-grid motion-safe:transition-[grid-template-columns,opacity] motion-reduce:transition-[opacity] ease-smooth-in-out',
        shown ? 'grid-cols-[1fr] duration-slow' : 'grid-cols-[0fr] opacity-0 duration-fast',
        className,
      )}
    >
      <span className="min-w-0 overflow-hidden whitespace-nowrap">{children}</span>
    </span>
  );
}

type CharLayer = { id: number; char: string; leaving: boolean; entering: boolean };

/**
 * One place of a price. When its character changes, the old one leaves the way the amount moved and the new one
 * rises in from the other side; a place whose character stays the same does not move. Under reduced motion the two
 * cross-fade.
 */
function PriceChar({ char, rising }: { char: string; rising: boolean }) {
  const [state, setState] = React.useState<{ char: string; next: number; layers: CharLayer[] }>({
    char,
    next: 1,
    layers: [{ id: 0, char, leaving: false, entering: false }],
  });
  if (state.char !== char) {
    setState({
      char,
      next: state.next + 1,
      layers: [...state.layers.map((layer) => ({ ...layer, leaving: true })), { id: state.next, char, leaving: false, entering: true }],
    });
  }
  const drop = (id: number) => (event: React.TransitionEvent) => {
    if (event.propertyName !== 'opacity') return;
    setState((current) => ({ ...current, layers: current.layers.filter((layer) => layer.id !== id) }));
  };
  return (
    <span data-rising={rising ? '' : undefined} className={cn('group/place inline-grid', state.layers.length > 1 && 'mask-y-from-75%')}>
      {state.layers.map((layer) => (
        <span
          key={layer.id}
          onTransitionEnd={layer.leaving ? drop(layer.id) : undefined}
          className={cn(
            'col-start-1 row-start-1 text-center transition-[opacity,translate,filter]',
            layer.leaving
              ? 'opacity-0 duration-fast motion-safe:blur-[2px] motion-safe:translate-y-[0.5em] group-data-rising/place:motion-safe:-translate-y-[0.5em]'
              : 'duration-slow',
            layer.entering &&
              'starting:opacity-0 motion-safe:starting:-translate-y-[0.5em] motion-safe:starting:blur-[2px] group-data-rising/place:motion-safe:starting:translate-y-[0.5em]',
          )}
        >
          {layer.char}
        </span>
      ))}
    </span>
  );
}

/** A price that changes by place: only the digits that differ slide, and a place that empties collapses. */
function PriceNumber({ price, className }: { price: string; className?: string }) {
  const { prefix, chars, held, rising } = usePricePlaces(price);
  return (
    // A price reads left to right in every language, so its places never reverse on a right-to-left page.
    <span dir="ltr" className={cn('inline-flex tabular-nums', className)}>
      <span aria-hidden className="inline-flex">
        {prefix}
        {held.map((_, index) => {
          const place = held.length - 1 - index;
          return (
            <Collapse key={place} shown={chars[place] !== undefined}>
              <PriceChar char={held[place]} rising={rising} />
            </Collapse>
          );
        })}
      </span>
      <span className="sr-only">{price}</span>
    </span>
  );
}

function PricingPlanCard({ plan, billing, headingLevel }: { plan: PricingPlan; billing: PricingBilling; headingLevel: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const period = forBilling(plan.period, billing);
  const action = typeof plan.action === 'function' ? plan.action(billing) : plan.action;
  const prices = isPerBilling(plan.price) ? plan.price : undefined;
  const bothAmounts = prices !== undefined && hasDigit(prices.monthly) && hasDigit(prices.yearly);
  // Digits slide only between two amounts in the same currency; "Custom" to "$49" fades the new price in instead.
  const slides = bothAmounts && splitPrice(prices.monthly).prefix === splitPrice(prices.yearly).prefix;
  // The monthly price is struck through only when yearly billing makes the plan cheaper.
  const showsMonthly = bothAmounts && amountOf(prices.yearly) < amountOf(prices.monthly);
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
          <Heading className="min-w-0 text-title wrap-break-word text-foreground">{plan.name}</Heading>
          {plan.badge}
        </div>
        {plan.description ? <p className="text-small text-pretty text-muted-foreground">{plan.description}</p> : null}
      </div>
      <div data-slot="pricing-price" className="mt-5 flex min-w-0 flex-col gap-1">
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
          {prices && slides ? (
            <PriceNumber price={prices[billing]} className="text-display text-foreground" />
          ) : prices ? (
            <span key={billing} className="min-w-0 text-display wrap-break-word text-foreground tabular-nums transition-[opacity] duration-slow starting:opacity-0">
              {prices[billing]}
            </span>
          ) : (
            <span className="min-w-0 text-display wrap-break-word text-foreground tabular-nums">{forBilling(plan.price, billing)}</span>
          )}
          {prices && showsMonthly ? (
            <Collapse shown={billing === 'yearly'} className="-me-1.5">
              <span className="sr-only">instead of </span>
              <s className="me-1.5 text-title font-normal text-muted-foreground tabular-nums decoration-1">{prices.monthly}</s>
            </Collapse>
          ) : null}
          {isPerBilling(plan.period) ? (
            <BillingText value={plan.period} billing={billing} className="text-small text-muted-foreground" />
          ) : period ? (
            <span className="text-small text-muted-foreground">{period}</span>
          ) : null}
        </p>
        {plan.note || plan.saving ? (
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 text-small text-muted-foreground">
            {isPerBilling(plan.note) ? <BillingText value={plan.note} billing={billing} className="tabular-nums" /> : <span>{plan.note}</span>}
            {plan.saving ? (
              <Collapse shown={billing === 'yearly'}>
                <span className="text-tint-green-foreground tabular-nums">{plan.saving}</span>
              </Collapse>
            ) : null}
          </p>
        ) : null}
      </div>
      {plan.features?.length ? (
        <ul role="list" className="mt-5 flex flex-col gap-2.5 border-t border-border pt-5 pb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex min-w-0 items-start gap-2 text-body text-foreground">
              <Check aria-hidden className="mt-0.75 size-3.5 shrink-0" />
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
  /** The name of the switch for screen readers. */
  billingLabel?: string;
  /** A short mark in green on the Yearly choice, such as `'−20%'`. The sample plans bring one; your own plans do not. */
  yearlyDiscount?: string;
  /** A line under the plans, such as a note on taxes or a link to the license. */
  footnote?: React.ReactNode;
  /** The title is an `<h2>` and plan names `<h3>`; pass 1 when the block opens a pricing page, for an `<h1>` and `<h2>`s. */
  headingLevel?: 1 | 2;
};

/**
 * Plans side by side, with a monthly and yearly switch, the featured plan raised on a card, a list of features and
 * a link at the foot of each plan. Lays itself out by its own width: plans stack in a narrow container. It sets no
 * padding around itself, so the page that stacks it sets the space above and below.
 */
function Pricing({
  title = sampleTitle,
  description = sampleDescription,
  plans = samplePlans,
  billing: billingProp,
  defaultBilling = 'monthly',
  onBillingChange,
  billingLabels = defaultBillingLabels,
  billingLabel = 'Billing',
  yearlyDiscount = plans === samplePlans ? sampleYearlyDiscount : undefined,
  footnote,
  headingLevel = 2,
  className,
  ...props
}: PricingProps) {
  const [ownBilling, setOwnBilling] = React.useState(defaultBilling);
  const billing = billingProp ?? ownBilling;
  const id = React.useId();
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const hasBillingChoice = plans.some((plan) => isPerBilling(plan.price));
  const hasIntro = Boolean(title || description || hasBillingChoice);

  // Announce every change of billing, from the switch or from a parent that controls `billing`, but not the first one shown.
  const [announced, setAnnounced] = React.useState({ billing, text: '' });
  if (announced.billing !== billing) {
    setAnnounced({ billing, text: billingAnnouncement(plans, billing, billingLabels[billing]) });
  }

  const changeBilling = (value: string) => {
    const next = value as PricingBilling;
    setOwnBilling(next);
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
      <div className="mx-auto flex max-w-5xl flex-col items-center">
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
            aria-label={billingLabel}
            value={billing}
            onValueChange={changeBilling}
            className={title || description ? 'mt-8' : undefined}
          >
            <SegmentedControlItem value="monthly">{billingLabels.monthly}</SegmentedControlItem>
            <SegmentedControlItem value="yearly">
              {billingLabels.yearly}
              {yearlyDiscount ? (
                <Badge variant="green">{yearlyDiscount}</Badge>
              ) : null}
            </SegmentedControlItem>
          </SegmentedControl>
        ) : null}
        <span role="status" className="sr-only">
          {announced.text}
        </span>
        <ul
          role="list"
          data-slot="pricing-plans"
          className={cn(
            // Each plan sets its own row gap to 0, so the 8px gap opens between plans, not between the rows a plan spans.
            'grid w-full grid-cols-1 gap-2',
            columnsByPlanCount[plans.length] ?? '@xl:grid-cols-2 @3xl:grid-cols-3',
            hasIntro ? 'mt-8 @2xl:mt-10' : null,
          )}
        >
          {plans.map((plan, index) => (
            <PricingPlanCard key={index} plan={plan} billing={billing} headingLevel={headingLevel === 1 ? 2 : 3} />
          ))}
        </ul>
        {footnote ? <p className="mt-6 max-w-[40em] text-center text-small text-pretty text-muted-foreground">{footnote}</p> : null}
      </div>
    </section>
  );
}

export { Pricing, type PricingBilling, type PricingPlan, type PricingProps };
