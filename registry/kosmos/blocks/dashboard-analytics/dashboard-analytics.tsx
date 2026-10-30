'use client';

import {
  AtSign,
  Check,
  CheckCheck,
  Clock,
  CreditCard,
  Ellipsis,
  Gauge,
  Mail,
  MessageSquare,
  Percent,
  Timer,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { AppSidebar, type AppSidebarProps } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { useControlled } from '@/registry/kosmos/hooks/use-controlled';
import { cn } from '@/registry/kosmos/lib/cn';
import { isSameDay, lastDays, rangeLength } from '@/registry/kosmos/lib/dates';
import { statDelta } from '@/registry/kosmos/lib/stat-delta';
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { BarList, type BarListItem } from '@/registry/kosmos/ui/bar-list';
import { Button } from '@/registry/kosmos/ui/button';
import { GrowthChart, type ChartConfig } from '@/registry/kosmos/ui/chart';
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
import { DateRangePicker, type DateRangeValue } from '@/registry/kosmos/ui/date-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/registry/kosmos/ui/dropdown-menu';
import { Meter, MeterBar, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';
import {
  NotificationInbox,
  NotificationInboxActions,
  NotificationInboxBody,
  NotificationInboxContent,
  NotificationInboxGroup,
  NotificationInboxHeader,
  NotificationInboxTitle,
  NotificationInboxTrigger,
  NotificationItem,
  NotificationItemAside,
  NotificationItemContent,
  NotificationItemDescription,
  NotificationItemMedia,
  NotificationItemQuickAction,
  NotificationItemQuickActions,
  NotificationItemTime,
  NotificationItemTitle,
} from '@/registry/kosmos/ui/notification-inbox';
import { Panel, PanelAction, PanelContent, PanelDescription, PanelFooter, PanelHeader, PanelTitle } from '@/registry/kosmos/ui/panel';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
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

type Range = '7d' | '30d' | '90d';
type Plan = 'free' | 'pro' | 'scale' | 'trial';
type GoodWhen = 'up' | 'down' | 'neither';

type Kpi = {
  id: string;
  icon: LucideIcon;
  /** A muted line of context above the label ("Visit to signup"). */
  eyebrow?: string;
  label: string;
  /** The value, already formatted ("3.3%", "4m 12s"). */
  value: string;
  /** The change against the period before, in percent, or in points with `unit: 'points'`. */
  change: number;
  unit?: 'percent' | 'points';
  goodWhen?: GoodWhen;
  /** Muted text after the change ("(+52)", "from 2.9%"). */
  context?: string;
  /** The values behind the sparkline, oldest first. */
  trend: number[];
};

type TrafficTotal = { label: string; value: string; change: number; unit?: 'percent' | 'points'; goodWhen?: GoodWhen };
type TrafficPoint = { label: string; current: number; previous: number };
type Traffic = { totals: TrafficTotal[]; points: TrafficPoint[] };

type Source = { id: string; label: string; visitors: number };

type SignupGoal = {
  /** What the goal covers, under the title ("October target: 1,300 signups"). */
  description: string;
  count: number;
  target: number;
  /** How far ahead (+) or behind (−) of an even pace the count is, in percentage points. */
  pace: number;
  /** The team that owns the goal, as avatars beside its name. */
  team: { label: string; people: { name: string; avatarUrl?: string }[] };
};

type Presence = 'online' | 'away' | 'offline';

type Signup = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  presence?: Presence;
  plan: Plan;
  source: string;
  /** Where the visit came from within its source ("Google", "Weekly digest"). */
  referrer: string;
  /** The last onboarding step done, and how far along onboarding is, 0 to 100. */
  step: string;
  activation: number;
  /** The monthly revenue of the signup's project, in USD. 0 on Free and on a trial. */
  mrr: number;
  /** When they signed up, already written ("2 min ago"). */
  joined: string;
};

// Sample data: Acme's own website and signups, over the 30 days to 11 October 2026. Replace it with yours.
const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const dayBefore = (daysAgo: number) => dayLabel.format(Date.UTC(2026, 9, 11) - daysAgo * 86_400_000);

/** A calm line: small steps around a trend from `start` to `end`, with weekends lower. */
const wave = (length: number, start: number, end: number, phase: number, weekly: boolean) =>
  Array.from({ length }, (_, i) => {
    const trend = start + ((end - start) * i) / Math.max(1, length - 1);
    const weekend = weekly && (i + phase) % 7 >= 5 ? -0.05 : 0;
    return Math.round(trend * (1 + weekend + 0.015 * Math.sin(i * 0.8 + phase)));
  });

function samplePoints(length: number, step: number, currentEnds: [number, number], previousEnds: [number, number], weekly: boolean) {
  const current = wave(length, ...currentEnds, 2, weekly);
  const previous = wave(length, ...previousEnds, 4, weekly);
  return current.map((value, i) => ({ label: dayBefore((length - 1 - i) * step), current: value, previous: previous[i] }));
}

const sampleTraffic: Record<Range, Traffic> = {
  '7d': {
    totals: [
      { label: 'Visitors', value: '9,180', change: 1.8 },
      { label: 'Page views', value: '29,800', change: 2.6 },
      { label: 'Bounce rate', value: '37.6%', change: -0.8, unit: 'points', goodWhen: 'down' },
    ],
    points: samplePoints(7, 1, [1280, 1350], [1270, 1300], true),
  },
  '30d': {
    totals: [
      { label: 'Visitors', value: '38,910', change: -8.4 },
      { label: 'Page views', value: '126,400', change: -5.1 },
      { label: 'Bounce rate', value: '38.2%', change: -2.1, unit: 'points', goodWhen: 'down' },
    ],
    points: samplePoints(30, 1, [1240, 1350], [1460, 1370], true),
  },
  '90d': {
    totals: [
      { label: 'Visitors', value: '121,400', change: 6.3 },
      { label: 'Page views', value: '391,200', change: 7.9 },
      { label: 'Bounce rate', value: '39.0%', change: -1.2, unit: 'points', goodWhen: 'down' },
    ],
    points: samplePoints(13, 7, [8600, 9300], [8200, 8700], false),
  },
};

const sampleKpis: Kpi[] = [
  {
    id: 'visitors',
    icon: Users,
    eyebrow: 'acme.example',
    label: 'Visitors',
    value: '38,910',
    change: -8.4,
    context: '(−3,573)',
    trend: [10120, 10040, 9890, 9760, 9820, 9640, 9580, 9610, 9470, 9390, 9420, 9180],
  },
  {
    id: 'signups',
    icon: UserPlus,
    eyebrow: 'Free and trial',
    label: 'Signups',
    value: '1,284',
    change: 4.2,
    context: '(+52)',
    trend: [96, 104, 99, 108, 112, 106, 115, 118, 112, 121, 117, 121],
  },
  {
    id: 'conversion',
    icon: Percent,
    eyebrow: 'Visit to signup',
    label: 'Conversion',
    value: '3.3%',
    change: 0.4,
    unit: 'points',
    context: 'from 2.9%',
    trend: [2.9, 3.0, 2.9, 3.1, 3.0, 3.1, 3.2, 3.1, 3.2, 3.3, 3.2, 3.3],
  },
  {
    id: 'session',
    icon: Timer,
    eyebrow: 'Per visit',
    label: 'Median session',
    value: '4m 12s',
    change: -3.2,
    context: '(−8s)',
    trend: [262, 266, 259, 264, 258, 261, 255, 257, 254, 256, 253, 252],
  },
];

const sampleSources: Source[] = [
  { id: 'search', label: 'Search', visitors: 15950 },
  { id: 'direct', label: 'Direct', visitors: 10510 },
  { id: 'referral', label: 'Referral', visitors: 6610 },
  { id: 'social', label: 'Social', visitors: 3890 },
  { id: 'email', label: 'Email', visitors: 1950 },
];

const sampleTopPages: BarListItem[] = [
  { id: 'pricing', label: '/pricing', value: 9840 },
  { id: 'install', label: '/docs/install', value: 8170 },
  { id: 'home', label: '/', value: 7410 },
  { id: 'events', label: '/docs/events', value: 5150 },
  { id: 'changelog', label: '/changelog', value: 2660 },
];

const sampleCountries: BarListItem[] = [
  { id: 'us', label: 'United States', meta: 'US', value: 15180 },
  { id: 'de', label: 'Germany', meta: 'DE', value: 5470 },
  { id: 'gb', label: 'United Kingdom', meta: 'GB', value: 4550 },
  { id: 'fr', label: 'France', meta: 'FR', value: 3330 },
  { id: 'gr', label: 'Greece', meta: 'GR', value: 2470 },
];

const sampleGoal: SignupGoal = {
  description: 'October target: 1,300 signups',
  count: 482,
  target: 1300,
  pace: 1.6,
  team: { label: 'Growth', people: [{ name: 'Kai Nakamura', avatarUrl: '/avatars/kai.jpg' }, { name: 'Lena Park', avatarUrl: '/avatars/lena.jpg' }, { name: 'Ama Mensah', avatarUrl: '/avatars/ama.jpg' }] },
};

const sampleSignups: Signup[] = [
  { id: 'leila', name: 'Leila Haddad', avatarUrl: '/avatars/leila.jpg', email: 'leila@ironbark.example', presence: 'online', plan: 'scale', source: 'Search', referrer: 'Google', step: 'Invited the team', activation: 92, mrr: 2900, joined: '2 min ago' },
  { id: 'daniel', name: 'Daniel Okafor', avatarUrl: '/avatars/daniel.jpg', email: 'daniel@cirrus.example', presence: 'online', plan: 'pro', source: 'Referral', referrer: 'GitHub', step: 'Sent a first event', activation: 64, mrr: 390, joined: '18 min ago' },
  { id: 'tessa', name: 'Tessa Morgan', avatarUrl: '/avatars/tessa.jpg', email: 'tessa@marigold.example', presence: 'away', plan: 'trial', source: 'Direct', referrer: 'Typed the address', step: 'Installed the SDK', activation: 41, mrr: 0, joined: '1 hour ago' },
  { id: 'owen', name: 'Owen Fitzgerald', avatarUrl: '/avatars/owen.jpg', email: 'owen@saltmarsh.example', presence: 'offline', plan: 'pro', source: 'Email', referrer: 'Weekly digest', step: 'Built a funnel', activation: 78, mrr: 149, joined: '3 hours ago' },
  { id: 'noor', name: 'Noor Rahman', avatarUrl: '/avatars/noor.jpg', email: 'noor@pebblepine.example', presence: 'online', plan: 'free', source: 'Social', referrer: 'Mastodon', step: 'Created a project', activation: 18, mrr: 0, joined: '5 hours ago' },
  { id: 'sofia', name: 'Sofia Lindqvist', avatarUrl: '/avatars/sofia.jpg', email: 'sofia@driftwood.example', presence: 'offline', plan: 'pro', source: 'Search', referrer: 'Google', step: 'Built a funnel', activation: 81, mrr: 290, joined: 'Yesterday' },
  { id: 'ines', name: 'Ines Duarte', avatarUrl: '/avatars/ines-duarte.jpg', email: 'ines@fernhill.example', presence: 'away', plan: 'scale', source: 'Referral', referrer: 'Acme docs', step: 'Invited the team', activation: 95, mrr: 2400, joined: 'Yesterday' },
  { id: 'marcus', name: 'Marcus Bell', avatarUrl: '/avatars/marcus.jpg', email: 'marcus@brightloop.example', presence: 'offline', plan: 'scale', source: 'Direct', referrer: 'Typed the address', step: 'Sent a first event', activation: 58, mrr: 3600, joined: 'Oct 9' },
  { id: 'ruth', name: 'Ruth Adeyemi', avatarUrl: '/avatars/ruth.jpg', email: 'ruth@copperline.example', presence: 'offline', plan: 'scale', source: 'Email', referrer: 'Quota alert', step: 'Exported events', activation: 88, mrr: 4800, joined: 'Oct 8' },
];

// A fixed locale, so the server and the browser render the same text.
const grouped = new Intl.NumberFormat('en-US');
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const ranges: Record<Range, { label: string; xLabel: string }> = {
  '7d': { label: '7 days', xLabel: 'Day' },
  '30d': { label: '30 days', xLabel: 'Day' },
  '90d': { label: '90 days', xLabel: 'Week of' },
};

const plans: Record<Plan, { label: string; hue: 'gray' | 'blue' | 'violet' | 'amber' }> = {
  free: { label: 'Free', hue: 'gray' },
  pro: { label: 'Pro', hue: 'blue' },
  scale: { label: 'Scale', hue: 'violet' },
  trial: { label: 'Trial', hue: 'amber' },
};

const trafficConfig = {
  current: { label: 'Current', color: 'var(--chart-1)' },
  previous: { label: 'Previous', color: 'var(--chart-1)' },
} satisfies ChartConfig;

/** Rows a table shows before it pages; the pager shows only past it. */
const firstPageSize = 5;

/** Sources shows the first five; their shares are of all visitors. */
const maxSources = 5;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

/** Names a KPI's sparkline for screen readers: what it shows and which way it went ("Signups trend, up +4.2%"). */
function trendLabel({ label, change, unit }: Pick<Kpi, 'label' | 'change' | 'unit'>) {
  const delta = statDelta(change, { unit });
  return !delta || delta.direction === 'flat' ? `${label} trend, flat` : `${label} trend, ${delta.direction} ${delta.text}`;
}

/** The KPIs as Stat cards on one tray: four in a row on a wide page, two on a medium one, one on a phone. */
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
                <StatCardSparkline data={kpi.trend.map((value) => ({ value }))} aria-label={trendLabel(kpi)} />
              ) : null}
            </StatCardContent>
          </StatCard>
        ))}
      </div>
    </Panel>
  );
}

