'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Boxes,
  Download,
  Ellipsis,
  ExternalLink,
  Globe,
  Link2,
  Pause,
  Play,
  SearchX,
  Server,
  Smartphone,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
import { Badge, type BadgeProps } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { Checkbox } from '@/registry/kosmos/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/kosmos/ui/empty';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
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

const statuses: Record<ProjectStatus, { label: string; dot: string }> = {
  live: { label: 'Live', dot: 'bg-success' },
  trial: { label: 'Trial', dot: 'bg-muted-foreground' },
  paused: { label: 'Paused', dot: 'bg-warning' },
};

// Fixed locale and time zone, so the server and the browser render the same text.
const count = new Intl.NumberFormat('en-US');
const countCompact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const formatDay = (iso: string) => day.format(new Date(`${iso}T00:00:00Z`));

type SortKey = 'name' | 'users' | 'events' | 'mrr' | 'lastEventAt';
type Sort = { key: SortKey; direction: 'ascending' | 'descending' };
/** What the row menu and the bulk bar offer. */
type DataTableAction = 'copy-link' | 'export' | 'pause' | 'resume' | 'delete';

function compare(a: Project, b: Project, key: SortKey) {
  if (key === 'name') return a.name.localeCompare(b.name);
  if (key === 'lastEventAt') return a.lastEventAt.localeCompare(b.lastEventAt);
  return a[key] - b[key];
}

/** Plans that are on widen the match among themselves, as do platforms; the two groups narrow each other. */
function matchesFilters(row: Project, filters: string[]) {
  const planFilters = filters.filter((value) => Object.hasOwn(plans, value));
  const platformFilters = filters.filter((value) => Object.hasOwn(platforms, value));
  return (
    (!planFilters.length || planFilters.includes(row.plan)) &&
    (!platformFilters.length || platformFilters.includes(row.platform))
  );
}

function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
  align = 'start',
  className,
}: {
  label: string;
  sortKey: SortKey;
  sort: Sort | null;
  onSort: (key: SortKey) => void;
  align?: 'start' | 'end';
  className?: string;
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.direction === 'ascending' ? ArrowUp : ArrowDown;
  return (
    <TableHead aria-sort={active ? sort.direction : undefined} className={cn(align === 'end' && 'text-end', className)}>
      <Button
        variant="item"
        size="sm"
        onClick={() => onSort(sortKey)}
        className={cn(
          'h-6 gap-1 px-1.5 text-caption font-normal text-muted-foreground hover:text-foreground',
          align === 'end' ? '-me-1.5 flex-row-reverse' : '-ms-1.5',
          active && 'text-foreground',
        )}
      >
        {label}
        <Icon aria-hidden className={cn('size-3', !active && 'opacity-60')} />
      </Button>
    </TableHead>
  );
}

function StatusLabel({ status }: { status: ProjectStatus }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className={cn('size-2 shrink-0 rounded-full', statuses[status].dot)} />
      {statuses[status].label}
    </span>
  );
}

function PlatformLabel({ platform }: { platform: ProjectPlatform }) {
  const { label, icon: Icon } = platforms[platform];
  return (
    <span className="flex items-center gap-2">
      <Icon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      {label}
    </span>
  );
}

type DataTableProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The rows. Defaults to sample projects. */
  rows?: Project[];
  /** Shows skeleton rows while the data loads. */
  loading?: boolean;
  /** Keeps rows whose name or domain contains this text. */
  query?: string;
  /** Keeps rows with this status; `all` keeps every row. Matches the values of the page header's tabs. */
  status?: 'all' | ProjectStatus;
  /**
   * Keeps rows on these plans and platforms (`pro`, `ios`…), the values of the page header's filters.
   * A row needs one of the plans and one of the platforms that are on; other values are ignored.
   */
  filters?: string[];
  /** Called when a row is opened, by its name or a click anywhere on it. */
  onOpen?: (row: Project) => void;
  /**
   * Runs an action on rows: Copy link, Pause or Resume, and Delete project from a row's menu (with that row);
   * Export, Pause or Resume, and Delete from the bulk bar (with the selected rows). Those items show only when
   * this is passed. Ask before deleting.
   */
  onAction?: (action: DataTableAction, rows: Project[]) => void;
  /** Shown in the empty state when a search, status or filter hides every row. */
  onClearFilters?: () => void;
  /** The ids of the selected rows. Use with `onSelectionChange`, or leave it out and pass `defaultSelection`. */
  selection?: string[];
  defaultSelection?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** The sort. Use with `onSortChange`, or leave it out and pass `defaultSort`. `null` keeps the rows' own order. */
  sort?: Sort | null;
  /** The sort at first. Without it, rows keep their order until a header is clicked. */
  defaultSort?: Sort;
  onSortChange?: (sort: Sort) => void;
};

