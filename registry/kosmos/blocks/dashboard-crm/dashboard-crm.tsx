'use client';

import {
  Briefcase,
  CalendarCheck,
  CalendarDays,
  Check,
  Clock,
  Ellipsis,
  FileSignature,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { AppSidebar, type AppSidebarProps } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { cn } from '@/registry/kosmos/lib/cn';
import { statDelta } from '@/registry/kosmos/lib/stat-delta';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { BarList } from '@/registry/kosmos/ui/bar-list';
import { Button } from '@/registry/kosmos/ui/button';
import {
  createDataTableColumnHelper,
  DataTableColumnHeader,
  DataTableContent,
  DataTableFacetFilter,
  DataTableFooter,
  DataTableSearch,
  useDataTable,
  type DataTableFacetOption,
  type DataTableOptions,
} from '@/registry/kosmos/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/registry/kosmos/ui/dropdown-menu';
import { Gauge } from '@/registry/kosmos/ui/gauge';
import { Meter, MeterBar } from '@/registry/kosmos/ui/meter';
import { Panel, PanelAction, PanelContent, PanelDescription, PanelFooter, PanelHeader, PanelTitle } from '@/registry/kosmos/ui/panel';
import {
  StatCard,
  StatCardContent,
  StatCardDelta,
  StatCardEyebrow,
  StatCardHeader,
  StatCardIcon,
  StatCardLabel,
  StatCardSparkline,
  StatCardValue,
} from '@/registry/kosmos/ui/stat-card';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';
import { SidebarInset, SidebarProvider, SidebarResizeHandle, SidebarTrigger } from '@/registry/kosmos/ui/sidebar';

type Stage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won';

type Kpi = {
  id: string;
  icon: LucideIcon;
  /** A muted line of context above the label ("23 open deals"). */
  eyebrow?: string;
  label: string;
  /** The value, already formatted ("$184.6K", "34 days"). */
  value: string;
  /** The change against the period before, in percent, or in points with `unit: 'points'`. */
  change: number;
  unit?: 'percent' | 'points';
  goodWhen?: 'up' | 'down' | 'neither';
  /** Muted text after the change ("(+$15.6K)", "from 25.6%"). */
  context?: string;
  /** The values behind the bars, oldest first. */
  trend: number[];
};

type Deal = {
  id: string;
  /** What is being sold ("Pro to Scale"). */
  name: string;
  /** Who it is sold to. */
  customer: string;
  /** Who on the team works it. */
  rep: string;
  stage: Stage;
  /** How likely it is to close, 0 to 100. */
  winChance: number;
  /** The value of the deal a year, in USD. */
  value: number;
  /** A muted line under the value ("8M events a month"). */
  detail?: string;
  /** The close date and how far off it is, already written ("Oct 18", "in 7 days"). */
  closeDate: string;
  closeNote?: string;
};

type StageTotal = { stage: Stage; value: number; deals: number };
type StageStat = { label: string; value: string };

type Task = {
  id: string;
  icon: LucideIcon;
  title: string;
  detail?: string;
  /** The label of the task's button ("Call", "Send"). */
  action: string;
};

type QuotaRow = { id: string; name: string; team: string; avatarUrl?: string; won: number; target: number };
type ActivityItem = { id: string; who: string; avatarUrl?: string; what: string; when: string };

// Sample data: Acme's own sales of plan upgrades to its customers, on 11 October 2026. Replace it with yours.
const sampleKpis: Kpi[] = [
  {
    id: 'pipeline',
    icon: Briefcase,
    eyebrow: '23 open deals',
    label: 'Pipeline',
    value: '$184.6K',
    change: 9.2,
    context: '(+$15.6K)',
    trend: [138, 142, 141, 149, 156, 153, 162, 169, 177, 185],
  },
  {
    id: 'won',
    icon: Trophy,
    eyebrow: 'This quarter',
    label: 'Won',
    value: '$31.7K',
    change: 18.6,
    context: '(+$5K)',
    trend: [18, 22, 19, 24, 21, 26, 24, 27, 29, 32],
  },
  {
    id: 'win-rate',
    icon: Target,
    eyebrow: 'Last 90 days',
    label: 'Win rate',
    value: '28%',
    change: 2.4,
    unit: 'points',
    context: 'from 25.6%',
    trend: [22, 24, 23, 25, 24, 26, 25, 27, 26, 28],
  },
  {
    id: 'cycle',
    icon: Clock,
    eyebrow: 'Trial to won',
    label: 'Sales cycle',
    value: '34 days',
    change: -10.5,
    goodWhen: 'down',
    context: '(−4 days)',
    trend: [42, 41, 40, 39, 39, 38, 37, 36, 35, 34],
  },
];

const sampleDeals: Deal[] = [
  { id: 'saltmarsh-annual', name: 'Annual Pro', customer: 'Saltmarsh Coffee', rep: 'Mina Sato', stage: 'won', winChance: 100, value: 1430, detail: 'Pro, billed yearly', closeDate: 'Oct 11', closeNote: 'signed today' },
  { id: 'copperline-events', name: 'More events', customer: 'Copperline Bank', rep: 'Rosa Delgado', stage: 'negotiation', winChance: 80, value: 86400, detail: '16M events a month', closeDate: 'Oct 18', closeNote: 'in 7 days' },
  { id: 'cirrus-scale', name: 'Pro to Scale', customer: 'Cirrus Weather', rep: 'Felix Brandt', stage: 'proposal', winChance: 55, value: 14400, detail: '8M events a month', closeDate: 'Oct 26', closeNote: 'in 15 days' },
  { id: 'ironbark-annual', name: 'Annual billing', customer: 'Ironbark Logistics', rep: 'Rosa Delgado', stage: 'qualified', winChance: 35, value: 27840, detail: 'Scale, billed yearly', closeDate: 'Nov 13', closeNote: 'in 33 days' },
  { id: 'driftwood-scale', name: 'Pro to Scale', customer: 'Driftwood Travel', rep: 'Felix Brandt', stage: 'proposal', winChance: 45, value: 14400, detail: '8M events a month', closeDate: 'Nov 20', closeNote: 'in 40 days' },
  { id: 'marigold-pro', name: 'Trial to Pro', customer: 'Marigold Recipes', rep: 'Mina Sato', stage: 'lead', winChance: 15, value: 588, detail: '3M events a month', closeDate: 'Nov 28', closeNote: 'in 48 days' },
  { id: 'tidepool-pro', name: 'Trial to Pro', customer: 'Tidepool Notes', rep: 'Kai Nakamura', stage: 'lead', winChance: 20, value: 588, detail: '3M events a month', closeDate: 'Dec 2', closeNote: 'in 52 days' },
];

const sampleStages: StageTotal[] = [
  { stage: 'lead', value: 20600, deals: 9 },
  { stage: 'qualified', value: 29600, deals: 6 },
  { stage: 'proposal', value: 38400, deals: 5 },
  { stage: 'negotiation', value: 96000, deals: 3 },
  { stage: 'won', value: 31700, deals: 5 },
];

const sampleStageStats: StageStat[] = [
  { label: 'Lead to won', value: '9.8%' },
  { label: 'Average deal', value: '$8K' },
  { label: 'Stalled', value: '3 deals' },
];

const sampleTasks: Task[] = [
  { id: 'call-copperline', icon: Phone, title: 'Call Copperline Bank', detail: 'About more events · 11:00', action: 'Call' },
  { id: 'send-cirrus', icon: FileSignature, title: 'Send the Cirrus Weather proposal', detail: 'Draft ready · due today', action: 'Send' },
  { id: 'email-ironbark', icon: Mail, title: 'Follow up with Ironbark Logistics', detail: 'No reply for 6 days', action: 'Email' },
  { id: 'book-marigold', icon: CalendarCheck, title: 'Book a demo with Marigold Recipes', detail: 'Trial ends Oct 22', action: 'Book' },
  { id: 'reply-tidepool', icon: MessageSquare, title: 'Answer Tidepool Notes in chat', detail: 'A question about the SDK', action: 'Reply' },
];

const sampleQuota: QuotaRow[] = [
  { id: 'rosa', name: 'Rosa Delgado', team: 'Scale plans', avatarUrl: '/avatars/rosa.jpg', won: 14800, target: 16000 },
  { id: 'felix', name: 'Felix Brandt', team: 'Scale plans', avatarUrl: '/avatars/felix.jpg', won: 9600, target: 12000 },
  { id: 'mina', name: 'Mina Sato', team: 'Pro plans', avatarUrl: '/avatars/mina.jpg', won: 4900, target: 8000 },
  { id: 'kai', name: 'Kai Nakamura', team: 'Growth', avatarUrl: '/avatars/kai.jpg', won: 2400, target: 4400 },
];

const sampleActivity: ActivityItem[] = [
  { id: '1', who: 'Rosa Delgado', avatarUrl: '/avatars/rosa.jpg', what: 'moved More events with Copperline Bank to Negotiation', when: '12m' },
  { id: '2', who: 'Mina Sato', avatarUrl: '/avatars/mina.jpg', what: 'won Annual Pro with Saltmarsh Coffee, $1,430', when: '1h' },
  { id: '3', who: 'Felix Brandt', avatarUrl: '/avatars/felix.jpg', what: 'logged a call with Cirrus Weather', when: '3h' },
  { id: '4', who: 'Kai Nakamura', avatarUrl: '/avatars/kai.jpg', what: 'added 2 contacts at Ironbark Logistics', when: '5h' },
  { id: '5', who: 'Felix Brandt', avatarUrl: '/avatars/felix.jpg', what: 'sent a proposal to Driftwood Travel', when: '6h' },
  { id: '6', who: 'Kai Nakamura', avatarUrl: '/avatars/kai.jpg', what: 'added Tidepool Notes as a lead', when: '7h' },
];

// A fixed locale, so the server and the browser render the same text.
const grouped = new Intl.NumberFormat('en-US');
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usdCompact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });

/** Rows the deals table shows before it pages; the pager shows only past it. */
const firstPageSize = 5;

const stages: Record<Stage, { label: string; hue: 'gray' | 'blue' | 'violet' | 'amber' | 'green' }> = {
  lead: { label: 'Lead', hue: 'gray' },
  qualified: { label: 'Qualified', hue: 'blue' },
  proposal: { label: 'Proposal', hue: 'violet' },
  negotiation: { label: 'Negotiation', hue: 'amber' },
  won: { label: 'Won', hue: 'green' },
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

/** Names a KPI's sparkline for screen readers: what it shows and which way it went ("Won trend, up +18.6%"). */
function trendLabel({ label, change, unit }: Pick<Kpi, 'label' | 'change' | 'unit'>) {
  const delta = statDelta(change, { unit });
  return !delta || delta.direction === 'flat' ? `${label} trend, flat` : `${label} trend, ${delta.direction} ${delta.text}`;
}

/** The KPIs as Stat cards on one tray, each with thin bars for its last periods: four in a row on a wide page, two on a medium one. */
function KpiStrip({ kpis }: { kpis: Kpi[] }) {
  if (kpis.length === 0) return null;
  return (
    <Panel role="group" aria-label="Key metrics">
      <div className="grid gap-1 @lg/panel:grid-cols-2 @5xl/panel:grid-cols-4">
        {kpis.map(({ icon: Icon, ...kpi }) => (
          <StatCard key={kpi.id} className="rounded-[calc(var(--radius-2xl)-4px)]">
            <StatCardHeader>
              <StatCardIcon>
                <Icon />
              </StatCardIcon>
              {kpi.eyebrow ? <StatCardEyebrow>{kpi.eyebrow}</StatCardEyebrow> : null}
              <StatCardLabel>{kpi.label}</StatCardLabel>
            </StatCardHeader>
            <StatCardContent>
              <StatCardValue>{kpi.value}</StatCardValue>
              <StatCardDelta value={kpi.change} unit={kpi.unit} goodWhen={kpi.goodWhen}>
                {kpi.context ? <bdi>{kpi.context}</bdi> : undefined}
              </StatCardDelta>
              {kpi.trend.length > 1 ? (
                <StatCardSparkline
                  variant="bar"
                  data={kpi.trend.map((value) => ({ value }))}
                  aria-label={trendLabel(kpi)}
                />
              ) : null}
            </StatCardContent>
          </StatCard>
        ))}
      </div>
    </Panel>
  );
}

/** A value in ink with a muted line of context under it. */
function TwoLine({ primary, secondary, className }: { primary: React.ReactNode; secondary?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-col', className)}>
      <span className="truncate text-body text-foreground">{primary}</span>
      {secondary ? <span className="truncate text-small text-muted-foreground">{secondary}</span> : null}
    </div>
  );
}

function PersonAvatar({ name, avatarUrl, size }: { name: string; avatarUrl?: string; size?: 'sm' | 'md' }) {
  return (
    <Avatar size={size}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}

/** How likely a deal is to close, as a ring with the percentage in it; a won deal shows a check. */
function WinChance({ deal }: { deal: Deal }) {
  const won = deal.stage === 'won' || deal.winChance >= 100;
  return (
    <Gauge
      value={won ? 100 : deal.winChance}
      size="sm"
      tone={won ? 'success' : 'primary'}
      showValue={!won}
      aria-label={won ? 'Won' : `${deal.winChance}% likely to close`}
    >
      {won ? <Check aria-hidden className="size-3.5 text-success" /> : undefined}
    </Gauge>
  );
}

const stageOrder = Object.keys(stages) as Stage[];
const stageOptions: DataTableFacetOption[] = stageOrder.map((stage) => ({
  value: stage,
  label: stages[stage].label,
  render: <Badge variant={stages[stage].hue}>{stages[stage].label}</Badge>,
}));

/** The deal actions menu, from the dashboard's props, so the columns stay the same between renders. */
const DealActionsContext = React.createContext<((deal: Deal) => React.ReactNode) | undefined>(undefined);

function DealActions({ deal }: { deal: Deal }) {
  const dealActions = React.useContext(DealActionsContext);
  if (!dealActions) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="item" size="icon-sm" aria-label={`Actions for ${deal.name}, ${deal.customer}`} className="text-muted-foreground" />}
      >
        <Ellipsis aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{dealActions(deal)}</DropdownMenuContent>
    </DropdownMenu>
  );
}