function TrafficPanel({ traffic, range, onRangeChange }: { traffic: Record<Range, Traffic>; range: Range; onRangeChange: (range: Range) => void }) {
  const { totals, points } = traffic[range];
  const rangeLabel = ranges[range].label;

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Traffic</PanelTitle>
        <PanelDescription>
          Visitors a {range === '90d' ? 'week' : 'day'} against the {rangeLabel} before
        </PanelDescription>
        <PanelAction className="gap-x-4">
          {points.length > 0 ? (
            <ul aria-label="Legend" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted-foreground">
              {(['current', 'previous'] as const).map((key) => (
                <li key={key} className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className={cn('size-2 shrink-0 rounded-sm bg-chart-1 forced-colors:bg-[CanvasText]', key === 'previous' && 'opacity-45')}
                  />
                  {trafficConfig[key].label}
                </li>
              ))}
            </ul>
          ) : null}
          <SegmentedControl size="sm" aria-label="Range" value={range} onValueChange={(value) => onRangeChange(value as Range)}>
            {(Object.keys(ranges) as Range[]).map((key) => (
              <SegmentedControlItem key={key} value={key}>
                {key}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </PanelAction>
      </PanelHeader>
      <PanelContent className="flex flex-col">
        {totals.length > 0 ? (
          <dl className="grid auto-cols-fr grid-flow-col divide-x divide-border border-b border-border">
            {totals.map((total) => (
              <div key={total.label} className="flex min-w-0 flex-col gap-1 px-4 py-3">
                <dt className="text-small text-pretty wrap-break-word text-muted-foreground">{total.label}</dt>
                <dd className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="truncate text-title font-medium text-foreground tabular-nums">{total.value}</span>
                  <StatCardDelta value={total.change} unit={total.unit} goodWhen={total.goodWhen} className="text-caption" />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div className="flex flex-1 flex-col justify-center px-4 pt-3 pb-4">
          {points.length > 0 ? (
            <GrowthChart
              key={range}
              title={`Visitors, last ${rangeLabel} against the ${rangeLabel} before`}
              data={points}
              config={trafficConfig}
              xKey="label"
              xLabel={ranges[range].xLabel}
              previousKeys={['previous']}
              legend={false}
              grid
              className="flex-1 *:data-[slot=chart]:h-auto *:data-[slot=chart]:min-h-60 *:data-[slot=chart]:flex-1"
            />
          ) : (
            <p role="status" className="flex min-h-60 items-center justify-center text-center text-small text-muted-foreground">
              No visits in this range yet
            </p>
          )}
        </div>
      </PanelContent>
    </Panel>
  );
}

function RankedPanel({ title, description, items, showShare, total }: { title: string; description: string; items: BarListItem[]; showShare?: boolean; total?: number }) {
  const titleId = React.useId();
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle id={titleId}>{title}</PanelTitle>
        <PanelDescription>{description}</PanelDescription>
      </PanelHeader>
      <PanelContent className="p-3">
        <BarList aria-labelledby={titleId} items={items} format={compact.format} showShare={showShare} total={total} empty="No visitors yet" />
      </PanelContent>
    </Panel>
  );
}

function GoalPanel({ goal }: { goal: SignupGoal }) {
  const percent = goal.target > 0 ? Math.round((goal.count / goal.target) * 100) : 0;
  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Signup goal</PanelTitle>
        <PanelDescription>{goal.description}</PanelDescription>
      </PanelHeader>
      <PanelContent className="flex flex-col justify-between gap-5 p-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-display text-foreground tabular-nums">{percent}%</span>
          <StatCardDelta value={goal.pace} unit="points" className="text-caption">
            {goal.pace < 0 ? 'behind pace' : 'ahead of pace'}
          </StatCardDelta>
        </div>
        <Meter value={goal.count} max={Math.max(1, goal.target)} aria-label="Signups against the target" className="items-center">
          <MeterSegments count={48} className="h-9 gap-0.75 *:rounded-full" />
        </Meter>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="text-small text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{grouped.format(goal.count)}</span> of{' '}
            <span className="tabular-nums">{grouped.format(goal.target)}</span> signups
          </p>
          {goal.team.people.length > 0 ? (
            <div className="flex min-w-0 items-center gap-2">
              <AvatarGroup>
                {goal.team.people.slice(0, 3).map((person) => (
                  <Avatar key={person.name} size="sm" className="ring-card">
                    {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt="" /> : null}
                    <AvatarFallback>{initials(person.name)}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <span className="truncate text-small text-muted-foreground">{goal.team.label}</span>
            </div>
          ) : null}
        </div>
      </PanelContent>
    </Panel>
  );
}

const presenceDot: Record<Presence, { className: string; label: string }> = {
  online: { className: 'bg-tint-green-dot', label: 'Online' },
  away: { className: 'bg-tint-amber-dot', label: 'Away' },
  offline: { className: 'bg-tint-gray-dot', label: 'Offline' },
};

/** A value in ink with a muted line of context under it. */
function TwoLine({ primary, secondary, className }: { primary: React.ReactNode; secondary?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-col', className)}>
      <span className="truncate text-body text-foreground">{primary}</span>
      {secondary ? <span className="truncate text-small text-muted-foreground">{secondary}</span> : null}
    </div>
  );
}

/** A person: the avatar with a presence dot, the name and their email under it. */
function PersonCell({ signup }: { signup: Signup }) {
  const presence = signup.presence ? presenceDot[signup.presence] : null;
  return (
    <div className="flex max-w-64 min-w-0 items-center gap-2.5">
      <span className="relative shrink-0">
        <Avatar>
          {signup.avatarUrl ? <AvatarImage src={signup.avatarUrl} alt="" /> : null}
          <AvatarFallback>{initials(signup.name)}</AvatarFallback>
        </Avatar>
        {presence ? (
          <span
            aria-hidden
            className={cn('absolute -end-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-card forced-colors:bg-[CanvasText]', presence.className)}
          />
        ) : null}
      </span>
      <TwoLine
        primary={
          <>
            <span title={signup.name}>{signup.name}</span>
            {presence ? <span className="sr-only">, {presence.label}</span> : null}
          </>
        }
        secondary={<span title={signup.email}>{signup.email}</span>}
      />
    </div>
  );
}

const planOrder = Object.keys(plans) as Plan[];
const planOptions: DataTableFacetOption[] = planOrder.map((plan) => ({
  value: plan,
  label: plans[plan].label,
  render: <Badge variant={plans[plan].hue}>{plans[plan].label}</Badge>,
}));

/** The signup actions menu, from the dashboard's props, so the columns stay the same between renders. */
const SignupActionsContext = React.createContext<((signup: Signup) => React.ReactNode) | undefined>(undefined);

function SignupActions({ signup }: { signup: Signup }) {
  const signupActions = React.useContext(SignupActionsContext);
  if (!signupActions) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="item" size="icon-sm" aria-label={`Actions for ${signup.name}`} className="text-muted-foreground" />}
      >
        <Ellipsis aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{signupActions(signup)}</DropdownMenuContent>
    </DropdownMenu>
  );
}

const signupColumn = createDataTableColumnHelper<Signup>();
const signupColumns = signupColumn.columns([
  signupColumn.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <PersonCell signup={row.original} />,
    sortFn: 'text',
    enableHiding: false,
    meta: { label: 'Name', sortLabels: ['A to Z', 'Z to A'], className: 'ps-4', cellClassName: 'h-15' },
  }),
  signupColumn.accessor('plan', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <Badge variant={plans[row.original.plan].hue}>{plans[row.original.plan].label}</Badge>,
    sortFn: (a, b, id) => planOrder.indexOf(a.getValue(id)) - planOrder.indexOf(b.getValue(id)),
    filterFn: 'arrHas',
    enableHiding: false,
    meta: { label: 'Plan', sortLabels: ['Free to Trial', 'Trial to Free'] },
  }),
  signupColumn.accessor('source', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => (
      <TwoLine primary={row.original.source} secondary={<span title={row.original.referrer}>{row.original.referrer}</span>} />
    ),
    sortFn: 'text',
    enableHiding: false,
    meta: { label: 'Source', sortLabels: ['A to Z', 'Z to A'], cellClassName: 'max-w-48' },
  }),
  signupColumn.accessor('activation', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row: { original: signup } }) => (
      <div className="flex min-w-40 flex-col gap-1">
        <span className="truncate text-body">{signup.step}</span>
        <Meter value={signup.activation} aria-label={`${signup.name}, onboarding`} className="items-center gap-y-0">
          <MeterBar className="col-span-1 row-start-1" />
          <MeterValue className="row-start-1 w-9 text-caption" />
        </Meter>
      </div>
    ),
    sortFn: 'basic',
    enableHiding: false,
    meta: { label: 'Activation', sortLabels: ['Low to high', 'High to low'], headerClassName: 'min-w-44' },
  }),
  signupColumn.accessor('mrr', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row: { original: signup } }) => (
      <TwoLine
        primary={signup.mrr > 0 ? usd.format(signup.mrr) : '—'}
        secondary={signup.mrr > 0 ? 'per month' : 'no charge'}
        className="items-end tabular-nums"
      />
    ),
    sortFn: 'basic',
    enableHiding: false,
    meta: { label: 'MRR', align: 'end', sortLabels: ['Low to high', 'High to low'] },
  }),
  signupColumn.accessor('joined', {
    header: 'Joined',
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'last:pe-4', cellClassName: 'text-muted-foreground' },
  }),
  signupColumn.display({
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <SignupActions signup={row.original} />,
    enableHiding: false,
    meta: { className: 'pe-4 text-end', headerClassName: 'w-12', skeleton: null },
  }),
]);

