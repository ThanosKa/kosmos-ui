import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Pricing, type PricingPlan } from '@/registry/kosmos/blocks/pricing/pricing';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background px-4 py-12 shadow-card';

const twoPlans: PricingPlan[] = [
  {
    name: 'Free',
    description: 'For a side project or a first app.',
    price: '$0',
    period: 'forever',
    features: ['1 project', '50,000 events a month', '30 days of history'],
    action: (
      <Button variant="secondary" size="lg" href="/signup">
        Start for free
      </Button>
    ),
  },
  {
    name: 'Pro',
    description: 'For a team with an app in production.',
    price: '$49',
    period: 'per month',
    badge: <Badge variant="secondary">Most popular</Badge>,
    features: ['Everything in Free', '10 projects', '3,000,000 events a month', 'Funnels and retention', 'Email support'],
    action: (
      <Button variant="primary" size="lg" href="/signup?plan=pro">
        Start a trial
      </Button>
    ),
    featured: true,
  },
];

const longPlans: PricingPlan[] = [
  {
    name: 'Free for side projects, hobby apps and open source',
    description: 'For a side project, a first app, or an open source library that sends a few thousand events a day.',
    price: '$0',
    period: 'forever, with no card on file',
    features: [
      '1 project',
      'Events from web, iOS, Android and server apps, kept for 30 days and exported as CSV whenever you like',
      'https://acme.example/docs/sdk/server/batching-and-retries',
    ],
    action: (
      <Button variant="secondary" size="lg" href="/signup">
        Start for free
      </Button>
    ),
  },
  {
    name: 'Pro',
    price: { monthly: '$1,234,567', yearly: '$987,654' },
    period: { monthly: 'per month', yearly: 'per month, billed yearly' },
    note: { monthly: 'Billed every month on the day you signed up', yearly: '$11,851,848 billed once a year, up front' },
    saving: 'You save $2,962,956 a year',
    badge: <Badge variant="secondary">Most popular with growing teams</Badge>,
    features: ['Everything in Free', '10 projects'],
    action: (
      <Button variant="primary" size="lg" href="/signup?plan=pro">
        Start a 14-day trial
      </Button>
    ),
    featured: true,
  },
  {
    name: 'Скейл 規模',
    description: 'Для приложений с миллионами событий.',
    price: { monthly: 'Talk to us', yearly: '$960' },
    period: { monthly: 'per month', yearly: 'per month, billed yearly' },
    features: ['Everything in Pro', 'Unlimited projects', '8,000,000 events a month', 'EU data region', 'Priority support'],
  },
];

const fourPlans: PricingPlan[] = [
  ...twoPlans,
  {
    name: 'Scale',
    description: 'For apps that send millions of events.',
    price: '$1,200',
    period: 'per month',
    features: ['Everything in Pro', 'Unlimited projects', '8,000,000 events a month'],
    action: (
      <Button variant="secondary" size="lg" href="/demo">
        Book a demo
      </Button>
    ),
  },
  { name: 'Enterprise', price: 'Custom' },
];

export default function PricingPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default: three plans, monthly">
        <div className={frame}>
          <Pricing />
        </div>
      </PreviewSection>

      <PreviewSection title="Yearly, with a footnote">
        <div className={frame}>
          <Pricing defaultBilling="yearly" footnote="Prices in USD. Taxes are added at checkout where they apply." />
        </div>
      </PreviewSection>

      <PreviewSection title="Two plans, one price each: no switch">
        <div className={frame}>
          <Pricing title="Free to start, Pro when you ship" description={null} plans={twoPlans} />
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container, 320px">
        <div className={`${frame} max-w-80`}>
          <Pricing />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text, huge price, missing parts">
        <div className={frame}>
          <Pricing
            title="Pricing that grows with every web, iOS, Android and server app your team ships this year"
            description="Every plan collects events from web, iOS, Android and server apps, keeps them as long as the plan allows, and turns them into answers. Pay yearly and save 20%."
            plans={longPlans}
            billingLabels={{ monthly: 'Billed monthly', yearly: 'Billed yearly' }}
            yearlyDiscount="Two months free"
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Four plans, one with only a name and a price">
        <div className={frame}>
          <Pricing headingLevel={1} title="Pricing" description={null} plans={fourPlans} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
