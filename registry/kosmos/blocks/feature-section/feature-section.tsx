'use client';

import { CalendarClock, Check, FileDown, Link2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { GrowthChart } from '@/registry/kosmos/ui/chart';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

type FeatureSectionPoint = {
  /** A stable key for the point. */
  id: string;
  /** The point in a few words. With `href`, it is the link to read more. */
  title: React.ReactNode;
  /** One line under the title. */
  description?: React.ReactNode;
  /** Where the title links to, such as the docs page of the point. */
  href?: string;
  /** A 16px icon before the point, decorative. A check mark when left out. */
  icon?: React.ReactNode;
};

// Sample data: replace it with your feature's title, line, visual, card text, points and action.
const sampleTitle = 'Dashboards your whole team reads';
const sampleDescription = 'Pin the numbers you check every morning. Acme keeps them current, a minute behind your events.';
const sampleCardTitle = 'One view for everyone';
const sampleCardDescription = 'Build a dashboard once and every teammate opens the same numbers, with the same filters, at the same time.';
const samplePoints: FeatureSectionPoint[] = [
  {
    id: 'share',
    title: 'Share it with a link',
    description: 'Anyone in your workspace opens the live view.',
    href: '/docs/dashboards/share',
    icon: <Link2 />,
  },
  {
    id: 'digest',
    title: 'Send a Monday digest',
    description: 'Every pinned number, in one email to the team.',
    href: '/docs/dashboards/digest',
    icon: <CalendarClock />,
  },
  {
    id: 'export',
    title: 'Export any chart',
    description: 'Take the rows behind it into a spreadsheet as CSV.',
    href: '/docs/dashboards/export',
    icon: <FileDown />,
  },
];
const sampleAction = (
  <Button variant="secondary" href="/docs/dashboards">
    Read the dashboards guide
  </Button>
);

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const userFormat = new Intl.NumberFormat('en-US');
const changeFormat = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1, signDisplay: 'always' });

/**
 * Active users per point, one point every `stepDays` days up to 11 October 2026, ending at `last` and rising by about
 * `perDay` a day with small swings.
 */
function activeUsers(points: number, stepDays: number, last: number, perDay: number) {
  const today = Date.UTC(2026, 9, 11);
  return Array.from({ length: points }, (_, index) => {
    const daysAgo = (points - 1 - index) * stepDays;
    const users = Math.round(last - daysAgo * perDay + Math.sin(daysAgo * 1.7) * last * 0.015);
    return { date: dateFormat.format(today - daysAgo * 86_400_000), users };
  });
}

const sampleRanges = {
  '7d': { label: '7 days', total: 61_240, change: 0.031, data: activeUsers(7, 1, 29_400, 90) },
  '30d': { label: '30 days', total: 144_600, change: 0.096, data: activeUsers(30, 1, 29_400, 90) },
  '90d': { label: '90 days', total: 312_800, change: 0.214, data: activeUsers(13, 7, 74_800, 155) },
};
type SampleRange = keyof typeof sampleRanges;