/** The search matches the name or the email, once per row. */
const searchSignups: Pick<DataTableOptions<Signup>, 'globalFilterFn' | 'getColumnCanGlobalFilter'> = {
  getColumnCanGlobalFilter: (column) => column.id === 'name',
  globalFilterFn: (row, _columnId, query: string) => {
    const needle = query.trim().toLowerCase();
    return !needle || [row.original.name, row.original.email].some((text) => text.toLowerCase().includes(needle));
  },
};

function SignupsPanel({ signups, signupActions }: { signups: Signup[]; signupActions?: (signup: Signup) => React.ReactNode }) {
  const titleId = React.useId();
  const columnVisibility = React.useMemo(() => ({ actions: Boolean(signupActions) }), [signupActions]);
  const table = useDataTable({
    data: signups,
    columns: signupColumns,
    getRowId: (signup) => signup.id,
    ...searchSignups,
    initialState: { pagination: { pageIndex: 0, pageSize: firstPageSize } },
    state: { columnVisibility },
  });
  const filtered = Boolean(table.atoms.globalFilter.get()) || table.atoms.columnFilters.get().length > 0;

  return (
    <SignupActionsContext.Provider value={signupActions}>
      <Panel>
        <PanelHeader>
          <PanelTitle id={titleId}>Recent signups</PanelTitle>
          <PanelDescription>Newest first</PanelDescription>
          <PanelAction>
            <DataTableSearch
              table={table}
              label="Search signups"
              placeholder="Search signups"
              className="w-56 @max-md/panel:min-w-0 @max-md/panel:flex-1"
            />
            <DataTableFacetFilter column={table.getColumn('plan')!} options={planOptions} noun="plans" rowNoun="signup" />
          </PanelAction>
        </PanelHeader>
        <PanelContent>
          <DataTableContent
            table={table}
            aria-labelledby={titleId}
            className="min-w-0"
            empty={
              <p className="flex h-24 items-center justify-center px-4 text-center text-small text-muted-foreground">
                {filtered ? 'No signups match. Try another name or plan.' : 'No signups yet'}
              </p>
            }
          />
        </PanelContent>
        {signups.length > firstPageSize ? (
          <PanelFooter>
            <DataTableFooter table={table} noun="signup" pageSizes={[5, 10, 20]} pages className="min-h-0 w-full border-t-0 p-0" />
          </PanelFooter>
        ) : null}
      </Panel>
    </SignupActionsContext.Provider>
  );
}