const dealColumn = createDataTableColumnHelper<Deal>();
const dealColumns = dealColumn.columns([
  dealColumn.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row: { original: deal } }) => (
      <div className="flex max-w-72 min-w-0 items-center gap-3">
        <WinChance deal={deal} />
        <TwoLine
          primary={<span title={deal.name}>{deal.name}</span>}
          secondary={
            <span title={`${deal.customer} · ${deal.rep}`}>
              {deal.customer}
              <span aria-hidden className="px-1">
                ·
              </span>
              <span className="sr-only">, </span>
              {deal.rep}
            </span>
          }
        />
      </div>
    ),
    sortFn: 'text',
    enableHiding: false,
    meta: { label: 'Deal', sortLabels: ['A to Z', 'Z to A'], className: 'ps-4', cellClassName: 'h-15' },
  }),
  dealColumn.accessor('stage', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <Badge variant={stages[row.original.stage].hue}>{stages[row.original.stage].label}</Badge>,
    sortFn: (a, b, id) => stageOrder.indexOf(a.getValue(id)) - stageOrder.indexOf(b.getValue(id)),
    filterFn: 'arrHas',
    enableHiding: false,
    meta: { label: 'Stage', sortLabels: ['Lead to Won', 'Won to Lead'] },
  }),
  dealColumn.accessor('value', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => (
      <TwoLine primary={usd.format(row.original.value)} secondary={row.original.detail} className="items-end tabular-nums" />
    ),
    sortFn: 'basic',
    enableHiding: false,
    meta: { label: 'Value', align: 'end', sortLabels: ['Low to high', 'High to low'] },
  }),
  dealColumn.accessor('closeDate', {
    header: 'Close',
    cell: ({ row: { original: deal } }) => (
      <TwoLine
        primary={deal.closeDate}
        secondary={
          deal.closeNote ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays aria-hidden className="size-3 shrink-0" />
              {deal.closeNote}
            </span>
          ) : undefined
        }
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'last:pe-4' },
  }),
  dealColumn.display({
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <DealActions deal={row.original} />,
    enableHiding: false,
    meta: { className: 'pe-4 text-end', headerClassName: 'w-12', skeleton: null },
  }),
]);

