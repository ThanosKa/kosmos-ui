'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Boxes,
  Check,
  CirclePlus,
  Columns3,
  Download,
  Ellipsis,
  ExternalLink,
  EyeOff,
  Globe,
  Link2,
  Pause,
  Play,
  Search,
  SearchX,
  Server,
  Smartphone,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { useControlled } from '@/registry/kosmos/hooks/use-controlled';
import { cn } from '@/registry/kosmos/lib/cn';
import { facetCounts, matchesFacets, type Facet } from '@/registry/kosmos/lib/facets';
import { clampPage, pageCount, pageRows } from '@/registry/kosmos/lib/paging';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
import { Badge, type BadgeProps } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { Checkbox } from '@/registry/kosmos/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { EmptyState } from '@/registry/kosmos/ui/empty';
import { Input } from '@/registry/kosmos/ui/input';
import { Meter, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';
import { Pagination, PaginationNext, PaginationPrevious, PaginationStatus } from '@/registry/kosmos/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/registry/kosmos/ui/popover';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
import { StatusDot, type Status } from '@/registry/kosmos/ui/status';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

type ProjectPlatform = 'web' | 'ios' | 'android' | 'server';
type ProjectPlan = 'free' | 'pro' | 'scale';
type ProjectStatus = 'live' | 'trial' | 'paused';

/** One site or app that sends events. */
type Project = {
  id: string;
  name: string;
  domain: string;
  platform: ProjectPlatform;
  plan: ProjectPlan;
  status: ProjectStatus;
  /** Monthly active users. */
  users: number;
  /** Events received in the last 30 days. */
  events: number;
  /** Monthly recurring revenue, in dollars: 0 on the free plan and during a trial. */
  mrr: number;
  /** The day of the last event, as an ISO date (`2026-10-11`). */
  lastEventAt: string;
};

// Sample data: replace it with your rows.
const sampleProjects: Project[] = [
  { id: 'fernhill', name: 'Fernhill Books', domain: 'fernhill.example', platform: 'web', plan: 'scale', status: 'live', users: 48210, events: 3912400, mrr: 2400, lastEventAt: '2026-10-11' },
  { id: 'brightloop', name: 'Brightloop Fitness', domain: 'brightloop.example', platform: 'ios', plan: 'scale', status: 'live', users: 31480, events: 5204800, mrr: 3600, lastEventAt: '2026-10-11' },
  { id: 'copperline', name: 'Copperline Bank', domain: 'copperline.example', platform: 'server', plan: 'scale', status: 'live', users: 12940, events: 8730100, mrr: 4800, lastEventAt: '2026-10-11' },
  { id: 'saltmarsh', name: 'Saltmarsh Coffee', domain: 'saltmarsh.example', platform: 'web', plan: 'pro', status: 'live', users: 6120, events: 412300, mrr: 149, lastEventAt: '2026-10-10' },
  { id: 'driftwood', name: 'Driftwood Travel', domain: 'driftwood.example', platform: 'android', plan: 'pro', status: 'live', users: 9870, events: 1108600, mrr: 290, lastEventAt: '2026-10-11' },
  { id: 'hollowoak', name: 'Hollow Oak Games', domain: 'hollowoak.example', platform: 'android', plan: 'pro', status: 'paused', users: 2310, events: 96200, mrr: 99, lastEventAt: '2026-09-18' },
  { id: 'cirrus', name: 'Cirrus Weather', domain: 'cirrus.example', platform: 'ios', plan: 'pro', status: 'live', users: 22560, events: 2391700, mrr: 390, lastEventAt: '2026-10-11' },
  { id: 'pebblepine', name: 'Pebble & Pine', domain: 'pebblepine.example', platform: 'web', plan: 'free', status: 'live', users: 840, events: 31200, mrr: 0, lastEventAt: '2026-10-09' },
  { id: 'marigold', name: 'Marigold Recipes', domain: 'marigold.example', platform: 'web', plan: 'pro', status: 'trial', users: 1920, events: 74500, mrr: 0, lastEventAt: '2026-10-11' },
  { id: 'kiln', name: 'Kiln Studio', domain: 'kiln.example', platform: 'web', plan: 'free', status: 'paused', users: 120, events: 2400, mrr: 0, lastEventAt: '2026-08-30' },
  { id: 'tidepool', name: 'Tidepool Notes', domain: 'tidepool.example', platform: 'ios', plan: 'pro', status: 'trial', users: 3450, events: 188100, mrr: 0, lastEventAt: '2026-10-10' },
  { id: 'ironbark', name: 'Ironbark Logistics', domain: 'ironbark.example', platform: 'server', plan: 'scale', status: 'live', users: 4780, events: 6342900, mrr: 2900, lastEventAt: '2026-10-11' },
];

const platforms: Record<ProjectPlatform, { label: string; icon: LucideIcon }> = {
  web: { label: 'Web', icon: Globe },
  ios: { label: 'iOS', icon: Smartphone },
  android: { label: 'Android', icon: Smartphone },
  server: { label: 'Server', icon: Server },
};

const plans: Record<ProjectPlan, { label: string; variant: BadgeProps['variant'] }> = {
  free: { label: 'Free', variant: 'blue' },
  pro: { label: 'Pro', variant: 'orange' },
  scale: { label: 'Scale', variant: 'magenta' },
};

const planAllowance: Record<ProjectPlan, number> = { free: 50_000, pro: 3_000_000, scale: 8_000_000 };

/** The share of its plan's monthly allowance a project used in the last 30 days, in percent. It can pass 100. */
const eventQuota = (row: Project) => Math.round((row.events / planAllowance[row.plan]) * 100);

/** Each status as a state of `StatusDot`: live is green, trial gray, paused orange. */
const statuses: Record<ProjectStatus, { label: string; dot: Status }> = {
  live: { label: 'Live', dot: 'done' },
  trial: { label: 'Trial', dot: 'pending' },
  paused: { label: 'Paused', dot: 'waiting' },
};

// Fixed locale and time zone, so the server and the browser render the same text.
const count = new Intl.NumberFormat('en-US');
const countCompact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const formatDay = (iso: string) => day.format(new Date(`${iso}T00:00:00Z`));
const plural = (n: number, noun: string) => `${count.format(n)} ${n === 1 ? noun : `${noun}s`}`;

/** The columns after Project, which is always shown. Each one sorts and can be hidden. */
type DataTableColumn = 'platform' | 'plan' | 'users' | 'events' | 'quota' | 'mrr' | 'status' | 'lastEventAt';
type SortKey = 'name' | DataTableColumn;
type Sort = { key: SortKey; direction: 'ascending' | 'descending' };
/** What the row menu and the bulk bar offer. */
type DataTableAction = 'copy-link' | 'export' | 'pause' | 'resume' | 'delete';

/** Columns that step aside as the block narrows, so the table fits its frame before it scrolls sideways. */
const wideColumn = 'hidden @min-[74rem]:table-cell';
const midColumn = 'hidden @min-[60rem]:table-cell';
const narrowColumns = {
  quota: 'hidden @min-[52rem]:table-cell',
  plan: 'hidden @min-[42rem]:table-cell',
  users: 'hidden @min-[37rem]:table-cell',
  mrr: 'hidden @min-[32rem]:table-cell',
};

type Column = {
  id: SortKey;
  label: string;
  align?: 'end';
  /** The width the column shows from, while it is on. */
  fit?: string;
  /** The two sort orders, in words that fit the values: ascending, then descending. */
  orders: [string, string];
};

const nameColumn: Column = { id: 'name', label: 'Project', orders: ['A to Z', 'Z to A'] };
const lowHigh: Column['orders'] = ['Low to high', 'High to low'];
const columns: (Column & { id: DataTableColumn })[] = [
  { id: 'platform', label: 'Platform', fit: wideColumn, orders: ['A to Z', 'Z to A'] },
  { id: 'plan', label: 'Plan', fit: narrowColumns.plan, orders: ['Free to Scale', 'Scale to Free'] },
  { id: 'users', label: 'Users', align: 'end', fit: narrowColumns.users, orders: lowHigh },
  { id: 'events', label: 'Events', align: 'end', fit: midColumn, orders: lowHigh },
  { id: 'quota', label: 'Event quota', fit: narrowColumns.quota, orders: lowHigh },
  { id: 'mrr', label: 'MRR', align: 'end', fit: narrowColumns.mrr, orders: lowHigh },
  { id: 'status', label: 'Status', orders: ['Live to Paused', 'Paused to Live'] },
  { id: 'lastEventAt', label: 'Last event', fit: wideColumn, orders: ['Oldest first', 'Newest first'] },
];

/** The bulk bar's actions: Resume in place of Pause when every selected project is paused. */
const bulkActions = (allPaused: boolean): { action: DataTableAction; label: string; icon: LucideIcon }[] => [
  { action: 'export', label: 'Export', icon: Download },
  allPaused ? { action: 'resume', label: 'Resume', icon: Play } : { action: 'pause', label: 'Pause', icon: Pause },
  { action: 'delete', label: 'Delete', icon: Trash2 },
];

const planOrder = Object.keys(plans);
const statusOrder = Object.keys(statuses);

function compare(a: Project, b: Project, key: SortKey) {
  if (key === 'name') return a.name.localeCompare(b.name);
  if (key === 'platform') return platforms[a.platform].label.localeCompare(platforms[b.platform].label);
  if (key === 'plan') return planOrder.indexOf(a.plan) - planOrder.indexOf(b.plan);
  if (key === 'status') return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
  if (key === 'lastEventAt') return a.lastEventAt.localeCompare(b.lastEventAt);
  if (key === 'quota') return eventQuota(a) - eventQuota(b);
  return a[key] - b[key];
}

/** The faceted filters, in the order of the toolbar. Their values are what `filters` holds. */
const facets: (Facet<Project> & { title: string; noun: string; option: (value: string) => React.ReactNode })[] = [
  {
    key: 'plan',
    title: 'Plan',
    noun: 'plans',
    values: planOrder,
    valueOf: (row) => row.plan,
    option: (value) => <Badge variant={plans[value as ProjectPlan].variant}>{plans[value as ProjectPlan].label}</Badge>,
  },
  {
    key: 'platform',
    title: 'Platform',
    noun: 'platforms',
    values: Object.keys(platforms),
    valueOf: (row) => row.platform,
    option: (value) => <PlatformLabel platform={value as ProjectPlatform} />,
  },
  {
    key: 'status',
    title: 'Status',
    noun: 'statuses',
    values: statusOrder,
    valueOf: (row) => row.status,
    option: (value) => <StatusLabel status={value as ProjectStatus} />,
  },
];

const facetLabel = (value: string) =>
  plans[value as ProjectPlan]?.label ?? platforms[value as ProjectPlatform]?.label ?? statuses[value as ProjectStatus]?.label ?? value;

/** Ten segments for the share of the plan's allowance used: green up to 75%, amber to 95%, red above. The bar stops at full; the number does not. */
function EventQuota({ row }: { row: Project }) {
  const quota = eventQuota(row);
  return (
    <Meter
      value={Math.min(quota, 100)}
      tone="auto"
      low={75}
      high={95}
      optimum={0}
      aria-label={`${row.name} event quota`}
      getAriaValueText={() => `${quota}% of ${count.format(planAllowance[row.plan])} events used`}
      className="w-36 grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-y-0"
    >
      <MeterSegments count={10} className="col-span-1 h-3" />
      <MeterValue className="row-start-1 text-caption">{() => `${quota}%`}</MeterValue>
    </Meter>
  );
}

function StatusLabel({ status }: { status: ProjectStatus }) {
  return <StatusDot status={statuses[status].dot}>{statuses[status].label}</StatusDot>;
}

function PlatformLabel({ platform }: { platform: ProjectPlatform }) {
  const { label, icon: Icon } = platforms[platform];
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </span>
  );
}