type DashboardAnalyticsProps = Omit<React.ComponentProps<'section'>, 'children'> & {
  /** The KPIs across the top, four in a row on a wide container. */
  kpis?: Kpi[];
  /** The traffic chart and its totals for each range. */
  traffic?: Record<Range, Traffic>;
  /** Visitors by source, most first; the list shows the first five, each with its share of all visitors. */
  sources?: Source[];
  /** The most visited pages, most visited first. */
  topPages?: BarListItem[];
  /** Visitors by country, most first. Each row's share is against all visitors in `sources`. */
  countries?: BarListItem[];
  /** The signup goal of the month. */
  goal?: SignupGoal;
  /** The newest signups, newest first. */
  signups?: Signup[];
  /** The range of the traffic chart. Use with `onRangeChange`, or leave it out and pass `defaultRange`. */
  range?: Range;
  defaultRange?: Range;
  onRangeChange?: (range: Range) => void;
  /** The items of each signup's actions menu, as `DropdownMenuItem`s. Leave it out for no menu. */
  signupActions?: (signup: Signup) => React.ReactNode;
};

/**
 * A product analytics dashboard: the KPIs, traffic against the period before, the signup goal, sources, top pages,
 * countries and the newest signups, each section on its own Panel. Lays itself out by its own width, not the screen's.
 */
