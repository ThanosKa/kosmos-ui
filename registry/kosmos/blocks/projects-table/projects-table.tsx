'use client';

import { functionalUpdate, type Row, type RowSelectionState } from '@tanstack/react-table';
import {
  Boxes,
  Download,
  Ellipsis,
  ExternalLink,
  Globe,
  Link2,
  Pause,
  Play,
  Server,
  Smartphone,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { useControlled } from '@/registry/kosmos/hooks/use-controlled';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge, type BadgeProps } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import {
  createDataTableColumnHelper,
  DataTable,
  DataTableBulkBar,
  DataTableColumnHeader,
  DataTableColumnToggle,
  DataTableContent,
  DataTableFacetFilter,
  DataTableFooter,
  DataTableReset,
  DataTableSearch,
  DataTableSelectAll,
  DataTableSelectRow,
  DataTableToolbar,
  useDataTable,
  type DataTableFacetOption,
  type DataTableFeatures,
  type DataTableOptions,
} from '@/registry/kosmos/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { EmptyState } from '@/registry/kosmos/ui/empty';
import { Meter, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
import { StatusDot, type Status } from '@/registry/kosmos/ui/status';

type ProjectPlatform = 'web' | 'ios' | 'android' | 'server';
type ProjectPlan = 'free' | 'pro' | 'scale';
type ProjectStatus = 'live' | 'trial' | 'paused';

/** One site or app that sends events. */
type Project = {
  id: string;
  name: string;
  domain: string;
  /** The URL of the project's logo. Its first letter shows until it loads. */
  logo?: string;
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
  { id: 'fernhill', name: 'Fernhill Books', domain: 'fernhill.example', logo: '/logos/fernhill.svg', platform: 'web', plan: 'scale', status: 'live', users: 48210, events: 3912400, mrr: 2400, lastEventAt: '2026-10-11' },
  { id: 'brightloop', name: 'Brightloop Fitness', domain: 'brightloop.example', logo: '/logos/brightloop.svg', platform: 'ios', plan: 'scale', status: 'live', users: 31480, events: 5204800, mrr: 3600, lastEventAt: '2026-10-11' },
  { id: 'copperline', name: 'Copperline Bank', domain: 'copperline.example', logo: '/logos/copperline.svg', platform: 'server', plan: 'scale', status: 'live', users: 12940, events: 8730100, mrr: 4800, lastEventAt: '2026-10-11' },
  { id: 'saltmarsh', name: 'Saltmarsh Coffee', domain: 'saltmarsh.example', logo: '/logos/saltmarsh.svg', platform: 'web', plan: 'pro', status: 'live', users: 6120, events: 412300, mrr: 149, lastEventAt: '2026-10-10' },
  { id: 'driftwood', name: 'Driftwood Travel', domain: 'driftwood.example', logo: '/logos/driftwood.svg', platform: 'android', plan: 'pro', status: 'live', users: 9870, events: 1108600, mrr: 290, lastEventAt: '2026-10-11' },
  { id: 'hollowoak', name: 'Hollow Oak Games', domain: 'hollowoak.example', logo: '/logos/hollowoak.svg', platform: 'android', plan: 'pro', status: 'paused', users: 2310, events: 96200, mrr: 99, lastEventAt: '2026-09-18' },
  { id: 'cirrus', name: 'Cirrus Weather', domain: 'cirrus.example', logo: '/logos/cirrus.svg', platform: 'ios', plan: 'pro', status: 'live', users: 22560, events: 2391700, mrr: 390, lastEventAt: '2026-10-11' },
  { id: 'pebblepine', name: 'Pebble & Pine', domain: 'pebblepine.example', logo: '/logos/pebblepine.svg', platform: 'web', plan: 'free', status: 'live', users: 840, events: 31200, mrr: 0, lastEventAt: '2026-10-09' },
  { id: 'marigold', name: 'Marigold Recipes', domain: 'marigold.example', logo: '/logos/marigold.svg', platform: 'web', plan: 'pro', status: 'trial', users: 1920, events: 74500, mrr: 0, lastEventAt: '2026-10-11' },
  { id: 'kiln', name: 'Kiln Studio', domain: 'kiln.example', logo: '/logos/kiln.svg', platform: 'web', plan: 'free', status: 'paused', users: 120, events: 2400, mrr: 0, lastEventAt: '2026-08-30' },
  { id: 'tidepool', name: 'Tidepool Notes', domain: 'tidepool.example', logo: '/logos/tidepool.svg', platform: 'ios', plan: 'pro', status: 'trial', users: 3450, events: 188100, mrr: 0, lastEventAt: '2026-10-10' },
  { id: 'ironbark', name: 'Ironbark Logistics', domain: 'ironbark.example', logo: '/logos/ironbark.svg', platform: 'server', plan: 'scale', status: 'live', users: 4780, events: 6342900, mrr: 2900, lastEventAt: '2026-10-11' },
];

const platforms: Record<ProjectPlatform, { label: string; icon: LucideIcon }> = {
  web: { label: 'Web', icon: Globe },
  ios: { label: 'iOS', icon: Smartphone },
  android: { label: 'Android', icon: Smartphone },
  server: { label: 'Server', icon: Server },
};

const plans: Record<ProjectPlan, { label: string; variant: BadgeProps['variant'] }> = {
  free: { label: 'Free', variant: 'gray' },
  pro: { label: 'Pro', variant: 'blue' },
  scale: { label: 'Scale', variant: 'violet' },
};

const planAllowance: Record<ProjectPlan, number> = { free: 50_000, pro: 3_000_000, scale: 8_000_000 };

/** The share of its plan's monthly allowance a project used in the last 30 days, in percent. It can pass 100. */
const eventQuota = (row: Project) => Math.round((row.events / planAllowance[row.plan]) * 100);

/** Each status as a state of `StatusDot`: live is green, trial gray, paused amber. */
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


/** The columns after Project, which is always shown. Each one sorts and can be hidden. */
type ProjectsTableColumn = 'platform' | 'plan' | 'users' | 'events' | 'quota' | 'mrr' | 'status' | 'lastEventAt';
type Sort = { key: 'name' | ProjectsTableColumn; direction: 'ascending' | 'descending' };
/** What the row menu and the bulk bar offer. */
type ProjectsTableAction = 'copy-link' | 'export' | 'pause' | 'resume' | 'delete';

/** Columns that step aside as the block narrows, so the table fits its frame before it scrolls sideways. */
const wideColumn = 'hidden @min-[74rem]:table-cell';
const midColumn = 'hidden @min-[60rem]:table-cell';
const narrowColumns = {
  quota: 'hidden @min-[52rem]:table-cell',
  plan: 'hidden @min-[42rem]:table-cell',
  users: 'hidden @min-[37rem]:table-cell',
  mrr: 'hidden @min-[32rem]:table-cell',
};

/** The bulk bar's actions: Resume in place of Pause when every selected project is paused. */
const bulkActions = (allPaused: boolean): { action: ProjectsTableAction; label: string; icon: LucideIcon }[] => [
  { action: 'export', label: 'Export', icon: Download },
  allPaused ? { action: 'resume', label: 'Resume', icon: Play } : { action: 'pause', label: 'Pause', icon: Pause },
  { action: 'delete', label: 'Delete', icon: Trash2 },
];

const planOrder = Object.keys(plans) as ProjectPlan[];
const statusOrder = Object.keys(statuses) as ProjectStatus[];
const platformOrder = Object.keys(platforms) as ProjectPlatform[];

type ProjectRow = Row<DataTableFeatures, Project>;
const byText = (a: ProjectRow, b: ProjectRow, id: string) => a.getValue<string>(id).localeCompare(b.getValue<string>(id));
const byOrder = (order: readonly string[]) => (a: ProjectRow, b: ProjectRow, id: string) =>
  order.indexOf(a.getValue<string>(id)) - order.indexOf(b.getValue<string>(id));

/** The faceted filters, in the order of the toolbar. Their values are what `filters` holds. */
const facets: { id: ProjectsTableColumn; title: string; noun: string; options: DataTableFacetOption[] }[] = [
  {
    id: 'plan',
    title: 'Plan',
    noun: 'plans',
    options: planOrder.map((plan) => ({
      value: plan,
      label: plans[plan].label,
      render: <Badge variant={plans[plan].variant}>{plans[plan].label}</Badge>,
    })),
  },
  {
    id: 'platform',
    title: 'Platform',
    noun: 'platforms',
    options: platformOrder.map((platform) => ({
      value: platform,
      label: platforms[platform].label,
      render: <PlatformLabel platform={platform} />,
    })),
  },
  {
    id: 'status',
    title: 'Status',
    noun: 'statuses',
    options: statusOrder.map((status) => ({
      value: status,
      label: statuses[status].label,
      render: <StatusLabel status={status} />,
    })),
  },
];
const facetValues = new Set(facets.flatMap((facet) => facet.options.map((option) => option.value)));

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

/** What the cells need from the table's props, so the columns stay the same between renders. */
const ProjectsTableContext = React.createContext<{
  loading: boolean;
  onOpen?: (row: Project) => void;
  onAction?: (action: ProjectsTableAction, rows: Project[]) => void;
}>({ loading: false });

function SelectAllCell({ table }: { table: Parameters<typeof DataTableSelectAll<Project>>[0]['table'] }) {
  const { loading } = React.useContext(ProjectsTableContext);
  return <DataTableSelectAll table={table} label="Select all projects on this page" disabled={loading} />;
}

function ProjectCell({ row }: { row: Project }) {
  const { onOpen } = React.useContext(ProjectsTableContext);
  return (
    <div className="flex min-w-0 items-center gap-2.5 @max-md:w-28">
      <Avatar size="sm" aria-hidden className="rounded-md">
        {row.logo ? <AvatarImage src={row.logo} alt="" /> : null}
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
  );
}

function RowActions({ row }: { row: Project }) {
  const { onOpen, onAction } = React.useContext(ProjectsTableContext);
  if (!onOpen && !onAction) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="item" size="icon-sm" aria-label={`Actions for ${row.name}`} className="text-muted-foreground" />}
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
  );
}