function SampleDashboard() {
  const [range, setRange] = React.useState<SampleRange>('30d');
  const { label, total, change, data } = sampleRanges[range];
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body font-medium text-foreground">Active users</p>
        <SegmentedControl aria-label="Range" size="sm" value={range} onValueChange={(value) => setRange(value as SampleRange)}>
          {Object.keys(sampleRanges).map((key) => (
            <SegmentedControlItem key={key} value={key}>
              {key}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-display text-foreground tabular-nums">{userFormat.format(total)}</span>
        <span className="flex items-center gap-2 text-small text-muted-foreground">
          <Badge variant={change < 0 ? 'red' : 'green'}>{changeFormat.format(change)}</Badge>
          vs. previous {label}
        </span>
      </div>
      <GrowthChart
        title={`Active users, last ${label}`}
        data={data}
        xKey="date"
        xLabel="Date"
        config={{ users: { label: 'Active users', color: 'var(--chart-1)' } }}
        valueFormatter={(value) => userFormat.format(value)}
      />
    </div>
  );
}

const linkClass =
  'rounded-sm text-foreground underline decoration-foreground/30 underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

type FeatureSectionProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  /** The section's heading. `null` leaves the header out; then give the page a heading above the tray. */
  title?: React.ReactNode;
  /** One line under the title. `null` leaves it out. */
  description?: React.ReactNode;
  /** What the feature looks like: a piece of your product, live, or an image. Sits in the larger card. */
  visual?: React.ReactNode;
  /** The heading of the card beside the visual. `null` leaves it out. */
  cardTitle?: React.ReactNode;
  /** A short paragraph under the card's heading. `null` leaves it out. */
  cardDescription?: React.ReactNode;
  /** What the feature lets people do, each with an optional link. */
  points?: FeatureSectionPoint[];
  /** One `secondary` Button under the points. `null` leaves it out. */
  action?: React.ReactNode;
  /** Where the visual sits: `start` before the text (above it on a narrow page), `end` after it. */
  visualSide?: 'start' | 'end';
  /** The title is an `<h2>` and the card's heading an `<h3>`; pass 3 for a section nested one level deeper. */
  headingLevel?: 2 | 3;
  /** Renders the point links, such as your router's `Link`. Defaults to `<a>`. */
  linkComponent?: React.ElementType<React.ComponentProps<'a'> & { href: string }>;
};

/**
 * One feature, shown and explained: a title over a recessed tray that holds two cards, the visual in the larger one
 * and the text, points and action beside it. Lays itself out by its own width: the cards stack, and sit side by side
 * from a 768px-wide container.
 */
function FeatureSection({
  title = sampleTitle,
  description = sampleDescription,
  visual = <SampleDashboard />,
  cardTitle = sampleCardTitle,
  cardDescription = sampleCardDescription,
  points = samplePoints,
  action = sampleAction,
  visualSide = 'start',
  headingLevel = 2,
  linkComponent: Link = 'a',
  className,
  ...props
}: FeatureSectionProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const CardHeading = headingLevel === 2 ? 'h3' : 'h4';
  const visualCard = (
    <div
      key="visual"
      data-slot="feature-section-visual"
      className="flex min-w-0 items-center justify-center rounded-2xl border border-transparent bg-card p-5 shadow-card @3xl:p-6"
    >
      {visual}
    </div>
  );
  const textCard = (
    <div
      key="card"
      data-slot="feature-section-card"
      className="flex min-w-0 flex-col gap-5 rounded-2xl border border-transparent bg-card p-5 shadow-card @3xl:p-6"
    >
      {cardTitle || cardDescription ? (
        <div className="flex flex-col gap-1.5">
          {cardTitle ? <CardHeading className="text-title text-balance text-foreground">{cardTitle}</CardHeading> : null}
          {cardDescription ? <p className="text-body text-pretty text-muted-foreground">{cardDescription}</p> : null}
        </div>
      ) : null}
      {points.length > 0 ? (
        <ul role="list" className="flex flex-col gap-4">
          {points.map((point) => (
            <li key={point.id} data-slot="feature-section-point" className="flex min-w-0 gap-3">
              <span aria-hidden className="flex h-5 shrink-0 items-center text-muted-foreground [&_svg]:size-4">
                {point.icon ?? <Check />}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5 wrap-break-word">
                <span className="text-body font-medium text-foreground">
                  {point.href ? (
                    <Link href={point.href} className={linkClass}>
                      {point.title}
                    </Link>
                  ) : (
                    point.title
                  )}
                </span>
                {point.description ? <p className="text-small text-pretty text-muted-foreground">{point.description}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {action ? <div className="mt-auto flex pt-1">{action}</div> : null}
    </div>
  );
  return (
    <section data-slot="feature-section" className={cn('@container flex flex-col', className)} {...props}>
      {title || description ? (
        <header className="mb-8 flex flex-col items-center text-center @2xl:mb-10">
          {title ? <Heading className="max-w-[20em] text-heading font-semibold text-balance text-foreground @2xl:text-display">{title}</Heading> : null}
          {description ? (
            <p data-slot="feature-section-description" className="mt-3 max-w-[38em] text-body text-pretty text-muted-foreground @2xl:text-lead">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      <div
        data-slot="feature-section-tray"
        data-visual-side={visualSide}
        className={cn(
          'mx-auto grid w-full max-w-5xl grid-cols-1 gap-1 rounded-3xl border border-transparent bg-muted p-1 shadow-inset',
          visualSide === 'start' ? '@3xl:grid-cols-[1.25fr_1fr]' : '@3xl:grid-cols-[1fr_1.25fr]',
        )}
      >
        {visualSide === 'start' ? [visualCard, textCard] : [textCard, visualCard]}
      </div>
    </section>
  );
}

export { FeatureSection, type FeatureSectionPoint, type FeatureSectionProps };