function DashboardAnalytics({
  kpis = sampleKpis,
  traffic = sampleTraffic,
  sources = sampleSources,
  topPages = sampleTopPages,
  countries = sampleCountries,
  goal = sampleGoal,
  signups = sampleSignups,
  range: rangeProp,
  defaultRange = '30d',
  onRangeChange,
  signupActions,
  className,
  ...props
}: DashboardAnalyticsProps) {
  const [range, setRange] = useControlled(rangeProp, defaultRange, onRangeChange);
  const visitors = sources.reduce((sum, source) => sum + Math.max(0, source.visitors), 0);

  return (
    <section
      data-slot="dashboard-analytics"
      aria-label="Analytics"
      className={cn('@container flex min-w-0 flex-col gap-3', className)}
      {...props}
    >
      <KpiStrip kpis={kpis} />
      <div className="grid min-w-0 gap-3 @5xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <TrafficPanel traffic={traffic} range={range} onRangeChange={setRange} />
        <div className="grid min-w-0 gap-3 @3xl:grid-cols-2 @5xl:grid-cols-1">
          <GoalPanel goal={goal} />
          <RankedPanel
            title="Sources"
            description="Where visitors came from"
            items={sources.slice(0, maxSources).map((source) => ({ id: source.id, label: source.label, value: source.visitors }))}
            showShare
            total={visitors > 0 ? visitors : undefined}
          />
        </div>
      </div>
      <div className="grid min-w-0 gap-3 @3xl:grid-cols-2">
        <RankedPanel title="Top pages" description="By visitors, last 30 days" items={topPages} />
        <RankedPanel
          title="Countries"
          description="By visitors, last 30 days"
          items={countries}
          showShare
          total={visitors > 0 ? visitors : undefined}
        />
      </div>
      <SignupsPanel signups={signups} signupActions={signupActions} />
    </section>
  );
}


