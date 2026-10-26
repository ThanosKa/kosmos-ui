'use client';

import { ArrowRight, BarChart3, Bell, FolderKanban, Plus, UserPlus, Users } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Badge } from '@/registry/kosmos/ui/badge';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import {
  ChartCard,
  ChartCardAction,
  ChartCardContent,
  ChartCardDescription,
  ChartCardHeader,
  ChartCardTitle,
} from '@/registry/kosmos/ui/chart-card';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/registry/kosmos/ui/command';
import { Meter, MeterBar, MeterLabel, MeterValue } from '@/registry/kosmos/ui/meter';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

type BentoItem = {
  /** A stable key for the tile. */
  id: string;
  /** The tile's name, an `<h3>` under the section title. */
  title: React.ReactNode;
  /** One line under the title. */
  description: React.ReactNode;
  /** What the tile shows above its caption: a piece of your product, live. */
  visual: React.ReactNode;
  /** `wide` takes two of the three columns. */
  size?: 'default' | 'wide';
  /** Where the tile leads. Adds a link under the caption, the tile's one tab stop. */
  href?: string;
  /** The text of that link. */
  linkLabel?: React.ReactNode;
};

// Sample data: replace it with your product's title, line and tiles.
const sampleTitle = 'From the first event to the answer';
const sampleDescription = 'Acme collects your events, joins them to your users and keeps the numbers your team asks about ready to read.';

const card = 'w-full rounded-xl border border-transparent bg-card shadow-card';
const wholeNumber = new Intl.NumberFormat('en-US');

const sampleProjects = [
  { name: 'Fernhill Books', plan: 'Scale', hue: 'magenta', dot: 'bg-success', status: 'Live', users: 48210 },
  { name: 'Saltmarsh Coffee', plan: 'Pro', hue: 'orange', dot: 'bg-success', status: 'Live', users: 6120 },
  { name: 'Marigold Recipes', plan: 'Pro', hue: 'orange', dot: 'bg-muted-foreground', status: 'Trial', users: 1920 },
] as const;