/**
 * The menu of a column header: its two sort orders, and Hide column for every column but Project. A hidden
 * column's menu leaves with it, so focus moves to the Columns menu, where it comes back.
 */
function ColumnHead({
  column,
  sort,
  onSort,
  onHide,
  className,
}: {
  column: Column;
  sort: Sort | null;
  onSort: (sort: Sort) => void;
  onHide?: () => void;
  className?: string;
}) {
  const active = sort?.key === column.id;
  const Icon = !active ? ArrowUpDown : sort.direction === 'ascending' ? ArrowUp : ArrowDown;
  const end = column.align === 'end';
  return (
    <TableHead
      data-column={column.id === 'name' ? undefined : column.id}
      aria-sort={active ? sort.direction : undefined}
      className={cn(end && 'text-end', className)}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="item"
              size="sm"
              className={cn(
                'h-6 gap-1 px-1.5 text-caption font-normal text-muted-foreground hover:text-foreground data-popup-open:bg-accent data-popup-open:text-foreground',
                end ? '-me-1.5 flex-row-reverse' : '-ms-1.5',
                active && 'text-foreground',
              )}
            />
          }
        >
          {column.label}
          <Icon aria-hidden className={cn('size-3', !active && 'opacity-60')} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align={end ? 'end' : 'start'}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Sort</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={active ? sort.direction : ''}
              onValueChange={(direction) => onSort({ key: column.id, direction: direction as Sort['direction'] })}
            >
              <DropdownMenuRadioItem value="ascending" closeOnClick>
                <ArrowUp aria-hidden />
                {column.orders[0]}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="descending" closeOnClick>
                <ArrowDown aria-hidden />
                {column.orders[1]}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          {onHide ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onHide}>
                <EyeOff aria-hidden />
                Hide column
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </TableHead>
  );
}