// Sample data: Lena Park's notifications at noon on 11 October. Replace it with yours.
const sampleNotifications: DashboardNotification[] = [
  {
    id: 'mention',
    day: 'Today',
    title: (
      <>
        <strong>Tomás Ortega</strong> mentioned you in <strong>Q4 roadmap</strong>
      </>
    ),
    description: '@Lena can you check the activation funnel numbers before the Friday review?',
    time: '4m',
    dateTime: '2026-10-11T11:56:00Z',
    avatar: { src: '/avatars/tomas.jpg', fallback: 'TO' },
    icon: <AtSign />,
    unread: true,
  },
  {
    id: 'quota',
    day: 'Today',
    title: (
      <>
        <strong>Cirrus Weather</strong> has used 80% of its October event allowance
      </>
    ),
    time: '1h',
    dateTime: '2026-10-11T10:58:00Z',
    avatar: { src: '/logos/cirrus.svg', fallback: 'C', square: true },
    icon: <Gauge />,
    unread: true,
  },
  {
    id: 'comment',
    day: 'Today',
    title: (
      <>
        <strong>Ama Mensah</strong> and <strong>3 others</strong> commented on <strong>Onboarding checklist</strong>
      </>
    ),
    description: 'Moved the invite step after the first event, so new teams see data sooner.',
    time: '2h',
    dateTime: '2026-10-11T09:40:00Z',
    avatar: { src: '/avatars/ama.jpg', fallback: 'AM' },
    icon: <MessageSquare />,
  },
  {
    id: 'billing',
    day: 'Today',
    title: (
      <>
        <strong>Ironbark Logistics</strong> moved to the Scale plan
      </>
    ),
    time: '3h',
    dateTime: '2026-10-11T09:02:00Z',
    avatar: { src: '/logos/ironbark.svg', fallback: 'I', square: true },
    icon: <CreditCard />,
  },
  {
    id: 'trial',
    day: 'Yesterday',
    title: (
      <>
        <strong>Marigold Recipes</strong> ends its trial in 11 days
      </>
    ),
    time: 'Yesterday',
    dateTime: '2026-10-10T15:10:00Z',
    avatar: { src: '/logos/marigold.svg', fallback: 'M', square: true },
    icon: <Clock />,
  },
];