/**
 * A table of projects: sortable columns, row selection with a bulk action bar, platform, plan tags,
 * usage and revenue, a status dot, a row actions menu, totals in the footer, and loading and empty states.
 * Scrolls sideways on narrow screens.
 */
function DataTable({
  rows = sampleProjects,
  loading = false,
  query = '',
  status = 'all',
  filters = [],
  onOpen,
  onAction,
  onClearFilters,
  selection: selectionProp,
  defaultSelection = [],
  onSelectionChange,
  sort: sortProp,
  defaultSort,
  onSortChange,
  className,
  ...props
}: DataTableProps) {
  const [sortState, setSortState] = React.useState<Sort | null>(defaultSort ?? null);
  const sort = sortProp === undefined ? sortState : sortProp;
  const [selectionState, setSelectionState] = React.useState<string[]>(defaultSelection);
  const selection = selectionProp ?? selectionState;
  const setSelection = (ids: string[]) => {
    if (selectionProp === undefined) setSelectionState(ids);
    onSelectionChange?.(ids);
  };

  const visible = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = rows.filter(
      (row) =>
        (status === 'all' || row.status === status) &&
        matchesFilters(row, filters) &&
        (!needle || [row.name, row.domain].some((text) => text.toLowerCase().includes(needle))),
    );
    if (!sort) return filtered;
    const sign = sort.direction === 'ascending' ? 1 : -1;
    return [...filtered].sort((a, b) => compare(a, b, sort.key) * sign);
  }, [rows, query, status, filters, sort]);

  const selected = visible.filter((row) => selection.includes(row.id));
  const allSelected = visible.length > 0 && selected.length === visible.length;
  const allPaused = selected.length > 0 && selected.every((row) => row.status === 'paused');
  const totals = [
    { label: 'Users', value: countCompact.format(visible.reduce((sum, row) => sum + row.users, 0)) },
    { label: 'Events', value: countCompact.format(visible.reduce((sum, row) => sum + row.events, 0)) },
    { label: 'MRR', value: usd.format(visible.reduce((sum, row) => sum + row.mrr, 0)) },
  ];
  const filtering = query.trim() !== '' || status !== 'all' || filters.length > 0;

  const onSort = (key: SortKey) => {
    const next: Sort =
      sort?.key !== key
        ? { key, direction: key === 'name' ? 'ascending' : 'descending' }
        : { key, direction: sort.direction === 'ascending' ? 'descending' : 'ascending' };
    if (sortProp === undefined) setSortState(next);
    onSortChange?.(next);
  };

  const toggleRow = (id: string, checked: boolean) =>
    setSelection(checked ? [...selection, id] : selection.filter((value) => value !== id));

  const openFromRow = (event: React.MouseEvent<HTMLTableRowElement>, row: Project) => {
    // Clicks on the checkbox, the name or the actions menu do their own thing.
    if ((event.target as HTMLElement).closest('button, a, input, [role="checkbox"], [role="menuitem"]')) return;
    onOpen?.(row);
  };

  return (
    <div data-slot="data-table" className={cn('flex min-w-0 flex-col', className)} {...props}>
      <Table aria-label="Projects" aria-busy={loading || undefined} className="min-w-[62rem]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 ps-4 pe-0">
              <Checkbox
                aria-label="Select all projects"
                checked={allSelected}
                indeterminate={selected.length > 0 && !allSelected}
                disabled={loading || visible.length === 0}
                onCheckedChange={(checked) =>
                  setSelection(
                    checked
                      ? [...new Set([...selection, ...visible.map((row) => row.id)])]
                      : selection.filter((id) => !visible.some((row) => row.id === id)),
                  )
                }
              />
            </TableHead>
            <SortableHead label="Project" sortKey="name" sort={sort} onSort={onSort} />
            <TableHead>Platform</TableHead>
            <TableHead>Plan</TableHead>
            <SortableHead label="Users" sortKey="users" sort={sort} onSort={onSort} align="end" />
            <SortableHead label="Events" sortKey="events" sort={sort} onSort={onSort} align="end" />
            <SortableHead label="MRR" sortKey="mrr" sort={sort} onSort={onSort} align="end" />
            <TableHead>Status</TableHead>
            <SortableHead label="Last event" sortKey="lastEventAt" sort={sort} onSort={onSort} />
            <TableHead className="w-12 pe-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 6 }, (_, index) => (
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
                <TableCell>
                  <Skeleton className="h-3.5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5.5 w-12 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ms-auto h-3.5 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ms-auto h-3.5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ms-auto h-3.5 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-14" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-12" />
                </TableCell>
                <TableCell className="pe-4" />
              </TableRow>
            ))
          ) : (
            visible.map((row) => {
              const isSelected = selection.includes(row.id);
              const plan = plans[row.plan];
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
                  <TableCell className="w-64 max-w-72">
                    <div className="flex min-w-0 items-center gap-2.5">
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
                            <span title={row.name} className="truncate">{row.name}</span>
                          </Button>
                        ) : (
                          <span title={row.name} className="max-w-full truncate font-medium">{row.name}</span>
                        )}
                        <span title={row.domain} className="max-w-full truncate text-caption text-muted-foreground">
                          {row.domain}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PlatformLabel platform={row.platform} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.variant}>{plan.label}</Badge>
                  </TableCell>
                  <TableCell className="text-end">{count.format(row.users)}</TableCell>
                  <TableCell className="text-end">{count.format(row.events)}</TableCell>
                  <TableCell className="text-end">
                    {row.mrr ? (
                      usd.format(row.mrr)
                    ) : (
                      <>
                        <span aria-hidden className="text-muted-foreground">–</span>
                        <span className="sr-only">None</span>
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusLabel status={row.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <time dateTime={row.lastEventAt}>{formatDay(row.lastEventAt)}</time>
                  </TableCell>
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
            })
          )}
        </TableBody>
      </Table>

      {!loading && visible.length === 0 ? (
        <Empty className="py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">{filtering ? <SearchX /> : <Boxes />}</EmptyMedia>
            <EmptyTitle render={<h2 />}>
              {!filtering ? 'No projects yet' : query.trim() ? `No projects match “${query.trim()}”` : 'No projects match'}
            </EmptyTitle>
            <EmptyDescription>
              {filtering
                ? 'Try another search, or clear the filters to see every project.'
                : 'Add a project, and it shows up here once it sends its first event.'}
            </EmptyDescription>
          </EmptyHeader>
          {filtering && onClearFilters ? (
            <EmptyContent>
              <Button variant="secondary" onClick={onClearFilters}>
                Clear filters
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : null}

      <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-4 py-1.5 text-small text-muted-foreground tabular-nums">
        {loading ? (
          <Skeleton className="h-3.5 w-40" />
        ) : selected.length ? (
          <div role="group" aria-label="Selected projects" className="-ms-1 flex min-w-0 flex-wrap items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={() => setSelection([])}>
              <X aria-hidden />
            </Button>
            <span className="me-2 whitespace-nowrap text-foreground">{selected.length} selected</span>
            {onAction ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => onAction('export', selected)}>
                  <Download aria-hidden data-icon="inline-start" />
                  Export
                </Button>
                {allPaused ? (
                  <Button variant="secondary" size="sm" onClick={() => onAction('resume', selected)}>
                    <Play aria-hidden data-icon="inline-start" />
                    Resume
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => onAction('pause', selected)}>
                    <Pause aria-hidden data-icon="inline-start" />
                    Pause
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => onAction('delete', selected)}>
                  <Trash2 aria-hidden data-icon="inline-start" />
                  Delete
                </Button>
              </>
            ) : null}
          </div>
        ) : (
          <span>
            {visible.length} of {rows.length} {rows.length === 1 ? 'project' : 'projects'}
          </span>
        )}
        {loading ? null : (
          <dl aria-label="Totals" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {totals.map((total) => (
              <div key={total.label} className="flex gap-1.5 whitespace-nowrap">
                <dt>{total.label}</dt>
                <dd className="font-medium text-foreground">{total.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div aria-live="polite" className="sr-only">
        {selected.length ? `${selected.length} selected` : ''}
      </div>
    </div>
  );
}

export {
  DataTable,
  sampleProjects,
  type DataTableAction,
  type DataTableProps,
  type Project,
  type ProjectPlan,
  type ProjectPlatform,
  type ProjectStatus,
  type Sort as DataTableSort,
};