const lowHigh: [string, string] = ['Low to high', 'High to low'];
const column = createDataTableColumnHelper<Project>();
const columns = column.columns([
  column.display({
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => <SelectAllCell table={table} />,
    cell: ({ row }) => <DataTableSelectRow row={row} label={`Select ${row.original.name}`} />,
    meta: { className: 'ps-4 pe-0', headerClassName: 'w-10', skeleton: <Skeleton className="size-4 rounded-sm" /> },
  }),
  column.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <ProjectCell row={row.original} />,
    sortFn: byText,
    enableHiding: false,
    meta: {
      label: 'Project',
      sortLabels: ['A to Z', 'Z to A'],
      cellClassName: 'w-64 max-w-72 @max-lg:w-auto',
      skeleton: (
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-6 rounded-md" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ),
    },
  }),
  column.accessor('platform', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <PlatformLabel platform={row.original.platform} />,
    sortFn: (a, b, id) =>
      platforms[a.getValue<ProjectPlatform>(id)].label.localeCompare(platforms[b.getValue<ProjectPlatform>(id)].label),
    filterFn: 'arrHas',
    meta: { label: 'Platform', sortLabels: ['A to Z', 'Z to A'], className: wideColumn },
  }),
  column.accessor('plan', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <Badge variant={plans[row.original.plan].variant}>{plans[row.original.plan].label}</Badge>,
    sortFn: byOrder(planOrder),
    filterFn: 'arrHas',
    meta: {
      label: 'Plan',
      sortLabels: ['Free to Scale', 'Scale to Free'],
      className: narrowColumns.plan,
      skeleton: <Skeleton className="h-5.5 w-12 rounded-full" />,
    },
  }),
  column.accessor('users', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => count.format(row.original.users),
    sortFn: 'basic',
    meta: { label: 'Users', align: 'end', sortLabels: lowHigh, className: narrowColumns.users, skeleton: <Skeleton className="ms-auto h-3.5 w-12" /> },
  }),
  column.accessor('events', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => count.format(row.original.events),
    sortFn: 'basic',
    meta: { label: 'Events', align: 'end', sortLabels: lowHigh, className: midColumn },
  }),
  column.accessor(eventQuota, {
    id: 'quota',
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <EventQuota row={row.original} />,
    sortFn: 'basic',
    meta: { label: 'Event quota', sortLabels: lowHigh, className: narrowColumns.quota, skeleton: <Skeleton className="h-3 w-32" /> },
  }),
  column.accessor('mrr', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) =>
      row.original.mrr ? (
        usd.format(row.original.mrr)
      ) : (
        <>
          <span aria-hidden className="text-muted-foreground">–</span>
          <span className="sr-only">None</span>
        </>
      ),
    sortFn: 'basic',
    meta: { label: 'MRR', align: 'end', sortLabels: lowHigh, className: narrowColumns.mrr, skeleton: <Skeleton className="ms-auto h-3.5 w-12" /> },
  }),
  column.accessor('status', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <StatusLabel status={row.original.status} />,
    sortFn: byOrder(statusOrder),
    filterFn: 'arrHas',
    meta: { label: 'Status', sortLabels: ['Live to Paused', 'Paused to Live'], skeleton: <Skeleton className="h-3.5 w-14" /> },
  }),
  column.accessor('lastEventAt', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <time dateTime={row.original.lastEventAt}>{formatDay(row.original.lastEventAt)}</time>,
    sortFn: byText,
    meta: {
      label: 'Last event',
      sortLabels: ['Oldest first', 'Newest first'],
      className: wideColumn,
      cellClassName: 'text-muted-foreground',
      skeleton: <Skeleton className="h-3.5 w-12" />,
    },
  }),
  column.display({
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => <DataTableColumnToggle table={table} />,
    cell: ({ row }) => <RowActions row={row.original} />,
    meta: { className: 'pe-4 text-end', headerClassName: 'w-12', skeleton: null },
  }),
]);

