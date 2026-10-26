'use client';

import { BarChart3, FolderKanban, Plus, UserPlus, Users } from 'lucide-react';
import { Badge } from '@/registry/kosmos/ui/badge';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import { ChartCard, ChartCardContent, ChartCardDescription, ChartCardHeader, ChartCardTitle } from '@/registry/kosmos/ui/chart-card';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/registry/kosmos/ui/command';
import { Meter, MeterBar, MeterLabel, MeterValue } from '@/registry/kosmos/ui/meter';
import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';
import { StatCard, StatCardDelta, StatCardLabel, StatCardSparkline, StatCardValue } from '@/registry/kosmos/ui/stat-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

const wholeNumber = new Intl.NumberFormat('en-US');
const card = 'w-full rounded-xl border border-transparent bg-card shadow-card';

const commands = [
  { value: 'projects', label: 'Go to Projects', icon: FolderKanban },
  { value: 'users', label: 'Go to Users', icon: Users },
  { value: 'revenue', label: 'Go to Revenue', icon: BarChart3 },
  { value: 'roadmap-item', label: 'New roadmap item', icon: Plus },
  { value: 'invite', label: 'Invite teammate', icon: UserPlus },
];

export function CommandVisual({ listHeight = 'max-h-48' }: { listHeight?: string }) {
  return (
    <Command items={commands} className="max-w-md">
      <CommandInput placeholder="Search Acme…" aria-label="Search Acme" />
      <CommandEmpty>No commands found.</CommandEmpty>
      <CommandList className={listHeight}>
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

const events = [
  812400, 846100, 901300, 884900, 962500, 731800, 702600, 948200, 1012700, 1046300, 1031900, 1108400, 864200, 826500,
];
const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const eventData = events.map((value, index) => ({ day: dayLabel.format(Date.UTC(2026, 8, 28) + index * 86_400_000), events: value }));
const chartConfig = { events: { label: 'Events', color: 'var(--chart-1)' } } satisfies ChartConfig;

export function ChartVisual() {
  return (
    <ChartCard className="w-full max-w-2xl">
      <ChartCardHeader>
        <ChartCardTitle>Events</ChartCardTitle>
        <ChartCardDescription>A day, last 14 days</ChartCardDescription>
      </ChartCardHeader>
      <ChartCardContent className="min-h-48">
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

const projects = [
  { name: 'Fernhill Books', plan: 'Scale', hue: 'magenta', dot: 'bg-success', status: 'Live', users: 48210 },
  { name: 'Saltmarsh Coffee', plan: 'Pro', hue: 'orange', dot: 'bg-success', status: 'Live', users: 6120 },
  { name: 'Marigold Recipes', plan: 'Pro', hue: 'orange', dot: 'bg-muted-foreground', status: 'Trial', users: 1920 },
  { name: 'Quayside Bikes', plan: 'Scale', hue: 'magenta', dot: 'bg-success', status: 'Live', users: 22940 },
  { name: 'Lanternfish Games', plan: 'Pro', hue: 'orange', dot: 'bg-muted-foreground', status: 'Trial', users: 870 },
] as const;

export function TableVisual({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={`${card} @container max-w-2xl overflow-hidden ${className ?? ''}`}>
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
          {projects.slice(0, rows).map((project) => (
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

const steps: PlanStep[] = [
  { id: 'schema', label: 'Read the events schema', status: 'done', detail: '12 tables' },
  { id: 'join', label: 'Join events to users', status: 'done', detail: '1.2M rows' },
  { id: 'rollup', label: 'Build the daily rollup', status: 'running' },
  { id: 'alerts', label: 'Add the signup alert', status: 'pending' },
  { id: 'report', label: 'Send the weekly summary', status: 'pending' },
];

export function ChecklistVisual() {
  return <PlanChecklist title="Set up Acme analytics" steps={steps} defaultOpen collapseWhenDone={false} className="w-full max-w-sm" />;
}

const signups = [{ value: 31 }, { value: 36 }, { value: 33 }, { value: 41 }, { value: 44 }, { value: 39 }, { value: 48 }, { value: 52 }, { value: 49 }, { value: 58 }];

export function StatVisual() {
  return (
    <StatCard className="w-full max-w-xs">
      <StatCardLabel>Signups</StatCardLabel>
      <StatCardValue>4,218</StatCardValue>
      <StatCardDelta value={12.4}>vs September</StatCardDelta>
      <StatCardSparkline data={signups} aria-label="Signups, last 10 days, up 12.4%" />
    </StatCard>
  );
}

export function QuotaVisual() {
  return (
    <div className={`${card} flex max-w-sm flex-col gap-5 p-4`}>
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
