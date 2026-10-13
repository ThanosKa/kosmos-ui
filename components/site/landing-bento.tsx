'use client';

import { BarChart3, FolderKanban, Plus, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Bento, type BentoItem } from '@/registry/kosmos/blocks/bento/bento';
import { Badge } from '@/registry/kosmos/ui/badge';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/registry/kosmos/ui/command';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { Meter, MeterBar, MeterLabel, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';
import { OtpField } from '@/registry/kosmos/ui/otp-field';
import { Switch } from '@/registry/kosmos/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

const titleLink =
  'rounded-sm transition-[color] hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** A tile title that opens the component's docs page. */
function ComponentTitle({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Link href={`/docs/components/${name}`} className={titleLink}>
      {children}
    </Link>
  );
}

const card = 'w-full rounded-xl border border-transparent bg-card shadow-card';

const commands = [
  { value: 'projects', label: 'Go to Projects', icon: FolderKanban },
  { value: 'users', label: 'Go to Users', icon: Users },
  { value: 'revenue', label: 'Go to Revenue', icon: BarChart3 },
  { value: 'roadmap-item', label: 'New roadmap item', icon: Plus },
  { value: 'invite', label: 'Invite teammate', icon: UserPlus },
];

function CommandVisual() {
  return (
    <Command items={commands} className="max-w-md">
      <CommandInput placeholder="Search Parallax…" aria-label="Search Parallax" />
      <CommandEmpty>No commands found.</CommandEmpty>
      <CommandList className="max-h-48">
        {(command: (typeof commands)[number]) => (
          <CommandItem key={command.value} value={command}>
            <command.icon aria-hidden />
            {command.label}
          </CommandItem>
        )}
      </CommandList>
    </Command>
  );
}

const alerts = [
  { id: 'signup-alert', label: 'Signups drop below 40 a day', description: 'Checked every hour', on: true },
  { id: 'error-alert', label: 'Error events pass 2%', description: 'Checked every 5 minutes', on: false },
];

function SwitchVisual() {
  return (
    <div className={`${card} max-w-sm divide-y divide-border px-4`}>
      {alerts.map((alert) => (
        <Field key={alert.id} name={alert.id} orientation="horizontal" className="py-3">
          <FieldContent>
            <FieldLabel>{alert.label}</FieldLabel>
            <FieldDescription>{alert.description}</FieldDescription>
          </FieldContent>
          <Switch defaultChecked={alert.on} />
        </Field>
      ))}
    </div>
  );
}

function OtpVisual() {
  return (
    <div className={`${card} max-w-sm p-4`}>
      <Field>
        <FieldLabel>Verification code</FieldLabel>
        <OtpField name="landing-code" />
        <FieldDescription>We sent a code to lena@parallax.example.</FieldDescription>
      </Field>
    </div>
  );
}

const weeklyEvents = [
  { day: 'Sep 28', events: 812400 },
  { day: 'Sep 29', events: 846100 },
  { day: 'Sep 30', events: 901300 },
  { day: 'Oct 1', events: 884900 },
  { day: 'Oct 2', events: 962500 },
  { day: 'Oct 3', events: 731800 },
  { day: 'Oct 4', events: 702600 },
  { day: 'Oct 5', events: 948200 },
  { day: 'Oct 6', events: 1012700 },
  { day: 'Oct 7', events: 1046300 },
  { day: 'Oct 8', events: 1031900 },
  { day: 'Oct 9', events: 1108400 },
  { day: 'Oct 10', events: 864200 },
  { day: 'Oct 11', events: 826500 },
];

const chartConfig = { events: { label: 'Events', color: 'var(--chart-1)' } } satisfies ChartConfig;
const wholeNumber = new Intl.NumberFormat('en-US');

function ChartVisual() {
  return (
    <div className={`${card} max-w-xl p-4`}>
      <GrowthChart
        title="Events a day, 28 September to 11 October 2026"
        data={weeklyEvents}
        config={chartConfig}
        xKey="day"
        xLabel="Day"
        valueFormatter={(value) => wholeNumber.format(value)}
      />
    </div>
  );
}

const projects = [
  { name: 'Fernhill Books', plan: 'Scale', hue: 'magenta', status: 'Live', dot: 'bg-success', users: 48210 },
  { name: 'Saltmarsh Coffee', plan: 'Pro', hue: 'orange', status: 'Live', dot: 'bg-success', users: 6120 },
  { name: 'Marigold Recipes', plan: 'Pro', hue: 'orange', status: 'Trial', dot: 'bg-muted-foreground', users: 1920 },
] as const;

function TableVisual() {
  return (
    <div className={`${card} @container max-w-xl overflow-hidden`}>
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
          {projects.map((project) => (
            <TableRow key={project.name}>
              <TableCell className="max-w-36 truncate font-medium">{project.name}</TableCell>
              <TableCell>
                <Badge variant={project.hue}>{project.plan}</Badge>
              </TableCell>
              <TableCell className="hidden @sm:table-cell">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className={`size-2 shrink-0 rounded-full ${project.dot}`} />
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

function MeterVisual() {
  return (
    <div className={`${card} flex max-w-sm flex-col gap-5 p-4`}>
      <Meter value={78}>
        <MeterLabel>Events this month</MeterLabel>
        <MeterValue />
        <MeterBar />
      </Meter>
      <Meter value={7} max={10} format={{ style: 'decimal' }}>
        <MeterLabel>Seats used</MeterLabel>
        <MeterValue>{(_formatted, value) => `${value} of 10`}</MeterValue>
        <MeterSegments count={10} />
      </Meter>
    </div>
  );
}

const tiles: BentoItem[] = [
  {
    id: 'command',
    size: 'wide',
    title: <ComponentTitle name="command">Command</ComponentTitle>,
    description: 'Search and run any action from the keyboard. Type to filter.',
    visual: <CommandVisual />,
  },
  {
    id: 'switch',
    title: <ComponentTitle name="switch">Switch</ComponentTitle>,
    description: 'Settings that take effect the moment you flip them.',
    visual: <SwitchVisual />,
  },
  {
    id: 'otp-field',
    title: <ComponentTitle name="otp-field">OTP field</ComponentTitle>,
    description: 'A one-time code that pastes and moves on by itself.',
    visual: <OtpVisual />,
  },
  {
    id: 'chart',
    size: 'wide',
    title: <ComponentTitle name="chart">Chart</ComponentTitle>,
    description: 'A value over time, with a tooltip and a table for screen readers.',
    visual: <ChartVisual />,
  },
  {
    id: 'table',
    size: 'wide',
    title: <ComponentTitle name="table">Table</ComponentTitle>,
    description: 'Rows with tags, status dots and numbers that line up.',
    visual: <TableVisual />,
  },
  {
    id: 'meter',
    title: <ComponentTitle name="meter">Meter</ComponentTitle>,
    description: 'A quota or a score, as a bar or as segments.',
    visual: <MeterVisual />,
  },
];

/** The landing's bento: real Kosmos components in the Bento block, each linked to its docs. */
export function ComponentBento({ componentCount }: { componentCount: number }) {
  return (
    <Bento
      title="Try the components right here"
      description={`${componentCount} components on Base UI, with keyboard support, focus states and dark mode. Every tile is the real component, not a picture of it.`}
      items={tiles}
    />
  );
}
