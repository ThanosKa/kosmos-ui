'use client';

import { ArrowRight, BarChart3, FolderKanban, Plus, UserPlus, Users } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import { ChartCard, ChartCardContent, ChartCardDescription, ChartCardHeader, ChartCardTitle } from '@/registry/kosmos/ui/chart-card';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/registry/kosmos/ui/command';
import { Meter, MeterBar, MeterLabel, MeterValue } from '@/registry/kosmos/ui/meter';

type FeatureRowItem = {
  /** A stable key for the row. */
  id: string;
  /** The feature in a few words, an `<h3>` under the section title. */
  title: React.ReactNode;
  /** One sentence under the title. */
  description: React.ReactNode;
  /** What the feature looks like: a live piece of your product, or an image. The stage crops it at its outer edge. */
  media: React.ReactNode;
  /** Where the row leads. Adds a link under the sentence. */
  href?: string;
  /** The text of that link. */
  linkLabel?: React.ReactNode;
};

// Sample data: replace it with your product's title, line and rows.
const sampleTitle = 'Every part at the size you will use it';
const sampleDescription = 'Acme keeps your numbers, your search and your limits where your team already looks.';

const card = 'w-full rounded-xl border border-transparent bg-card shadow-card';

const sampleCommands = [
  { value: 'projects', label: 'Go to Projects', icon: FolderKanban },
  { value: 'users', label: 'Go to Users', icon: Users },
  { value: 'revenue', label: 'Go to Revenue', icon: BarChart3 },
  { value: 'roadmap-item', label: 'New roadmap item', icon: Plus },
  { value: 'invite', label: 'Invite teammate', icon: UserPlus },
];

function CommandMenu() {
  return (
    <Command items={sampleCommands} className="max-w-md">
      <CommandInput placeholder="Search Acme…" aria-label="Search Acme" />
      <CommandEmpty>No commands found.</CommandEmpty>
      <CommandList className="max-h-48">
        {(command: (typeof sampleCommands)[number]) => (
          <CommandItem key={command.value} value={command}>
            <command.icon aria-hidden />
            {command.label}
          </CommandItem>
        )}
      </CommandList>
    </Command>
  );
}

const sampleEvents = [
  812400, 846100, 901300, 884900, 962500, 731800, 702600, 948200, 1012700, 1046300, 1031900, 1108400, 864200, 826500,
];
const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const wholeNumber = new Intl.NumberFormat('en-US');
const eventData = sampleEvents.map((events, index) => ({ day: dayLabel.format(Date.UTC(2026, 8, 28) + index * 86_400_000), events }));
const chartConfig = { events: { label: 'Events', color: 'var(--chart-1)' } } satisfies ChartConfig;

function EventsChart() {
  return (
    <ChartCard className="w-full max-w-2xl">
      <ChartCardHeader>
        <ChartCardTitle>Events</ChartCardTitle>
        <ChartCardDescription>A day, last 14 days</ChartCardDescription>
      </ChartCardHeader>
      <ChartCardContent className="min-h-44">
        <GrowthChart
          title="Events a day, last 14 days"
          data={eventData}
          config={chartConfig}
          xKey="day"
          xLabel="Day"
          valueFormatter={(value) => wholeNumber.format(value)}
        />
      </ChartCardContent>
    </ChartCard>
  );
}

function Quota() {
  return (
    <div className={cn(card, 'flex max-w-sm flex-col gap-5 p-4')}>
      <Meter value={78}>
        <MeterLabel>Events this month</MeterLabel>
        <MeterValue />
        <MeterBar />
      </Meter>
      <Meter value={38}>
        <MeterLabel>Started a trial</MeterLabel>
        <MeterValue />
        <MeterBar />
      </Meter>
    </div>
  );
}

