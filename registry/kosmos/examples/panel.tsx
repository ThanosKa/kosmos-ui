'use client';

import { ListFilter, Search } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/registry/kosmos/ui/input-group';
import {
  Pagination,
  PaginationNext,
  PaginationPageSize,
  PaginationPages,
  PaginationPrevious,
  PaginationStatus,
} from '@/registry/kosmos/ui/pagination';
import { Panel, PanelAction, PanelContent, PanelDescription, PanelFooter, PanelHeader, PanelTitle } from '@/registry/kosmos/ui/panel';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { StatusDot, type Status } from '@/registry/kosmos/ui/status';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

const projects = [
  { name: 'Fernhill Books', domain: 'fernhill.example', plan: 'Scale', status: 'live', users: 48210, mrr: 2400 },
  { name: 'Brightloop Fitness', domain: 'brightloop.example', plan: 'Scale', status: 'live', users: 31480, mrr: 3600 },
  { name: 'Copperline Bank', domain: 'copperline.example', plan: 'Scale', status: 'live', users: 12940, mrr: 4800 },
  { name: 'Saltmarsh Coffee', domain: 'saltmarsh.example', plan: 'Pro', status: 'live', users: 6120, mrr: 149 },
  { name: 'Hollow Oak Games', domain: 'hollowoak.example', plan: 'Pro', status: 'paused', users: 2310, mrr: 99 },
] as const;

const planHue = { Scale: 'violet', Pro: 'blue' } as const;
const statusOf: Record<(typeof projects)[number]['status'], { status: Status; label: string }> = {
  live: { status: 'done', label: 'Live' },
  paused: { status: 'waiting', label: 'Paused' },
};

const events = [
  { name: 'page_viewed', count: '17.4M' },
  { name: 'button_clicked', count: '6M' },
  { name: 'screen_viewed', count: '4.6M' },
  { name: 'signed_up', count: '389K' },
];

const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const today = Date.UTC(2026, 9, 11);
const users = [26800, 27100, 26900, 27600, 27400, 28100, 28300, 28000, 28700, 29100, 28900, 29400].map((value, i, all) => ({
  day: dayLabel.format(today - (all.length - 1 - i) * 86_400_000),
  current: value,
}));
const usersConfig = { current: { label: 'Active users', color: 'var(--chart-1)' } } satisfies ChartConfig;

const count = new Intl.NumberFormat('en-US');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function SearchField({ label }: { label: string }) {
  return (
    <InputGroup className="h-7.5 w-48 @max-md/panel:flex-1">
      <InputGroupAddon align="inline-start">
        <Search aria-hidden />
      </InputGroupAddon>
      <InputGroupInput type="search" aria-label={label} placeholder={label} />
    </InputGroup>
  );
}

function RangeSwitch() {
  return (
    <SegmentedControl aria-label="Range" defaultValue="30d">
      <SegmentedControlItem value="7d">7d</SegmentedControlItem>
      <SegmentedControlItem value="30d">30d</SegmentedControlItem>
      <SegmentedControlItem value="90d">90d</SegmentedControlItem>
    </SegmentedControl>
  );
}

function ProjectsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="ps-4">Project</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-end">Users</TableHead>
          <TableHead className="pe-4 text-end">Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.domain}>
            <TableCell className="ps-4">
              <div className="flex flex-col">
                <span className="font-medium">{project.name}</span>
                <span className="text-small text-muted-foreground">{project.domain}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={planHue[project.plan]}>{project.plan}</Badge>
            </TableCell>
            <TableCell>
              <StatusDot status={statusOf[project.status].status}>{statusOf[project.status].label}</StatusDot>
            </TableCell>
            <TableCell className="text-end">{count.format(project.users)}</TableCell>
            <TableCell className="pe-4 text-end">{money.format(project.mrr)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EventList() {
  return (
    <ul role="list" className="flex flex-col divide-y divide-border">
      {events.map((event) => (
        <li key={event.name} className="flex min-w-0 items-center justify-between gap-3 px-4 py-2.5 text-body">
          <span className="truncate font-mono">{event.name}</span>
          <span className="shrink-0 text-muted-foreground tabular-nums">{event.count}</span>
        </li>
      ))}
    </ul>
  );
}

function Pager() {
  return (
    <Pagination aria-label="Pages of projects" total={12} defaultPageSize={5} className="w-full flex-wrap justify-between gap-x-3 gap-y-2">
      <PaginationPageSize options={[5, 10, 20]} />
      <div className="flex items-center gap-3">
        <PaginationStatus />
        <div className="flex items-center gap-1">
          <PaginationPrevious />
          <PaginationPages />
          <PaginationNext />
        </div>
      </div>
    </Pagination>
  );
}

export default function PanelPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Table with a search, a filter and pagination">
        <Panel>
          <PanelHeader>
            <PanelTitle render={<h3 />}>Projects</PanelTitle>
            <PanelDescription>Every site and app sending events</PanelDescription>
            <PanelAction>
              <SearchField label="Search projects" />
              <Button variant="secondary">
                <ListFilter data-icon="inline-start" aria-hidden />
                Plan
              </Button>
            </PanelAction>
          </PanelHeader>
          <PanelContent>
            <ProjectsTable />
          </PanelContent>
          <PanelFooter>
            <Pager />
          </PanelFooter>
        </Panel>
      </PreviewSection>

      <PreviewSection title="Chart with a range switch, list with a full-width button">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <Panel>
            <PanelHeader>
              <PanelTitle render={<h3 />}>Active users</PanelTitle>
              <PanelDescription>Daily, last 12 days</PanelDescription>
              <PanelAction>
                <RangeSwitch />
              </PanelAction>
            </PanelHeader>
            <PanelContent className="flex flex-col p-4">
              <GrowthChart title="Active users a day" data={users} config={usersConfig} xKey="day" className="min-h-48" />
            </PanelContent>
          </Panel>
          <Panel>
            <PanelHeader>
              <PanelTitle render={<h3 />}>Top events</PanelTitle>
              <PanelDescription>Last 30 days</PanelDescription>
            </PanelHeader>
            <PanelContent>
              <EventList />
            </PanelContent>
            <PanelFooter>
              <Button variant="secondary" className="w-full">
                View all events
              </Button>
            </PanelFooter>
          </Panel>
        </div>
      </PreviewSection>

      <PreviewSection title="Title only, action beside a title only, no header">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Panel>
            <PanelHeader>
              <PanelTitle render={<h3 />}>Top events</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <EventList />
            </PanelContent>
          </Panel>
          <Panel>
            <PanelHeader>
              <PanelTitle render={<h3 />}>Top events</PanelTitle>
              <PanelAction>
                <RangeSwitch />
              </PanelAction>
            </PanelHeader>
            <PanelContent>
              <EventList />
            </PanelContent>
          </Panel>
          <Panel>
            <PanelContent>
              <EventList />
            </PanelContent>
          </Panel>
        </div>
      </PreviewSection>

      <PreviewSection title="Long text, a 320px panel">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHeader>
              <PanelTitle render={<h3 />}>Events received across every project and region, by name, most frequent first</PanelTitle>
              <PanelDescription>Against the same 30 days of the previous year, before the EU data region went live</PanelDescription>
              <PanelAction>
                <RangeSwitch />
              </PanelAction>
            </PanelHeader>
            <PanelContent>
              <EventList />
            </PanelContent>
          </Panel>
          <div className="w-80 max-w-full">
            <Panel>
              <PanelHeader>
                <PanelTitle render={<h3 />}>Projects on a paid plan</PanelTitle>
                <PanelDescription>Live and paused</PanelDescription>
                <PanelAction>
                  <SearchField label="Search projects" />
                  <Button variant="secondary">
                    <ListFilter data-icon="inline-start" aria-hidden />
                    Plan
                  </Button>
                </PanelAction>
              </PanelHeader>
              <PanelContent>
                <EventList />
              </PanelContent>
              <PanelFooter>
                <Button variant="secondary" className="w-full">
                  View all projects
                </Button>
              </PanelFooter>
            </Panel>
          </div>
          <div className="w-100 max-w-full">
            <Panel>
              <PanelHeader>
                <PanelTitle render={<h3 />}>checkout_completed_after_trial_conversion_v2</PanelTitle>
                <PanelDescription>copperline-bank-production.example</PanelDescription>
                <PanelAction>
                  <SearchField label="Search projects" />
                  <Button variant="secondary">
                    <ListFilter data-icon="inline-start" aria-hidden />
                    Plan
                  </Button>
                </PanelAction>
              </PanelHeader>
              <PanelContent>
                <EventList />
              </PanelContent>
              <PanelFooter>
                <Pager />
              </PanelFooter>
            </Panel>
          </div>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