/** The search matches the name or the domain, once per row. */
const searchOptions: Pick<DataTableOptions<Project>, 'globalFilterFn' | 'getColumnCanGlobalFilter'> = {
  getColumnCanGlobalFilter: (candidate) => candidate.id === 'name',
  globalFilterFn: (row, _columnId, query: string) => {
    const needle = query.trim().toLowerCase();
    return !needle || [row.original.name, row.original.domain].some((text) => text.toLowerCase().includes(needle));
  },
};

type ProjectsTableProps = Omit<React.ComponentProps<'div'>, 'children'> & {
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
  onAction?: (action: ProjectsTableAction, rows: Project[]) => void;
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
  hiddenColumns?: ProjectsTableColumn[];
  defaultHiddenColumns?: ProjectsTableColumn[];
  onHiddenColumnsChange?: (columns: ProjectsTableColumn[]) => void;
  /** The page, from 1. Goes back to 1 when the search, the filters or the sort change. Use with `onPageChange`, or leave it out and pass `defaultPage`. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Rows per page. */
  pageSize?: number;
};

/**
 * A table of projects, built from the Data table parts: a toolbar with search and faceted filters, column menus to
 * sort and hide columns, row selection with a bulk action bar, platform, plan tags, usage, an event quota meter and
 * revenue, a status dot, a row actions menu, totals and pages in the footer, and loading and empty states. Scrolls
 * sideways on narrow screens.
 */