/** The sample's today, so the quick ranges end on the last day of the sample data. */
const sampleToday = new Date(2026, 9, 11);
const rangeDays: Record<Range, number> = { '7d': 7, '30d': 30, '90d': 90 };
const periods = (today: Date) =>
  (Object.keys(rangeDays) as Range[]).map((range) => ({ range, label: `Last ${rangeDays[range]} days`, ...lastDays(rangeDays[range], today) }));
/** The range whose data stands in for a period you pick by hand: the shortest one that covers it. */
const rangeFor = (days: number): Range => (days <= 7 ? '7d' : days <= 30 ? '30d' : '90d');

type DashboardNotification = {
  id: string;
  /** The group it sits under, such as "Today" or "Yesterday". */
  day: string;
  /** The sentence. Wrap names and the object in `<strong>`. */
  title: React.ReactNode;
  /** A quote or a line of detail under it. */
  description?: string;
  /** When it arrived, already written ("4m", "Yesterday"), and as an ISO date and time. */
  time: string;
  dateTime: string;
  /** A person's photo, or a project's logo with `square`. The fallback shows until it loads. */
  avatar: { src?: string; fallback: string; square?: boolean };
  /** The kind, as a small icon on the avatar: a mention, a quota, a won deal. */
  icon?: React.ReactNode;
  unread?: boolean;
};

/** The bell in the page header and its inbox. It keeps what is read itself, starting from each notification's `unread`. */
function HeaderInbox({
  notifications,
  onNotificationOpen,
}: {
  notifications: DashboardNotification[];
  onNotificationOpen?: (notification: DashboardNotification) => void;
}) {
  const [read, setRead] = React.useState(() => new Set(notifications.filter((item) => !item.unread).map((item) => item.id)));
  const unread = notifications.filter((item) => !read.has(item.id)).length;
  const days = [...new Set(notifications.map((item) => item.day))];
  const toggle = (id: string) =>
    setRead((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <NotificationInbox>
      <NotificationInboxTrigger count={unread} />
      <NotificationInboxContent>
        <NotificationInboxHeader>
          <NotificationInboxTitle>Notifications</NotificationInboxTitle>
          {unread > 0 ? (
            <NotificationInboxActions>
              <Button variant="ghost" size="sm" onClick={() => setRead(new Set(notifications.map((item) => item.id)))}>
                <CheckCheck data-icon="inline-start" aria-hidden />
                Mark all as read
              </Button>
            </NotificationInboxActions>
          ) : null}
        </NotificationInboxHeader>
        <NotificationInboxBody>
          {notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-small text-muted-foreground">You’re all caught up</p>
          ) : (
            days.map((day) => (
              <NotificationInboxGroup key={day} label={day}>
                {notifications
                  .filter((item) => item.day === day)
                  .map((item) => (
                    <NotificationItem key={item.id} unread={!read.has(item.id)}>
                      <NotificationItemMedia icon={item.icon}>
                        <Avatar className={item.avatar.square ? 'rounded-md' : undefined}>
                          {item.avatar.src ? <AvatarImage src={item.avatar.src} alt="" /> : null}
                          <AvatarFallback className={item.avatar.square ? 'rounded-md' : undefined}>{item.avatar.fallback}</AvatarFallback>
                        </Avatar>
                      </NotificationItemMedia>
                      <NotificationItemContent>
                        <NotificationItemTitle
                          href={`#${item.id}`}
                          onClick={(event) => {
                            event.preventDefault();
                            if (!read.has(item.id)) toggle(item.id);
                            onNotificationOpen?.(item);
                          }}
                        >
                          {item.title}
                        </NotificationItemTitle>
                        {item.description ? <NotificationItemDescription>{item.description}</NotificationItemDescription> : null}
                      </NotificationItemContent>
                      <NotificationItemAside>
                        <NotificationItemTime dateTime={item.dateTime}>{item.time}</NotificationItemTime>
                        <NotificationItemQuickActions>
                          <NotificationItemQuickAction
                            label={read.has(item.id) ? 'Mark as unread' : 'Mark as read'}
                            onClick={() => toggle(item.id)}
                          >
                            {read.has(item.id) ? <Mail /> : <Check />}
                          </NotificationItemQuickAction>
                        </NotificationItemQuickActions>
                      </NotificationItemAside>
                    </NotificationItem>
                  ))}
              </NotificationInboxGroup>
            ))
          )}
        </NotificationInboxBody>
      </NotificationInboxContent>
    </NotificationInbox>
  );
}

