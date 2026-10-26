'use client';

import { BarChart3, FolderKanban, Plus, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { FeatureRows, type FeatureRowItem } from '@/registry/kosmos/blocks/feature-rows/feature-rows';
import { isEmail } from '@/registry/kosmos/lib/tags';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import { ChartCard, ChartCardContent, ChartCardDescription, ChartCardHeader, ChartCardTitle } from '@/registry/kosmos/ui/chart-card';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/registry/kosmos/ui/command';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/registry/kosmos/ui/combobox';
import { DatePicker } from '@/registry/kosmos/ui/date-picker';
import { Field, FieldDescription, FieldLabel } from '@/registry/kosmos/ui/field';
import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';
import { StatCard, StatCardDelta, StatCardLabel, StatCardSparkline, StatCardValue } from '@/registry/kosmos/ui/stat-card';
import { TagsInput } from '@/registry/kosmos/ui/tags-input';

const commands = [
  { value: 'projects', label: 'Go to Projects', icon: FolderKanban },
  { value: 'users', label: 'Go to Users', icon: Users },
  { value: 'revenue', label: 'Go to Revenue', icon: BarChart3 },
  { value: 'roadmap-item', label: 'New roadmap item', icon: Plus },
  { value: 'invite', label: 'Invite teammate', icon: UserPlus },
];

const steps: PlanStep[] = [
  { id: 'schema', label: 'Read the events schema', status: 'done', detail: '12 tables' },
  { id: 'join', label: 'Join events to users', status: 'done', detail: '1.2M rows' },
  { id: 'rollup', label: 'Build the daily rollup', status: 'running' },
  { id: 'alerts', label: 'Add the signup alert', status: 'pending' },
  { id: 'report', label: 'Send the weekly summary', status: 'pending' },
];

function CommandAndPlan() {
  return (
    <div className="grid w-full grid-cols-1 items-start gap-4 @3xl:grid-cols-[1.1fr_1fr]">
      <Command items={commands}>
        <CommandInput placeholder="Search Acme…" aria-label="Search Acme" />
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
      <PlanChecklist title="Set up Acme analytics" steps={steps} defaultOpen collapseWhenDone={false} />
    </div>
  );
}

const events = [
  812400, 846100, 901300, 884900, 962500, 731800, 702600, 948200, 1012700, 1046300, 1031900, 1108400, 864200, 826500,
];
const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const wholeNumber = new Intl.NumberFormat('en-US');
const eventData = events.map((value, index) => ({ day: dayLabel.format(Date.UTC(2026, 8, 28) + index * 86_400_000), events: value }));
const chartConfig = { events: { label: 'Events', color: 'var(--chart-1)' } } satisfies ChartConfig;
const signups = [{ value: 31 }, { value: 36 }, { value: 33 }, { value: 41 }, { value: 44 }, { value: 39 }, { value: 48 }, { value: 52 }, { value: 49 }, { value: 58 }];

function ChartAndStat() {
  return (
    <div className="relative w-full">
      <ChartCard className="w-full">
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
      <StatCard className="mt-4 w-full @3xl:absolute @3xl:-start-8 @3xl:-bottom-8 @3xl:mt-0 @3xl:w-56">
        <StatCardLabel>Signups</StatCardLabel>
        <StatCardValue>4,218</StatCardValue>
        <StatCardDelta value={12.4}>vs September</StatCardDelta>
        <StatCardSparkline data={signups} aria-label="Signups, last 10 days, up 12.4%" />
      </StatCard>
    </div>
  );
}

type Owner = { value: string; label: string };

const owners: Owner[] = [
  { value: 'ama', label: 'Ama Boateng' },
  { value: 'tomas', label: 'Tomas Reyes' },
  { value: 'ines', label: 'Ines Duarte' },
  { value: 'keiko', label: 'Keiko Mori' },
  { value: 'lars', label: 'Lars Nilsson' },
];

function NewProjectForm() {
  const [launch, setLaunch] = React.useState<Date | null>(null);
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="flex w-full max-w-xl flex-col gap-5 rounded-xl border border-transparent bg-card p-5 shadow-card"
    >
      <Field>
        <FieldLabel htmlFor="project-owner">Owner</FieldLabel>
        <Combobox items={owners} defaultValue={owners[1]}>
          <ComboboxInput id="project-owner" placeholder="Search teammates" showClear />
          <ComboboxContent>
            <ComboboxEmpty>No teammates match.</ComboboxEmpty>
            <ComboboxList>
              {(owner: Owner) => (
                <ComboboxItem key={owner.value} value={owner}>
                  {owner.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      <Field>
        <FieldLabel htmlFor="project-launch">Launch date</FieldLabel>
        <DatePicker id="project-launch" aria-describedby="project-launch-hint" value={launch} onValueChange={setLaunch} />
        <FieldDescription id="project-launch-hint">Events start counting on this day.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="project-invite">Invite by email</FieldLabel>
        <TagsInput
          id="project-invite"
          name="emails"
          defaultValue={['tomas@acme.example', 'ama@acme.example']}
          delimiters={[',', ';', ' ']}
          validate={isEmail}
          placeholder="name@acme.example"
        />
      </Field>
    </form>
  );
}

const items: FeatureRowItem[] = [
  {
    id: 'command',
    title: 'Search and run anything from the keyboard',
    description: 'A command menu that filters as you type, beside the checklist an agent works through.',
    media: <CommandAndPlan />,
    href: '/docs/components/command',
    linkLabel: 'See the command menu',
  },
  {
    id: 'chart',
    title: 'Numbers that read at a glance',
    description: 'Charts and stat tiles share one gray ramp, and each chart comes with a table for screen readers.',
    media: <ChartAndStat />,
    href: '/docs/components/chart',
    linkLabel: 'See the chart',
  },
  {
    id: 'forms',
    title: 'Forms that handle the details',
    description: 'A combobox, a date picker and a tags input, each with its label, hint and error built in.',
    media: <NewProjectForm />,
    href: '/docs/components/combobox',
    linkLabel: 'See the form parts',
  },
];

/** The landing's feature rows: live Kosmos parts at real size in the Feature rows block, each row linked to its docs. */
export function LandingFeatures() {
  return <FeatureRows title={null} description={null} items={items} linkComponent={Link} />;
}