/** The search matches the deal, the customer or the rep, once per row. */
const searchDeals: Pick<DataTableOptions<Deal>, 'globalFilterFn' | 'getColumnCanGlobalFilter'> = {
  getColumnCanGlobalFilter: (column) => column.id === 'name',
  globalFilterFn: (row, _columnId, query: string) => {
    const needle = query.trim().toLowerCase();
    return !needle || [row.original.name, row.original.customer, row.original.rep].some((text) => text.toLowerCase().includes(needle));
  },
};

function DealsPanel({
  deals,
  onNewDeal,
  dealActions,
}: {
  deals: Deal[];
  onNewDeal?: () => void;
  dealActions?: (deal: Deal) => React.ReactNode;
}) {
  const titleId = React.useId();
  const columnVisibility = React.useMemo(() => ({ actions: Boolean(dealActions) }), [dealActions]);
  const table = useDataTable({
    data: deals,
    columns: dealColumns,
    getRowId: (deal) => deal.id,
    ...searchDeals,
    initialState: { pagination: { pageIndex: 0, pageSize: firstPageSize } },
    state: { columnVisibility },
  });
  const filtered = Boolean(table.atoms.globalFilter.get()) || table.atoms.columnFilters.get().length > 0;

  return (
    <DealActionsContext.Provider value={dealActions}>
      <Panel>
        <PanelHeader>
          <PanelTitle id={titleId}>Deals</PanelTitle>
          <PanelDescription>By close date</PanelDescription>
          <PanelAction>
            <DataTableSearch
              table={table}
              label="Search deals"
              placeholder="Search deals"
              className="w-56 @max-md/panel:min-w-0 @max-md/panel:flex-1"
            />
            <DataTableFacetFilter column={table.getColumn('stage')!} options={stageOptions} noun="stages" rowNoun="deal" />
            {onNewDeal ? (
              <Button variant="secondary" onClick={onNewDeal}>
                <Plus data-icon="inline-start" aria-hidden />
                Deal
              </Button>
            ) : null}
          </PanelAction>
        </PanelHeader>
        <PanelContent>
          <DataTableContent
            table={table}
            aria-labelledby={titleId}
            className="min-w-0"
            empty={
              <p className="flex h-24 items-center justify-center px-4 text-center text-small text-muted-foreground">
                {filtered ? 'No deals match. Try another name or stage.' : 'No deals yet'}
              </p>
            }
          />
        </PanelContent>
        {deals.length > firstPageSize ? (
          <PanelFooter>
            <DataTableFooter table={table} noun="deal" pageSizes={[5, 10, 20]} pages className="min-h-0 w-full border-t-0 p-0" />
          </PanelFooter>
        ) : null}
      </Panel>
    </DealActionsContext.Provider>
  );
}