function ProjectsTable() {
  return (
    <div className={cn(card, '@container max-w-xl overflow-hidden')}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead className="hidden @sm:table-cell">Status</TableHead>
            <TableHead className="text-end">Users</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleProjects.map((project) => (
            <TableRow key={project.name}>
              <TableCell className="max-w-36 truncate font-medium">{project.name}</TableCell>
              <TableCell>
                <Badge variant={project.hue}>{project.plan}</Badge>
              </TableCell>
              <TableCell className="hidden @sm:table-cell">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className={cn('size-2 shrink-0 rounded-full', project.dot)} />
                  {project.status}
                </span>
              </TableCell>
              <TableCell className="text-end tabular-nums">{wholeNumber.format(project.users)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

type Range = '7d' | '14d';

const sampleEvents = [
  812400, 846100, 901300, 884900, 962500, 731800, 702600, 948200, 1012700, 1046300, 1031900, 1108400, 864200, 826500,
];
const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const firstDay = Date.UTC(2026, 8, 28);
const eventData = sampleEvents.map((events, index) => ({ day: dayLabel.format(firstDay + index * 86_400_000), events }));
const chartConfig = { events: { label: 'Events', color: 'var(--chart-1)' } } satisfies ChartConfig;

function EventsChart() {
  const [range, setRange] = React.useState<Range>('14d');
  const data = range === '7d' ? eventData.slice(-7) : eventData;
  return (
    <ChartCard className="w-full max-w-xl">
      <ChartCardHeader>
        <ChartCardTitle>Events</ChartCardTitle>
        <ChartCardDescription>A day, last {range === '7d' ? '7' : '14'} days</ChartCardDescription>
        <ChartCardAction>
          <SegmentedControl size="sm" aria-label="Range" value={range} onValueChange={(value) => setRange(value as Range)}>
            <SegmentedControlItem value="7d">7 days</SegmentedControlItem>
            <SegmentedControlItem value="14d">14 days</SegmentedControlItem>
          </SegmentedControl>
        </ChartCardAction>
      </ChartCardHeader>
      <ChartCardContent className="min-h-44">
        <GrowthChart
          title={`Events a day, last ${range === '7d' ? 7 : 14} days`}
          data={data}
          config={chartConfig}
          xKey="day"
          xLabel="Day"
          valueFormatter={(value) => wholeNumber.format(value)}
        />
      </ChartCardContent>
    </ChartCard>
  );
}

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
      <CommandList className="max-h-40">
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

function Granularity() {
  return (
    <div className={cn(card, 'flex max-w-sm flex-col items-start gap-3 p-4')}>
      <p className="text-small text-muted-foreground">Group events by</p>
      <SegmentedControl aria-label="Group events by" defaultValue="day" className="w-full">
        <SegmentedControlItem value="hour">Hour</SegmentedControlItem>
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}

const sampleNotifications = [
  { id: 'signups', text: 'Signups fell below 40 a day', time: '2 min ago' },
  { id: 'errors', text: 'Error events passed 2%', time: '1 h ago' },
  { id: 'summary', text: 'Your weekly summary is ready', time: 'Mon' },
];

function Notifications() {
  return (
    <ul className={cn(card, 'w-full max-w-sm divide-y divide-border')}>
      {sampleNotifications.map((notification) => (
        <li key={notification.id} className="flex min-w-0 items-center gap-3 px-4 py-2.5 text-body">
          <Bell aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 truncate text-foreground">{notification.text}</span>
          <span className="ms-auto shrink-0 text-small text-muted-foreground tabular-nums">{notification.time}</span>
        </li>
      ))}
    </ul>
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

const sampleItems: BentoItem[] = [
  {
    id: 'table',
    title: 'Every project in one table',
    description: 'Plans, status and users that line up.',
    size: 'wide',
    visual: <ProjectsTable />,
    href: '/docs/components/table',
  },
  {
    id: 'granularity',
    title: 'Pick the grain',
    description: 'Switch between hours, days and weeks in one tap.',
    visual: <Granularity />,
    href: '/docs/components/segmented-control',
  },
  {
    id: 'notifications',
    title: 'Hear about a number when it moves',
    description: 'Alerts land in a list your team can scan.',
    visual: <Notifications />,
    href: '/docs/components/alert',
  },
  {
    id: 'chart',
    title: 'See the trend',
    description: 'A chart with a range switch, a tooltip and a table for screen readers.',
    size: 'wide',
    visual: <EventsChart />,
    href: '/docs/components/chart-card',
  },
  {
    id: 'command',
    title: 'Jump anywhere from the keyboard',
    description: 'Type to filter, arrows to move, Enter to run.',
    size: 'wide',
    visual: <CommandMenu />,
    href: '/docs/components/command',
  },
  {
    id: 'quota',
    title: 'Watch your quota',
    description: 'Usage as a bar, with the number beside it.',
    visual: <Quota />,
    href: '/docs/components/meter',
  },
];

type BentoProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  /** The section's heading. `null` leaves it out; then give the page a heading above the tiles. */
  title?: React.ReactNode;
  /** One line under the title. `null` leaves it out. */
  description?: React.ReactNode;
  /** The tiles, in reading order. */
  items?: BentoItem[];
  /** The title is an `<h2>` and the tile titles `<h3>`; pass 3 for a section nested one level deeper. */
  headingLevel?: 2 | 3;
};

/**
 * A grid of tiles, each a live piece of your product above one line of caption and an optional link. Lays itself out
 * by its own width: one column, two from 576px, three from 896px, where a `wide` tile takes two. With two columns a
 * lone last tile takes the whole row, so no gap is left.
 */
function Bento({ title = sampleTitle, description = sampleDescription, items = sampleItems, headingLevel = 2, className, ...props }: BentoProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const TileHeading = headingLevel === 2 ? 'h3' : 'h4';
  return (
    <section data-slot="bento" className={cn('@container flex flex-col', className)} {...props}>
      {title || description ? (
        <header className="mb-8 flex flex-col items-center text-center @2xl:mb-10">
          {title ? <Heading className="max-w-[20em] text-heading font-semibold text-balance text-foreground @2xl:text-display">{title}</Heading> : null}
          {description ? (
            <p data-slot="bento-description" className="mt-3 max-w-[38em] text-body text-pretty text-muted-foreground @2xl:text-lead">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      <ul role="list" className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.id}
            data-slot="bento-item"
            data-size={item.size ?? 'default'}
            className={cn(
              'group/tile flex min-w-0 flex-col rounded-2xl border border-transparent bg-card p-2 shadow-card',
              'has-[[data-slot=bento-item-link]:focus-visible]:outline-2 has-[[data-slot=bento-item-link]:focus-visible]:outline-offset-2 has-[[data-slot=bento-item-link]:focus-visible]:outline-ring',
              '@xl:@max-4xl:last:odd:col-span-2',
              item.size === 'wide' && '@4xl:col-span-2',
            )}
          >
            <div
              data-slot="bento-item-visual"
              className="flex min-h-40 flex-1 items-center justify-center overflow-hidden rounded-md border border-transparent bg-muted p-4 shadow-inset @xl:min-h-56 @xl:p-6"
            >
              <div
                className={cn(
                  'flex w-full justify-center transition-[translate] motion-safe:group-hover/tile:-translate-y-1',
                  'motion-safe:group-has-[[data-slot=bento-item-link]:focus-visible]/tile:-translate-y-1',
                )}
              >
                {item.visual}
              </div>
            </div>
            <div className="flex flex-col gap-1 px-3 pt-4 pb-3">
              <TileHeading className="text-title text-foreground">{item.title}</TileHeading>
              <p data-slot="bento-item-description" className="text-body text-pretty text-muted-foreground">
                {item.description}
              </p>
              {item.href ? (
                <a
                  data-slot="bento-item-link"
                  href={item.href}
                  className="mt-2 inline-flex w-fit items-center gap-1 rounded-sm text-body font-medium text-muted-foreground transition-[color] group-hover/tile:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                >
                  {item.linkLabel ?? 'Learn more'}
                  <ArrowRight
                    aria-hidden
                    className={cn('size-3.5 transition-[translate] motion-safe:group-hover/tile:translate-x-0.5', 'motion-safe:group-has-[[data-slot=bento-item-link]:focus-visible]/tile:translate-x-0.5')}
                  />
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { Bento, type BentoItem, type BentoProps };