/**
 * A filter for one facet: a button that names it and the values that are on, and a popover to search the values,
 * tick them, see how many rows each would show, and clear them.
 */
function FacetFilter({
  facet,
  selected,
  counts,
  onSelectedChange,
}: {
  facet: (typeof facets)[number];
  selected: string[];
  counts: Record<string, number>;
  onSelectedChange: (values: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const summary = selected.length > 2 ? `${selected.length} on` : selected.map(facetLabel).join(', ');
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="secondary" className="max-w-full data-popup-open:bg-muted" />}>
        <CirclePlus aria-hidden data-icon="inline-start" />
        {facet.title}
        <span className="sr-only"> filter</span>
        {selected.length ? (
          <>
            <span aria-hidden className="mx-0.5 h-3.5 w-px shrink-0 bg-border" />
            <span className="sr-only">: </span>
            <span className="truncate text-muted-foreground">{summary}</span>
          </>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60">
        <ComboboxPrimitive.Root
          items={facet.values}
          itemToStringLabel={facetLabel}
          multiple
          inline
          open={open}
          autoHighlight
          value={selected}
          onValueChange={(values) => onSelectedChange(values)}
        >
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <ComboboxPrimitive.Input
              aria-label={`Search ${facet.noun}`}
              placeholder={facet.title}
              render={<Input className="h-7.5 ps-8" />}
            />
          </div>
          <ComboboxPrimitive.Empty className="text-small text-muted-foreground empty:hidden">
            No {facet.noun} match
          </ComboboxPrimitive.Empty>
          <ComboboxPrimitive.List aria-label={facet.title} className="-mx-2 flex flex-col data-empty:hidden">
            {(value: string) => (
              <ComboboxPrimitive.Item
                key={value}
                value={value}
                className={cn(
                  'group/option flex min-h-7.5 cursor-default items-center gap-2 rounded-lg px-2 py-1 outline-none select-none [-webkit-tap-highlight-color:transparent]',
                  'transition-[background-color] duration-instant data-highlighted:bg-accent',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-sm border border-transparent bg-secondary text-primary-foreground shadow-control',
                    'transition-[background-color,box-shadow] group-aria-selected/option:bg-primary group-aria-selected/option:shadow-primary',
                  )}
                >
                  <Check strokeWidth={3} className="size-3 opacity-0 transition-[opacity] group-aria-selected/option:opacity-100" />
                </span>
                <span className="flex min-w-0 flex-1">{facet.option(value)}</span>
                <span className="text-caption text-muted-foreground tabular-nums">
                  <span aria-hidden>{count.format(counts[value] ?? 0)}</span>
                  <span className="sr-only">{plural(counts[value] ?? 0, 'project')}</span>
                </span>
              </ComboboxPrimitive.Item>
            )}
          </ComboboxPrimitive.List>
        </ComboboxPrimitive.Root>
        {selected.length ? (
          <Button variant="secondary" size="sm" onClick={() => onSelectedChange([])} className="self-start">
            Clear {facet.title.toLowerCase()}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

type DataTableProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The rows. Defaults to sample projects. */
  rows?: Project[];
  /** Shows skeleton rows while the data loads. */
  loading?: boolean;
  /** Shows the search, the Plan, Platform and Status filters and Reset above the table. Turn it off when a page header filters the table. */
  toolbar?: boolean;
  /** Keeps rows whose name or domain contains this text. Use with `onQueryChange`, or leave it out and pass `defaultQuery`. */
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Keeps rows with this status; `all` keeps every row. Matches the values of the page header's tabs. */
  status?: 'all' | ProjectStatus;
  /**
   * Keeps rows on these plans, platforms and statuses (`pro`, `ios`, `paused`…), the values of the filters in the
   * toolbar or the page header. A row needs one of the values that are on in each of the three; other values are
   * ignored. Use with `onFiltersChange`, or leave it out and pass `defaultFilters`.
   */
  filters?: string[];
  defaultFilters?: string[];
  onFiltersChange?: (filters: string[]) => void;
  /** Called when a row is opened, by its name or a click anywhere on it. */
  onOpen?: (row: Project) => void;
  /**
   * Runs an action on rows: Copy link, Pause or Resume, and Delete project from a row's menu (with that row);
   * Export, Pause or Resume, and Delete from the bulk bar (with the selected rows). Those items show only when
   * this is passed. Ask before deleting.
   */
  onAction?: (action: DataTableAction, rows: Project[]) => void;
  /** Called by Clear filters in the empty state, to clear what the table does not hold itself, such as a page header's tab. */
  onClearFilters?: () => void;
  /** The ids of the selected rows. Use with `onSelectionChange`, or leave it out and pass `defaultSelection`. */
  selection?: string[];
  defaultSelection?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** The sort. Use with `onSortChange`, or leave it out and pass `defaultSort`. `null` keeps the rows' own order. */
  sort?: Sort | null;
  /** The sort at first. Without it, rows keep their order until a header's menu sorts them. */
  defaultSort?: Sort;
  /** Called with the new sort, or `null` when the sorted column is hidden. */
  onSortChange?: (sort: Sort | null) => void;
  /** The columns hidden from a header's menu. Use with `onHiddenColumnsChange`, or leave it out and pass `defaultHiddenColumns`. */
  hiddenColumns?: DataTableColumn[];
  defaultHiddenColumns?: DataTableColumn[];
  onHiddenColumnsChange?: (columns: DataTableColumn[]) => void;
  /** The page, from 1. Goes back to 1 when the search, the filters or the sort change. Use with `onPageChange`, or leave it out and pass `defaultPage`. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Rows per page. */
  pageSize?: number;
};

/**
 * A table of projects: a toolbar with search and faceted filters, column menus to sort and hide columns, row
 * selection with a bulk action bar, platform, plan tags, usage, an event quota meter and revenue, a status dot, a
 * row actions menu, totals and pages in the footer, and loading and empty states. Scrolls sideways on narrow screens.
 */
function DataTable({
  rows = sampleProjects,
  loading = false,
  toolbar = true,
  query: queryProp,
  defaultQuery = '',
  onQueryChange,
  status = 'all',
  filters: filtersProp,
  defaultFilters = [],
  onFiltersChange,
  onOpen,
  onAction,
  onClearFilters,
  selection: selectionProp,
  defaultSelection = [],
  onSelectionChange,
  sort: sortProp,
  defaultSort,
  onSortChange,
  hiddenColumns: hiddenProp,
  defaultHiddenColumns = [],
  onHiddenColumnsChange,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageSize = 10,
  className,
  ...props
}: DataTableProps) {
  const [query, setQuery] = useControlled(queryProp, defaultQuery, onQueryChange);
  const [filters, setFilters] = useControlled<string[]>(filtersProp, defaultFilters, onFiltersChange);
  const [selection, setSelection] = useControlled<string[]>(selectionProp, defaultSelection, onSelectionChange);
  const [sort, setSort] = useControlled<Sort | null>(sortProp, defaultSort ?? null, onSortChange);
  const [hidden, setHidden] = useControlled<DataTableColumn[]>(hiddenProp, defaultHiddenColumns, onHiddenColumnsChange);
  const [page, setPage] = useControlled(pageProp, defaultPage, onPageChange);
  const searchId = React.useId();
  const columnsButton = React.useRef<HTMLButtonElement>(null);

  const searched = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        (status === 'all' || row.status === status) &&
        (!needle || [row.name, row.domain].some((text) => text.toLowerCase().includes(needle))),
    );
  }, [rows, query, status]);

  const visible = React.useMemo(() => {
    const filtered = searched.filter((row) => matchesFacets(row, facets, filters));
    if (!sort) return filtered;
    const sign = sort.direction === 'ascending' ? 1 : -1;
    return [...filtered].sort((a, b) => compare(a, b, sort.key) * sign);
  }, [searched, filters, sort]);

  const viewKey = JSON.stringify([query.trim(), status, filters, sort]);
  const lastViewKey = React.useRef(viewKey);
  React.useEffect(() => {
    if (lastViewKey.current === viewKey) return;
    lastViewKey.current = viewKey;
    if (page !== 1) setPage(1);
  }, [viewKey, page, setPage]);

  const currentPage = clampPage(page, pageCount(visible.length, pageSize));
  const { from, to } = pageRows(currentPage, pageSize, visible.length);
  const pageItems = visible.slice(Math.max(0, from - 1), to);

  const selected = visible.filter((row) => selection.includes(row.id));
  const pageSelected = pageItems.filter((row) => selection.includes(row.id));
  const allOnPage = pageItems.length > 0 && pageSelected.length === pageItems.length;
  const [announcedSelection, setAnnouncedSelection] = React.useState(false);
  if (selected.length && !announcedSelection) setAnnouncedSelection(true);
  const allPaused = selected.length > 0 && selected.every((row) => row.status === 'paused');
  const totals = [
    { label: 'Users', value: countCompact.format(visible.reduce((sum, row) => sum + row.users, 0)) },
    { label: 'Events', value: countCompact.format(visible.reduce((sum, row) => sum + row.events, 0)) },
    { label: 'MRR', value: usd.format(visible.reduce((sum, row) => sum + row.mrr, 0)) },
  ];
  const ownFilters = query.trim() !== '' || filters.some((value) => facets.some((facet) => facet.values.includes(value)));
  const filtering = ownFilters || status !== 'all';
  const shown = columns.filter((column) => !hidden.includes(column.id));

  const resetFilters = () => {
    if (query !== '') setQuery('');
    if (filters.length) setFilters([]);
  };
  const setFacet = (key: string, values: string[]) => {
    const facet = facets.find((item) => item.key === key);
    setFilters([...filters.filter((value) => !facet?.values.includes(value)), ...values]);
  };
  // A hidden column stops sorting the rows, since no header would show the order.
  const setColumnHidden = (id: DataTableColumn, hide: boolean) => {
    setHidden(hide ? [...hidden, id] : hidden.filter((item) => item !== id));
    if (hide && sort?.key === id) setSort(null);
  };
  const hideColumn = (id: DataTableColumn) => {
    setColumnHidden(id, true);
    // The menu that hid the column leaves with it.
    requestAnimationFrame(() => columnsButton.current?.focus());
  };
  const [crowded, setCrowded] = React.useState<DataTableColumn[]>([]);
  const crowdedColumns = () =>
    [...(columnsButton.current?.closest('table')?.querySelectorAll<HTMLElement>('th[data-column]') ?? [])]
      .filter((head) => getComputedStyle(head).display === 'none')
      .map((head) => head.dataset.column as DataTableColumn);
  const toggleRow = (id: string, checked: boolean) =>
    setSelection(checked ? [...selection, id] : selection.filter((value) => value !== id));
  const selectAll = () => setSelection([...new Set([...selection, ...visible.map((row) => row.id)])]);

  const openFromRow = (event: React.MouseEvent<HTMLTableRowElement>, row: Project) => {
    // Clicks on the checkbox, the name or the actions menu do their own thing.
    if ((event.target as HTMLElement).closest('button, a, input, [role="checkbox"], [role="menuitem"]')) return;
    onOpen?.(row);
  };

  const cell = (row: Project, id: DataTableColumn) => {
    switch (id) {
      case 'platform':
        return <PlatformLabel platform={row.platform} />;
      case 'plan':
        return <Badge variant={plans[row.plan].variant}>{plans[row.plan].label}</Badge>;
      case 'users':
        return count.format(row.users);
      case 'events':
        return count.format(row.events);
      case 'quota':
        return <EventQuota row={row} />;
      case 'mrr':
        return row.mrr ? (
          usd.format(row.mrr)
        ) : (
          <>
            <span aria-hidden className="text-muted-foreground">–</span>
            <span className="sr-only">None</span>
          </>
        );
      case 'status':
        return <StatusLabel status={row.status} />;
      case 'lastEventAt':
        return <time dateTime={row.lastEventAt}>{formatDay(row.lastEventAt)}</time>;
    }
  };

  const skeleton: Record<DataTableColumn, string> = {
    platform: 'h-3.5 w-16',
    plan: 'h-5.5 w-12 rounded-full',
    users: 'ms-auto h-3.5 w-12',
    events: 'ms-auto h-3.5 w-16',
    quota: 'h-3 w-32',
    mrr: 'ms-auto h-3.5 w-12',
    status: 'h-3.5 w-14',
    lastEventAt: 'h-3.5 w-12',
  };

  return (
    <div data-slot="data-table" className={cn('@container flex min-w-0 flex-col', className)} {...props}>
      {toolbar ? (
        <div
          role="group"
          aria-label="Search and filter projects"
          className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2"
        >
          <div className="relative w-full @lg:w-56">
            <Search
              aria-hidden
              className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <label htmlFor={searchId} className="sr-only">
              Search projects
            </label>
            <Input
              id={searchId}
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-7.5 ps-8"
            />
          </div>
          {facets.map((facet) => (
            <FacetFilter
              key={facet.key}
              facet={facet}
              selected={filters.filter((value) => facet.values.includes(value))}
              counts={facetCounts(searched, facets, filters, facet.key)}
              onSelectedChange={(values) => setFacet(facet.key, values)}
            />
          ))}
          {ownFilters ? (
            <Button variant="ghost" onClick={resetFilters}>
              Reset
              <X aria-hidden data-icon="inline-end" />
            </Button>
          ) : null}
        </div>
      ) : null}

      <Table aria-label="Projects" aria-busy={loading || undefined} className="min-w-max">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 ps-4 pe-0">
              <Checkbox
                aria-label="Select all projects on this page"
                checked={allOnPage}
                indeterminate={pageSelected.length > 0 && !allOnPage}
                disabled={loading || pageItems.length === 0}
                onCheckedChange={(checked) =>
                  setSelection(
                    checked
                      ? [...new Set([...selection, ...pageItems.map((row) => row.id)])]
                      : selection.filter((id) => !pageItems.some((row) => row.id === id)),
                  )
                }
              />
            </TableHead>
            <ColumnHead column={nameColumn} sort={sort} onSort={setSort} />
            {shown.map((column) => (
              <ColumnHead
                key={column.id}
                column={column}
                sort={sort}
                onSort={setSort}
                onHide={() => hideColumn(column.id)}
                className={column.fit}
              />
            ))}
            <TableHead className="w-12 pe-4 text-end">
              <DropdownMenu onOpenChange={(open) => open && setCrowded(crowdedColumns())}>
                <DropdownMenuTrigger
                  ref={columnsButton}
                  render={
                    <Button
                      variant="item"
                      size="icon-sm"
                      aria-label={hidden.length ? `Columns, ${hidden.length} hidden` : 'Columns'}
                      className="text-muted-foreground data-popup-open:bg-accent"
                    />
                  }
                >
                  <Columns3 aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Show columns</DropdownMenuLabel>
                    {columns.map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={!hidden.includes(column.id)}
                        onCheckedChange={(checked) => setColumnHidden(column.id, !checked)}
                      >
                        {column.label}
                        {crowded.includes(column.id) ? (
                          <span className="ms-auto ps-4 text-caption font-normal text-muted-foreground">Too narrow</span>
                        ) : null}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                  {hidden.length ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setHidden([])}>Show all</DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: Math.min(pageSize, 6) }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell className="ps-4 pe-0">
                    <Skeleton className="size-4 rounded-sm" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-6 rounded-md" />
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  {shown.map((column) => (
                    <TableCell key={column.id} className={column.fit}>
                      <Skeleton className={skeleton[column.id]} />
                    </TableCell>
                  ))}
                  <TableCell className="pe-4" />
                </TableRow>
              ))
            : pageItems.map((row) => {
                const isSelected = selection.includes(row.id);
                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected ? 'selected' : undefined}
                    onClick={onOpen ? (event) => openFromRow(event, row) : undefined}
                    className={cn(onOpen && 'cursor-pointer')}
                  >
                    <TableCell className="ps-4 pe-0">
                      <Checkbox
                        aria-label={`Select ${row.name}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => toggleRow(row.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="w-64 max-w-72 @max-lg:w-auto">
                      <div className="flex min-w-0 items-center gap-2.5 @max-md:w-28">
                        <Avatar size="sm" aria-hidden className="rounded-md">
                          <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-1 flex-col items-start">
                          {onOpen ? (
                            <Button
                              variant="item"
                              size="sm"
                              onClick={() => onOpen(row)}
                              className="-mx-1 h-5 max-w-full justify-start rounded-sm px-1 text-body font-medium"
                            >
                              <span title={row.name} className="truncate">
                                {row.name}
                              </span>
                            </Button>
                          ) : (
                            <span title={row.name} className="max-w-full truncate font-medium">
                              {row.name}
                            </span>
                          )}
                          <span title={row.domain} className="max-w-full truncate text-caption text-muted-foreground">
                            {row.domain}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    {shown.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          column.align === 'end' && 'text-end',
                          column.id === 'lastEventAt' && 'text-muted-foreground',
                          column.fit,
                        )}
                      >
                        {cell(row, column.id)}
                      </TableCell>
                    ))}
                    <TableCell className="pe-4 text-end">
                      {onOpen || onAction ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="item"
                                size="icon-sm"
                                aria-label={`Actions for ${row.name}`}
                                className="text-muted-foreground"
                              />
                            }
                          >
                            <Ellipsis aria-hidden />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onOpen ? (
                              <DropdownMenuItem onClick={() => onOpen(row)}>
                                <ExternalLink />
                                Open project
                              </DropdownMenuItem>
                            ) : null}
                            {onAction ? (
                              <>
                                <DropdownMenuItem onClick={() => onAction('copy-link', [row])}>
                                  <Link2 />
                                  Copy link
                                </DropdownMenuItem>
                                {row.status === 'paused' ? (
                                  <DropdownMenuItem onClick={() => onAction('resume', [row])}>
                                    <Play />
                                    Resume project
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => onAction('pause', [row])}>
                                    <Pause />
                                    Pause project
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => onAction('delete', [row])}>
                                  <Trash2 />
                                  Delete project
                                </DropdownMenuItem>
                              </>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>

      {!loading && visible.length === 0 ? (
        <EmptyState
          className="py-10"
          headingLevel={2}
          noun="projects"
          variant={!filtering ? 'first-use' : query.trim() ? 'no-results' : 'filtered'}
          query={query}
          icon={!filtering ? <Boxes /> : undefined}
          description={filtering ? undefined : 'Add a project, and it shows up here once it sends its first event.'}
          onClear={
            ownFilters || onClearFilters
              ? () => {
                  resetFilters();
                  onClearFilters?.();
                }
              : undefined
          }
        />
      ) : null}

      <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-4 py-1.5 text-small text-muted-foreground tabular-nums">
        {loading ? (
          <Skeleton className="h-3.5 w-40" />
        ) : selected.length ? (
          <div role="group" aria-label="Selected projects" className="-ms-1 flex min-w-0 flex-wrap items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={() => setSelection([])}>
              <X aria-hidden />
            </Button>
            <span className="me-1 whitespace-nowrap text-foreground">{count.format(selected.length)} selected</span>
            {allOnPage && selected.length < visible.length ? (
              <Button variant="ghost" size="sm" onClick={selectAll} className="me-1">
                Select all {count.format(visible.length)}
              </Button>
            ) : null}
            {onAction
              ? bulkActions(allPaused).map(({ action, label, icon: Icon }) => (
                  <Button
                    key={action}
                    variant={action === 'delete' ? 'destructive' : 'secondary'}
                    size="sm"
                    onClick={() => onAction(action, selected)}
                    className="@max-md:pe-1.5"
                  >
                    <Icon aria-hidden data-icon="inline-start" />
                    <span className="@max-md:sr-only">{label}</span>
                  </Button>
                ))
              : null}
          </div>
        ) : (
          <dl aria-label="Totals" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {totals.map((total) => (
              <div key={total.label} className="flex gap-1.5 whitespace-nowrap">
                <dt>{total.label}</dt>
                <dd className="font-medium text-foreground">{total.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {loading ? null : (
          <Pagination
            aria-label="Pages of projects"
            page={page}
            onPageChange={setPage}
            total={visible.length}
            pageSize={pageSize}
            className="ms-auto gap-x-3"
          >
            <PaginationStatus>
              {({ from: first, to: last, total = 0 }) =>
                total === 0
                  ? 'No projects'
                  : total <= pageSize
                    ? plural(total, 'project')
                    : `${count.format(first)}–${count.format(last)} of ${plural(total, 'project')}`
              }
            </PaginationStatus>
            <div className="flex items-center gap-1">
              <PaginationPrevious />
              <PaginationNext />
            </div>
          </Pagination>
        )}
      </div>

      <div aria-live="polite" className="sr-only">
        {selected.length ? `${plural(selected.length, 'project')} selected` : announcedSelection ? 'No projects selected' : ''}
      </div>
    </div>
  );
}

export {
  DataTable,
  sampleProjects,
  type DataTableAction,
  type DataTableColumn,
  type DataTableProps,
  type Project,
  type ProjectPlan,
  type ProjectPlatform,
  type ProjectStatus,
  type Sort as DataTableSort,
};