function TasksPanel({ tasks, onTaskAction, tasksHref }: { tasks: Task[]; onTaskAction?: (task: Task) => void; tasksHref?: string }) {
  const titleId = React.useId();
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle id={titleId}>Next steps</PanelTitle>
        <PanelDescription>{tasks.length === 0 ? 'Nothing due today' : `${tasks.length} due today`}</PanelDescription>
      </PanelHeader>
      <PanelContent>
        {tasks.length === 0 ? (
          <p role="status" className="flex min-h-36 items-center justify-center p-4 text-center text-small text-muted-foreground">
            You are all caught up
          </p>
        ) : (
          <ul aria-labelledby={titleId} role="list" className="flex flex-col divide-y divide-border">
            {tasks.map(({ icon: Icon, ...task }) => (
              <li key={task.id} className="flex min-w-0 items-center gap-3 px-4 py-3">
                <StatCardIcon>
                  <Icon />
                </StatCardIcon>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="line-clamp-2 text-body text-pretty wrap-break-word text-foreground">{task.title}</span>
                  {task.detail ? <span className="truncate text-small text-muted-foreground">{task.detail}</span> : null}
                </div>
                <Button variant="secondary" size="sm" aria-label={`${task.action}: ${task.title}`} onClick={() => onTaskAction?.({ icon: Icon, ...task })}>
                  {task.action}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </PanelContent>
      {tasksHref ? (
        <PanelFooter>
          <Button variant="secondary" href={tasksHref} className="w-full">
            View all tasks
          </Button>
        </PanelFooter>
      ) : null}
    </Panel>
  );
}

function StagesPanel({ stageTotals, stats }: { stageTotals: StageTotal[]; stats: StageStat[] }) {
  const titleId = React.useId();
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle id={titleId}>Pipeline by stage</PanelTitle>
        <PanelDescription>Value of open deals, and won this quarter</PanelDescription>
      </PanelHeader>
      <PanelContent className="flex flex-col">
        <BarList
          aria-labelledby={titleId}
          className="flex-1 content-between p-3"
          items={stageTotals.map((row) => ({
            id: row.stage,
            label: stages[row.stage].label,
            meta: `${grouped.format(row.deals)} ${row.deals === 1 ? 'deal' : 'deals'}`,
            value: row.value,
          }))}
          format={usdCompact.format}
          empty="No deals yet"
        />
        {stats.length > 0 ? (
          <dl className="mt-auto grid auto-cols-fr grid-flow-col divide-x divide-border border-t border-border">
            {stats.map((stat) => (
              <div key={stat.label} className="flex min-w-0 flex-col gap-0.5 px-4 py-3">
                <dt className="text-small text-pretty wrap-break-word text-muted-foreground">{stat.label}</dt>
                <dd className="truncate text-title font-medium text-foreground tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </PanelContent>
    </Panel>
  );
}

function QuotaPanel({ quota }: { quota: QuotaRow[] }) {
  const titleId = React.useId();
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle id={titleId}>Quota</PanelTitle>
        <PanelDescription>Won this quarter against target</PanelDescription>
      </PanelHeader>
      <PanelContent>
        {quota.length === 0 ? (
          <p role="status" className="flex min-h-36 items-center justify-center p-4 text-center text-small text-muted-foreground">
            No targets set for this quarter
          </p>
        ) : (
          <ul aria-labelledby={titleId} role="list" className="flex flex-col divide-y divide-border">
            {quota.map((row) => {
              const percent = row.target > 0 ? (row.won / row.target) * 100 : 0;
              return (
                <li key={row.id} className="flex min-w-0 flex-col gap-2.5 px-4 py-3">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <PersonAvatar name={row.name} avatarUrl={row.avatarUrl} size="sm" />
                      <TwoLine primary={<span title={row.name}>{row.name}</span>} secondary={row.team} />
                    </div>
                    <TwoLine
                      primary={usdCompact.format(row.won)}
                      secondary={`of ${usdCompact.format(row.target)}`}
                      className="shrink-0 items-end tabular-nums"
                    />
                  </div>
                  <Meter
                    value={row.won}
                    max={Math.max(1, row.target)}
                    tone={percent >= 90 ? 'success' : 'primary'}
                    aria-label={`${row.name}, quota`}
                    getAriaValueText={() => `${Math.round(percent)}%`}
                    className="items-center gap-y-0"
                  >
                    <MeterBar className="col-span-1 row-start-1" />
                    <span aria-hidden className="col-start-2 row-start-1 min-w-9 text-end text-caption text-muted-foreground tabular-nums">
                      {grouped.format(Math.round(percent))}%
                    </span>
                  </Meter>
                </li>
              );
            })}
          </ul>
        )}
      </PanelContent>
    </Panel>
  );
}

function ActivityPanel({ activity, className }: { activity: ActivityItem[]; className?: string }) {
  const titleId = React.useId();
  return (
    <Panel className={className}>
      <PanelHeader>
        <PanelTitle id={titleId}>Activity</PanelTitle>
        <PanelDescription>Your team, today</PanelDescription>
      </PanelHeader>
      <PanelContent className="flex flex-col p-4">
        {activity.length === 0 ? (
          <p role="status" className="flex min-h-28 flex-1 items-center justify-center text-center text-small text-muted-foreground">
            Nothing yet today
          </p>
        ) : (
          <ol aria-labelledby={titleId} className="flex flex-1 flex-col">
            {activity.map((item, index) => (
              <li key={item.id} className="relative flex min-w-0 gap-3 pb-4 not-last:flex-1 last:pb-0">
                {index < activity.length - 1 ? <span aria-hidden className="absolute start-3 top-7 bottom-1 w-px bg-border" /> : null}
                <PersonAvatar name={item.who} avatarUrl={item.avatarUrl} size="sm" />
                <p className="min-w-0 flex-1 pt-0.5 text-small wrap-break-word text-muted-foreground">
                  <span className="font-medium text-foreground">{item.who}</span> {item.what}
                </p>
                <span className="shrink-0 pt-0.5 text-caption text-muted-foreground tabular-nums">
                  {item.when}
                  <span className="sr-only"> ago</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </PanelContent>
    </Panel>
  );
}

type DashboardCrmProps = Omit<React.ComponentProps<'section'>, 'children'> & {
  /** The KPIs across the top, four in a row on a wide container. */
  kpis?: Kpi[];
  /** The deals in the table, in the order to show them. */
  deals?: Deal[];
  /** The value and count of deals at each stage, in stage order. */
  stageTotals?: StageTotal[];
  /** The figures under the stages ("Lead to won", "Average deal"). */
  stageStats?: StageStat[];
  /** What the team has to do today. */
  tasks?: Task[];
  /** Each rep's won value against their target. */
  quota?: QuotaRow[];
  /** What the team did today, newest first. */
  activity?: ActivityItem[];
  /** Shows a Deal button beside the search, which calls this. */
  onNewDeal?: () => void;
  /** The items of each deal's actions menu, as `DropdownMenuItem`s. Leave it out for no menu. */
  dealActions?: (deal: Deal) => React.ReactNode;
  /** Called with the task whose button was pressed. */
  onTaskAction?: (task: Task) => void;
  /** Where the View all tasks button goes. Leave it out for no button. */
  tasksHref?: string;
};

/**
 * A sales dashboard: the KPIs, the deals with their win chance, today's next steps, the pipeline by stage, each rep's
 * quota and the team's activity, each section on its own Panel. Lays itself out by its own width, not the screen's.
 */
function DashboardCrm({
  kpis = sampleKpis,
  deals = sampleDeals,
  stageTotals = sampleStages,
  stageStats = sampleStageStats,
  tasks = sampleTasks,
  quota = sampleQuota,
  activity = sampleActivity,
  onNewDeal,
  dealActions,
  onTaskAction,
  tasksHref,
  className,
  ...props
}: DashboardCrmProps) {
  return (
    <section data-slot="dashboard-crm" aria-label="Sales" className={cn('@container flex min-w-0 flex-col gap-3', className)} {...props}>
      <KpiStrip kpis={kpis} />
      <div className="grid min-w-0 gap-3 @6xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <DealsPanel deals={deals} onNewDeal={onNewDeal} dealActions={dealActions} />
        <TasksPanel tasks={tasks} onTaskAction={onTaskAction} tasksHref={tasksHref} />
      </div>
      <div className="grid min-w-0 gap-3 @3xl:grid-cols-2 @6xl:grid-cols-3">
        <StagesPanel stageTotals={stageTotals} stats={stageStats} />
        <QuotaPanel quota={quota} />
        <ActivityPanel activity={activity} className="@3xl:col-span-2 @6xl:col-span-1" />
      </div>
    </section>
  );
}

type DashboardCrmPageProps = DashboardCrmProps & {
  /** The page title in the header. */
  title?: string;
  /** The App sidebar's props: your pages, the current one, the workspaces and the signed-in user. */
  sidebar?: AppSidebarProps;
  /** The page frame's props, a `SidebarProvider`. It fills the screen; give it a height to place the page in a smaller frame. */
  frame?: Omit<React.ComponentProps<typeof SidebarProvider>, 'children'>;
};

/**
 * The sales dashboard as a whole page: the App sidebar beside a header with the title, and the dashboard under it,
 * scrolling while the sidebar and header stay put. Use `DashboardCrm` alone inside an app frame you already have.
 */
function DashboardCrmPage({ title = 'Sales', sidebar, frame, ...props }: DashboardCrmPageProps) {
  return (
    <SidebarProvider {...frame} className={cn('h-svh min-h-0', frame?.className)}>
      <AppSidebar activeItem="overview" {...sidebar} />
      <SidebarResizeHandle />
      <SidebarInset className="min-h-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <h1 className="truncate text-title font-medium">{title}</h1>
        </header>
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-3 sm:p-4">
            <DashboardCrm {...props} />
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}

export {
  DashboardCrm,
  DashboardCrmPage,
  type DashboardCrmPageProps,
  type DashboardCrmProps,
  type Kpi as CrmKpi,
  type Deal,
  type Stage as DealStage,
  type StageTotal,
  type StageStat,
  type Task as CrmTask,
  type QuotaRow,
  type ActivityItem,
};