function ProjectsTable({
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
}: ProjectsTableProps) {
  const [query, setQuery] = useControlled(queryProp, defaultQuery, onQueryChange);
  const [filters, setFilters] = useControlled<string[]>(filtersProp, defaultFilters, onFiltersChange);
  const [selection, setSelection] = useControlled<string[]>(selectionProp, defaultSelection, onSelectionChange);
  const [sort, setSort] = useControlled<Sort | null>(sortProp, defaultSort ?? null, onSortChange);
  const [hidden, setHidden] = useControlled<ProjectsTableColumn[]>(hiddenProp, defaultHiddenColumns, onHiddenColumnsChange);
  const [page, setPage] = useControlled(pageProp, defaultPage, onPageChange);

  // The table holds its state in TanStack's shapes; the props keep the block's own.
  const data = React.useMemo(() => (status === 'all' ? rows : rows.filter((row) => row.status === status)), [rows, status]);
  const columnFilters = React.useMemo(
    () =>
      facets
        .map((facet) => ({ id: facet.id, value: filters.filter((value) => facet.options.some((option) => option.value === value)) }))
        .filter((filter) => filter.value.length),
    [filters],
  );
  const sorting = React.useMemo(() => (sort ? [{ id: sort.key, desc: sort.direction === 'descending' }] : []), [sort]);
  const columnVisibility = React.useMemo(() => Object.fromEntries(hidden.map((id) => [id, false])), [hidden]);
  const rowSelection = React.useMemo(
    () => Object.fromEntries(selection.map((id) => [id, true as const])) as RowSelectionState,
    [selection],
  );
  const pagination = React.useMemo(() => ({ pageIndex: page - 1, pageSize }), [page, pageSize]);

  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    ...searchOptions,
    state: { globalFilter: query, columnFilters, sorting, columnVisibility, rowSelection, pagination },
    onGlobalFilterChange: (updater) => setQuery(String(functionalUpdate(updater, query) ?? '')),
    onColumnFiltersChange: (updater) =>
      setFilters([
        ...filters.filter((value) => !facetValues.has(value)),
        ...functionalUpdate(updater, columnFilters).flatMap((filter) => filter.value as string[]),
      ]),
    onSortingChange: (updater) => {
      const [next] = functionalUpdate(updater, sorting);
      setSort(next ? { key: next.id as Sort['key'], direction: next.desc ? 'descending' : 'ascending' } : null);
    },
    onColumnVisibilityChange: (updater) =>
      setHidden(
        Object.entries(functionalUpdate(updater, columnVisibility))
          .filter(([, visible]) => visible === false)
          .map(([id]) => id as ProjectsTableColumn),
      ),
    onRowSelectionChange: (updater) =>
      setSelection(
        Object.entries(functionalUpdate(updater, rowSelection))
          .filter(([, selected]) => selected)
          .map(([id]) => id),
      ),
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination);
      if (next.pageIndex !== pagination.pageIndex) setPage(next.pageIndex + 1);
    },
  });

  const visible = table.getFilteredRowModel().rows.map((row) => row.original);
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totals = [
    { label: 'Users', value: countCompact.format(visible.reduce((sum, row) => sum + row.users, 0)) },
    { label: 'Events', value: countCompact.format(visible.reduce((sum, row) => sum + row.events, 0)) },
    { label: 'MRR', value: usd.format(visible.reduce((sum, row) => sum + row.mrr, 0)) },
  ];
  const ownFilters = query.trim() !== '' || columnFilters.length > 0;
  const filtering = ownFilters || status !== 'all';
  const resetFilters = () => {
    if (query !== '') setQuery('');
    if (filters.length) setFilters([]);
  };
  const context = React.useMemo(() => ({ loading, onOpen, onAction }), [loading, onOpen, onAction]);

  return (
    <ProjectsTableContext.Provider value={context}>
      <DataTable className={className} {...props}>
        {toolbar ? (
          <DataTableToolbar aria-label="Search and filter projects">
            <DataTableSearch table={table} label="Search projects" />
            {facets.map((facet) => (
              <DataTableFacetFilter
                key={facet.id}
                column={table.getColumn(facet.id)!}
                title={facet.title}
                noun={facet.noun}
                rowNoun="project"
                options={facet.options}
              />
            ))}
            <DataTableReset table={table} />
          </DataTableToolbar>
        ) : null}

        <DataTableContent
          table={table}
          aria-label="Projects"
          loading={loading}
          onRowClick={onOpen ? (row) => onOpen(row.original) : undefined}
          empty={
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
          }
        />

        <DataTableFooter table={table} loading={loading} noun="project">
          {selectedCount ? (
            <DataTableBulkBar table={table} noun="project">
              {(selected) =>
                onAction
                  ? bulkActions(selected.every((row) => row.status === 'paused')).map(({ action, label, icon: Icon }) => (
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
                  : null
              }
            </DataTableBulkBar>
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
        </DataTableFooter>
      </DataTable>
    </ProjectsTableContext.Provider>
  );
}

export {
  ProjectsTable,
  sampleProjects,
  type Project,
  type ProjectPlan,
  type ProjectPlatform,
  type ProjectsTableAction,
  type ProjectsTableColumn,
  type ProjectsTableProps,
  type ProjectStatus,
  type Sort as ProjectsTableSort,
};