const sampleItems: FeatureRowItem[] = [
  {
    id: 'command',
    title: 'Jump anywhere from the keyboard',
    description: 'Type to filter, use the arrows to move and press Enter to run.',
    media: <CommandMenu />,
    href: '/docs/components/command',
    linkLabel: 'See the command menu',
  },
  {
    id: 'chart',
    title: 'See the trend',
    description: 'A chart with a tooltip, and a table of the same numbers for screen readers.',
    media: <EventsChart />,
    href: '/docs/components/chart-card',
    linkLabel: 'See the chart',
  },
  {
    id: 'quota',
    title: 'Watch your quota',
    description: 'Usage as a bar, with the number beside it.',
    media: <Quota />,
    href: '/docs/components/meter',
    linkLabel: 'See the meter',
  },
];

type FeatureRowsProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  /** The section's heading. `null` leaves it out; then give the page a heading above the rows. */
  title?: React.ReactNode;
  /** One line under the title. `null` leaves it out. */
  description?: React.ReactNode;
  /** The rows, top to bottom. */
  items?: FeatureRowItem[];
  /** The title is an `<h2>` and the row titles `<h3>`; pass 3 for a section nested one level deeper. */
  headingLevel?: 2 | 3;
  /** Renders the row links, such as your router's `Link`. Defaults to `<a>`. */
  linkComponent?: React.ElementType<React.ComponentProps<'a'> & { href: string }>;
};

const linkClass =
  'group/link inline-flex w-fit items-center gap-1 rounded-sm text-body font-medium text-foreground transition-[color] hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/**
 * A list of features, one per row: the title, one sentence and a link on one side, a live piece of your product on a
 * recessed stage on the other. The rows alternate sides, and the stage crops its media at the outer edge so the
 * product reads larger than the stage. Lays itself out by its own width: the copy sits above the stage, and beside it
 * from a 768px-wide container.
 */
function FeatureRows({
  title = sampleTitle,
  description = sampleDescription,
  items = sampleItems,
  headingLevel = 2,
  linkComponent: Link = 'a',
  className,
  ...props
}: FeatureRowsProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const RowHeading = headingLevel === 2 ? 'h3' : 'h4';
  return (
    <section data-slot="feature-rows" className={cn('@container flex flex-col', className)} {...props}>
      {title || description ? (
        <header className="mb-10 flex flex-col items-center text-center @3xl:mb-14">
          {title ? <Heading className="max-w-[20em] text-heading font-semibold text-balance text-foreground @2xl:text-display">{title}</Heading> : null}
          {description ? (
            <p data-slot="feature-rows-description" className="mt-3 max-w-[38em] text-body text-pretty text-muted-foreground @2xl:text-lead">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      <ul role="list" className="flex flex-col gap-16 @3xl:gap-24">
        {items.map((item, index) => {
          const flipped = index % 2 === 1;
          return (
            <li
              key={item.id}
              data-slot="feature-rows-item"
              data-side={flipped ? 'start' : 'end'}
              className="grid min-w-0 grid-cols-1 gap-6 @3xl:grid-cols-12 @3xl:items-center @3xl:gap-12"
            >
              <div className={cn('flex min-w-0 flex-col items-start gap-3 @3xl:col-span-4', flipped && '@3xl:order-2')}>
                <RowHeading className="text-heading font-semibold text-balance text-foreground">{item.title}</RowHeading>
                <p data-slot="feature-rows-item-description" className="text-body text-pretty text-muted-foreground">
                  {item.description}
                </p>
                {item.href ? (
                  <Link href={item.href} data-slot="feature-rows-item-link" className={linkClass}>
                    {item.linkLabel ?? 'Learn more'}
                    <ArrowRight aria-hidden className="size-3.5 transition-[translate] motion-safe:group-hover/link:translate-x-0.5" />
                  </Link>
                ) : null}
              </div>
              <div
                data-slot="feature-rows-item-media"
                className={cn(
                  'flex min-h-64 min-w-0 items-center overflow-hidden rounded-2xl border border-transparent bg-muted p-4 shadow-inset @xl:p-6 @3xl:col-span-8 @3xl:min-h-80 @3xl:p-10',
                  flipped ? 'justify-end' : 'justify-start',
                )}
              >
                <div className="w-full min-w-0 @3xl:min-w-136">{item.media}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { FeatureRows, type FeatureRowItem, type FeatureRowsProps };