type DashboardAnalyticsPageProps = DashboardAnalyticsProps & {
  /** The page title in the header. */
  title?: string;
  /** The notifications in the header's inbox, newest first. `null` leaves the bell out. */
  notifications?: DashboardNotification[] | null;
  /** Called when a notification is opened from the inbox. */
  onNotificationOpen?: (notification: DashboardNotification) => void;
  /**
   * The last day of the header's period picker, whose quick ranges are the last 7, 30 and 90 days. It sets `range`,
   * as the traffic panel's switch does. A period picked by hand shows the shortest range that covers it.
   */
  today?: Date;
  /** The App sidebar's props: your pages, the current one, the workspaces and the signed-in user. */
  sidebar?: AppSidebarProps;
  /** The page frame's props, a `SidebarProvider`. It fills the screen; give it a height to place the page in a smaller frame. */
  frame?: Omit<React.ComponentProps<typeof SidebarProvider>, 'children'>;
};

/**
 * The analytics dashboard as a whole page: the App sidebar beside a header with the title, and the dashboard under it,
 * scrolling while the sidebar and header stay put. Use `DashboardAnalytics` alone inside an app frame you already have.
 */
function DashboardAnalyticsPage({
  title = 'Analytics',
  sidebar,
  frame,
  notifications = sampleNotifications,
  onNotificationOpen,
  today = sampleToday,
  range: rangeProp,
  defaultRange = '30d',
  onRangeChange,
  ...props
}: DashboardAnalyticsPageProps) {
  const [range, setRange] = useControlled(rangeProp, defaultRange, onRangeChange);
  const [picked, setPicked] = React.useState<DateRangeValue | null>(null);
  const ranges = React.useMemo(() => periods(today), [today]);
  const current = ranges.find((period) => period.range === range) ?? ranges[1];
  const pickPeriod = (period: DateRangeValue) => {
    const quick = ranges.find((item) => isSameDay(item.from, period.from) && isSameDay(item.to, period.to));
    setPicked(quick ? null : period);
    setRange(quick?.range ?? rangeFor(rangeLength(period)));
  };

  return (
    <SidebarProvider {...frame} className={cn('h-svh min-h-0', frame?.className)}>
      <AppSidebar activeItem="overview" {...sidebar} />
      <SidebarResizeHandle />
      <SidebarInset className="min-h-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <SidebarTrigger />
          <h1 className="min-w-0 flex-1 truncate text-title font-medium">{title}</h1>
          <DateRangePicker
            aria-label="Period"
            value={picked ?? current}
            onValueChange={pickPeriod}
            ranges={ranges}
            max={today}
            align="end"
            className="h-7.5 shrink-0"
          />
          {notifications ? <HeaderInbox notifications={notifications} onNotificationOpen={onNotificationOpen} /> : null}
        </header>
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-3 sm:p-4">
            <DashboardAnalytics
              {...props}
              range={range}
              onRangeChange={(next) => {
                setPicked(null);
                setRange(next);
              }}
            />
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}

export {
  type DashboardNotification as AnalyticsNotification,
  DashboardAnalytics,
  DashboardAnalyticsPage,
  type DashboardAnalyticsPageProps,
  type DashboardAnalyticsProps,
  type Kpi as AnalyticsKpi,
  type Traffic,
  type TrafficTotal,
  type TrafficPoint,
  type Source as TrafficSource,
  type SignupGoal,
  type Signup,
  type Plan as SignupPlan,
  type Range as AnalyticsRange,
};
