'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, Building2, Download, Ellipsis, ExternalLink, Link2, SearchX, Trash2, X } from 'lucide-react';
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
import { Meter, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

type AccountStatus = 'active' | 'trial' | 'at-risk' | 'churned';

type Account = {
  id: string;
  name: string;
  domain: string;
  status: AccountStatus;
  owner: { name: string; initials: string };
  /** Annual recurring revenue, in dollars. */
  arr: number;
  /** Health score from 0 to 100. */
  health: number;
  /** The day of the last activity, as an ISO date (`2026-10-09`). */
  lastActivity: string;
};

// Sample data: replace it with your rows.
const maya = { name: 'Maya Chen', initials: 'MC' };
const jonas = { name: 'Jonas Weber', initials: 'JW' };
const priya = { name: 'Priya Raman', initials: 'PR' };

const sampleAccounts: Account[] = [
  { id: 'northwind', name: 'Northwind Traders', domain: 'northwind.example', status: 'active', owner: maya, arr: 184000, health: 86, lastActivity: '2026-10-10' },
  { id: 'bluebird', name: 'Bluebird Labs', domain: 'bluebird.example', status: 'at-risk', owner: jonas, arr: 96500, health: 38, lastActivity: '2026-09-21' },
  { id: 'cedar', name: 'Cedar & Pine', domain: 'cedarpine.example', status: 'active', owner: priya, arr: 42000, health: 74, lastActivity: '2026-10-08' },
  { id: 'lumen', name: 'Lumen Health', domain: 'lumenhealth.example', status: 'trial', owner: maya, arr: 0, health: 55, lastActivity: '2026-10-11' },
  { id: 'orbit', name: 'Orbit Freight', domain: 'orbitfreight.example', status: 'active', owner: jonas, arr: 238000, health: 91, lastActivity: '2026-10-09' },
  { id: 'harbor', name: 'Harbor Savings Bank', domain: 'harborbank.example', status: 'churned', owner: priya, arr: 0, health: 12, lastActivity: '2026-08-30' },
  { id: 'quill', name: 'Quill Studio', domain: 'quill.example', status: 'at-risk', owner: maya, arr: 18400, health: 41, lastActivity: '2026-09-28' },
  { id: 'vela', name: 'Vela Robotics', domain: 'vela.example', status: 'active', owner: priya, arr: 127000, health: 68, lastActivity: '2026-10-06' },
];

const statusBadge: Record<AccountStatus, { label: string; variant: BadgeProps['variant'] }> = {
  active: { label: 'Active', variant: 'success' },
  trial: { label: 'Trial', variant: 'secondary' },
  'at-risk': { label: 'At risk', variant: 'warning' },
  churned: { label: 'Churned', variant: 'destructive' },
};

// Fixed locale and time zone, so the server and the browser render the same text.
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usdCompact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const formatDay = (iso: string) => day.format(new Date(`${iso}T00:00:00Z`));

type SortKey = 'name' | 'arr' | 'health' | 'lastActivity';
type Sort = { key: SortKey; direction: 'ascending' | 'descending' };

function compare(a: Account, b: Account, key: SortKey) {
  if (key === 'name') return a.name.localeCompare(b.name);
  if (key === 'lastActivity') return a.lastActivity.localeCompare(b.lastActivity);
  return a[key] - b[key];
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
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
        className={cn(
          'h-6 gap-1 px-1.5 text-caption font-medium text-muted-foreground hover:text-foreground',
          'motion-safe:not-disabled:not-data-disabled:active:scale-100',
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

const columnCount = 8;

type DataTableProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The rows. Defaults to sample accounts. */
  rows?: Account[];
  /** Shows skeleton rows while the data loads. */
  loading?: boolean;
  /** Keeps rows whose name, domain or owner contains this text. */
  query?: string;
  /** Keeps rows with this status; `all` keeps every row. Matches the values of the page header's tabs. */
  status?: 'all' | AccountStatus;
  /** Called when a row is opened, by its name or a click anywhere on it. */
  onOpen?: (row: Account) => void;
  /** Shown in the empty state when a search or status hides every row. */
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
 * A table of records: sortable columns, row selection with a bulk action bar, a status badge, an owner,
 * a health meter, a row actions menu, and loading and empty states. Scrolls sideways on narrow screens.
 */
function DataTable({
  rows = sampleAccounts,
  loading = false,
  query = '',
  status = 'all',
  onOpen,
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
        (!needle || [row.name, row.domain, row.owner.name].some((text) => text.toLowerCase().includes(needle))),
    );
    if (!sort) return filtered;
    const sign = sort.direction === 'ascending' ? 1 : -1;
    return [...filtered].sort((a, b) => compare(a, b, sort.key) * sign);
  }, [rows, query, status, sort]);

  const selected = visible.filter((row) => selection.includes(row.id));
  const allSelected = visible.length > 0 && selected.length === visible.length;
  const totalArr = visible.reduce((sum, row) => sum + row.arr, 0);
  const filtering = query.trim() !== '' || status !== 'all';

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

  const openFromRow = (event: React.MouseEvent<HTMLTableRowElement>, row: Account) => {
    // Clicks on the checkbox, the name or the actions menu do their own thing.
    if ((event.target as HTMLElement).closest('button, a, input, [role="menuitem"]')) return;
    onOpen?.(row);
  };

  return (
    <div data-slot="data-table" className={cn('flex min-w-0 flex-col', className)} {...props}>
      <Table aria-label="Accounts" aria-busy={loading || undefined} className="min-w-[52rem]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 ps-4 pe-0">
              <Checkbox
                aria-label="Select all accounts"
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
            <SortableHead label="Account" sortKey="name" sort={sort} onSort={onSort} />
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <SortableHead label="Health" sortKey="health" sort={sort} onSort={onSort} />
            <SortableHead label="ARR" sortKey="arr" sort={sort} onSort={onSort} align="end" />
            <SortableHead label="Last activity" sortKey="lastActivity" sort={sort} onSort={onSort} />
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
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="h-3.5 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ms-auto h-3.5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-12" />
                </TableCell>
                <TableCell className="pe-4" />
              </TableRow>
            ))
          ) : visible.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="h-auto whitespace-normal">
                <Empty className="py-10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">{filtering ? <SearchX /> : <Building2 />}</EmptyMedia>
                    <EmptyTitle render={<h2 />}>{!filtering ? 'No accounts yet' : query.trim() ? `No accounts match “${query.trim()}”` : 'No accounts match'}</EmptyTitle>
                    <EmptyDescription>
                      {filtering
                        ? 'Try another search, or clear the filters to see every account.'
                        : 'Accounts you add or import show up here.'}
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
              </TableCell>
            </TableRow>
          ) : (
            visible.map((row) => {
              const isSelected = selection.includes(row.id);
              const badge = statusBadge[row.status];
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
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpen(row)}
                            className="-mx-1 h-5 max-w-full justify-start rounded-sm px-1 text-body font-medium motion-safe:not-disabled:not-data-disabled:active:scale-100"
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
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </TableCell>
                  <TableCell className="max-w-48">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar size="sm" aria-hidden>
                        <AvatarFallback>{row.owner.initials}</AvatarFallback>
                      </Avatar>
                      <span title={row.owner.name} className="truncate">
                        {row.owner.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Meter
                      value={row.health}
                      tone="auto"
                      aria-label={`${row.name} health`}
                      className="w-32 grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-y-0"
                    >
                      <MeterSegments count={10} className="col-span-1 h-3" />
                      <MeterValue className="row-start-1 text-caption" />
                    </Meter>
                  </TableCell>
                  <TableCell className="text-end">
                    {row.arr ? (
                      usd.format(row.arr)
                    ) : (
                      <>
                        <span aria-hidden>–</span>
                        <span className="sr-only">None</span>
                      </>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <time dateTime={row.lastActivity}>{formatDay(row.lastActivity)}</time>
                  </TableCell>
                  <TableCell className="pe-4 text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${row.name}`}
                            className="text-muted-foreground motion-safe:not-disabled:not-data-disabled:active:scale-100"
                          />
                        }
                      >
                        <Ellipsis aria-hidden />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onOpen?.(row)}>
                          <ExternalLink />
                          Open account
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link2 />
                          Copy link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <Trash2 />
                          Delete account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex min-h-11 items-center justify-between gap-4 border-t border-border px-4 py-1.5 text-small text-muted-foreground tabular-nums">
        {loading ? (
          <Skeleton className="h-3.5 w-40" />
        ) : selected.length ? (
          <div role="group" aria-label="Selected accounts" className="-ms-1 flex min-w-0 items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={() => setSelection([])}>
              <X aria-hidden />
            </Button>
            <span className="me-2 whitespace-nowrap text-foreground">{selected.length} selected</span>
            <Button variant="secondary" size="sm">
              <Download aria-hidden data-icon="inline-start" />
              Export
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 aria-hidden data-icon="inline-start" />
              Delete
            </Button>
          </div>
        ) : (
          <span>
            {visible.length} of {rows.length} {rows.length === 1 ? 'account' : 'accounts'}
          </span>
        )}
        {loading ? null : (
          <span className="whitespace-nowrap">
            Total ARR <span className="font-medium text-foreground">{usdCompact.format(totalArr)}</span>
          </span>
        )}
      </div>

      <div aria-live="polite" className="sr-only">
        {selected.length ? `${selected.length} selected` : ''}
      </div>
    </div>
  );
}

export { DataTable, type DataTableProps, type Account, type AccountStatus, type Sort as DataTableSort };
