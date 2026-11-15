'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrHas,
  filterFn_includesString,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type Column,
  type Row,
  type RowData,
  type Table as TableInstance,
  type TableOptions,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, CirclePlus, Columns3, EyeOff, Search, X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
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
import { Input } from '@/registry/kosmos/ui/input';
import {
  Pagination,
  PaginationNext,
  PaginationPageSize,
  PaginationPages,
  PaginationPrevious,
  PaginationStatus,
} from '@/registry/kosmos/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/registry/kosmos/ui/popover';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

/** What a column tells the parts beyond TanStack's own options, through `meta` on its definition. */
type DataTableColumnMeta = {
  /** The column's name in the Columns menu and its header, when the header is not plain text. Defaults to its id. */
  label?: string;
  /** Lines numbers up at the end of the cell. */
  align?: 'end';
  /** Classes for the header and every cell, such as the container query a column shows from. */
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  /** The two sort orders in words that fit the values, ascending then descending: `['Low to high', 'High to low']`. */
  sortLabels?: [string, string];
  /** What a cell shows while the table loads. Defaults to a short bar; `null` leaves it empty. */
  skeleton?: React.ReactNode;
};

/**
 * The TanStack Table features every data table here uses: sorting, column and global filters, facet counts, pages,
 * row selection and column visibility. Register a sort or filter function by its name in a column, or pass the
 * function itself.
 */
const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime, text: sortFn_text },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { arrHas: filterFn_arrHas, includesString: filterFn_includesString },
  columnFacetingFeature,
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  columnVisibilityFeature,
  columnMeta: {} as DataTableColumnMeta,
});

type DataTableFeatures = typeof dataTableFeatures;
type DataTableInstance<TData extends RowData> = TableInstance<DataTableFeatures, TData>;
type DataTableOptions<TData extends RowData> = Omit<TableOptions<DataTableFeatures, TData>, 'features'>;

/** A column helper typed for `useDataTable`, so `meta` and the registered sort and filter names check. */
const createDataTableColumnHelper = <TData extends RowData>() => createColumnHelper<DataTableFeatures, TData>();

/**
 * TanStack Table's `useTable` with the data table features, ten rows a page, and Shift-click on a row's checkbox
 * selecting the rows between it and the last one ticked. Every option and state slice of `useTable` passes through.
 */
function useDataTable<TData extends RowData>({ initialState, ...options }: DataTableOptions<TData>) {
  return useTable({
    features: dataTableFeatures,
    globalFilterFn: 'includesString',
    isRowRangeSelectionEvent: (event) => (event as { shiftKey?: boolean } | undefined)?.shiftKey === true,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 }, ...initialState },
    ...options,
  });
}

// Fixed locale, so the server and the browser render the same text.
const count = new Intl.NumberFormat('en-US');

/** "1 project", "12 projects". `plural` covers nouns that do not take an s. */
const countOf = (n: number, noun: string, plural = `${noun}s`) => `${count.format(n)} ${n === 1 ? noun : plural}`;

const metaOf = <TData extends RowData, TValue>(column: Column<DataTableFeatures, TData, TValue>) => column.columnDef.meta ?? {};
const labelOf = <TData extends RowData, TValue>(column: Column<DataTableFeatures, TData, TValue>) =>
  metaOf(column).label ?? column.id;

/** The frame the parts sit in. It sizes them by its own width, so columns and buttons fit the space it gets. */
function DataTable({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="data-table" className={cn('@container flex min-w-0 flex-col', className)} {...props} />;
}

/** The row above the table that holds the search, the filters and Reset. */
function DataTableToolbar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="group"
      data-slot="data-table-toolbar"
      className={cn('flex flex-wrap items-center gap-2 border-b border-border px-4 py-2', className)}
      {...props}
    />
  );
}

type DataTableSearchProps<TData extends RowData> = Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> & {
  table: DataTableInstance<TData>;
  /** The search field's name for screen readers, such as "Search projects". */
  label: string;
};

/** Searches the rows with the table's global filter. Full width on a phone, 224px from 512px. */
function DataTableSearch<TData extends RowData>({
  table,
  label,
  placeholder = 'Search…',
  className,
  ...props
}: DataTableSearchProps<TData>) {
  const id = React.useId();
  return (
    <div data-slot="data-table-search" className={cn('relative w-full @lg:w-56', className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Input
        id={id}
        type="search"
        placeholder={placeholder}
        value={String(table.atoms.globalFilter.get() ?? '')}
        onChange={(event) => table.setGlobalFilter(event.target.value)}
        className="h-7.5 ps-8"
        {...props}
      />
    </div>
  );
}

type DataTableFacetOption = {
  value: string;
  /** The option's name: what the search matches and the filter button lists once it is on. */
  label: string;
  /** What the option shows in the list, such as a Badge or an icon and its label. Defaults to the label. */
  render?: React.ReactNode;
};

type DataTableFacetFilterProps<TData extends RowData, TValue> = {
  column: Column<DataTableFeatures, TData, TValue>;
  /** The values in the order the list shows them. Values no row has keep their place with a count of 0. */
  options: DataTableFacetOption[];
  /** The button's name, such as "Plan". Defaults to the column's label. */
  title?: string;
  /** The values in words for the search and its empty text: "plans". */
  noun?: string;
  /** The rows in words for the counts screen readers hear: "project". */
  rowNoun?: string;
};

/**
 * Filters one column to the values that are on: a button that names the column and the values on, and a popover
 * to search the values, tick them, see how many rows each would show, and clear them. Values of one filter widen
 * the match among themselves, and filters narrow each other. Give the column `filterFn: 'arrHas'`.
 */
function DataTableFacetFilter<TData extends RowData, TValue>({
  column,
  options,
  title = labelOf(column),
  noun = 'values',
  rowNoun = 'row',
}: DataTableFacetFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);
  const selected = (column.getFilterValue() as string[] | undefined) ?? [];
  const counts = column.getFacetedUniqueValues();
  const labels = new Map(options.map((option) => [option.value, option.label]));
  const labelFor = (value: string) => labels.get(value) ?? value;
  const summary = selected.length > 2 ? `${selected.length} on` : selected.map(labelFor).join(', ');
  const setSelected = (values: string[]) => column.setFilterValue(values.length ? values : undefined);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="secondary" className="max-w-full data-popup-open:bg-muted" />}>
        <CirclePlus aria-hidden data-icon="inline-start" />
        {title}
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
          items={options.map((option) => option.value)}
          itemToStringLabel={labelFor}
          multiple
          inline
          open={open}
          autoHighlight
          value={selected}
          onValueChange={(values) => setSelected(values)}
        >
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <ComboboxPrimitive.Input
              aria-label={`Search ${noun}`}
              placeholder={title}
              render={<Input className="h-7.5 ps-8" />}
            />
          </div>
          <ComboboxPrimitive.Empty className="text-small text-muted-foreground empty:hidden">
            No {noun} match
          </ComboboxPrimitive.Empty>
          <ComboboxPrimitive.List aria-label={title} className="-mx-2 flex flex-col data-empty:hidden">
            {(value: string) => {
              const option = options.find((item) => item.value === value);
              const rows = counts.get(value) ?? 0;
              return (
                <ComboboxPrimitive.Item
                  key={value}
                  value={value}
                  className={cn(
                    'group/option flex min-h-7.5 cursor-default items-center gap-2 rounded-[calc(var(--radius-lg)-4px)] px-2 py-1 outline-none select-none [-webkit-tap-highlight-color:transparent]',
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
                  <span className="flex min-w-0 flex-1">{option?.render ?? option?.label ?? value}</span>
                  <span className="text-caption text-muted-foreground tabular-nums">
                    <span aria-hidden>{count.format(rows)}</span>
                    <span className="sr-only">{countOf(rows, rowNoun)}</span>
                  </span>
                </ComboboxPrimitive.Item>
              );
            }}
          </ComboboxPrimitive.List>
        </ComboboxPrimitive.Root>
        {selected.length ? (
          <Button variant="secondary" size="sm" onClick={() => setSelected([])} className="self-start">
            Clear {title.toLowerCase()}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

/** Clears the search and every column filter. It shows only while one of them is on. */
function DataTableReset<TData extends RowData>({
  table,
  children = 'Reset',
}: {
  table: DataTableInstance<TData>;
  children?: React.ReactNode;
}) {
  if (!table.atoms.globalFilter.get() && !table.atoms.columnFilters.get().length) return null;
  return (
    <Button
      variant="ghost"
      onClick={() => {
        table.resetGlobalFilter(true);
        table.resetColumnFilters(true);
      }}
    >
      {children}
      <X aria-hidden data-icon="inline-end" />
    </Button>
  );
}

/** Hides a column and clears the sort it held, since no header would show that order any more. */
function hideColumn<TData extends RowData, TValue>(column: Column<DataTableFeatures, TData, TValue>) {
  column.toggleVisibility(false);
  if (column.getIsSorted()) column.clearSorting();
}

/**
 * The header of a column: its name, and a menu with the two sort orders and Hide column. A column that neither
 * sorts nor hides shows only its name. A hidden column's menu leaves with it, so focus moves to the Columns menu,
 * where the column comes back.
 */
function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title = labelOf(column),
  className,
}: {
  column: Column<DataTableFeatures, TData, TValue>;
  title?: string;
  className?: string;
}) {
  const trigger = React.useRef<HTMLButtonElement>(null);
  const { align, sortLabels = ['Ascending', 'Descending'] } = metaOf(column);
  const end = align === 'end';
  if (!column.getCanSort() && !column.getCanHide()) return <span className={className}>{title}</span>;

  const sorted = column.getIsSorted();
  const Icon = !sorted ? ArrowUpDown : sorted === 'asc' ? ArrowUp : ArrowDown;
  const hide = () => {
    const toggle = trigger.current
      ?.closest('[data-slot="data-table"]')
      ?.querySelector<HTMLElement>('[data-column-toggle]');
    hideColumn(column);
    requestAnimationFrame(() => toggle?.focus());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        ref={trigger}
        render={
          <Button
            variant="item"
            size="sm"
            className={cn(
              'h-6 gap-1 px-1.5 text-caption font-normal text-muted-foreground hover:text-foreground data-popup-open:bg-accent data-popup-open:text-foreground',
              end ? '-me-1.5 flex-row-reverse' : '-ms-1.5',
              sorted && 'text-foreground',
              className,
            )}
          />
        }
      >
        {title}
        <Icon aria-hidden className={cn('size-3', !sorted && 'opacity-60')} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={end ? 'end' : 'start'}>
        {column.getCanSort() ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Sort</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={sorted ? (sorted === 'asc' ? 'ascending' : 'descending') : ''}
              onValueChange={(direction) => column.toggleSorting(direction === 'descending')}
            >
              <DropdownMenuRadioItem value="ascending" closeOnClick>
                <ArrowUp aria-hidden />
                {sortLabels[0]}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="descending" closeOnClick>
                <ArrowDown aria-hidden />
                {sortLabels[1]}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        ) : null}
        {column.getCanHide() ? (
          <>
            {column.getCanSort() ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem onClick={hide}>
              <EyeOff aria-hidden />
              Hide column
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The Columns menu: a tick for every column that can hide, and Show all once one is hidden. A column the frame is
 * too narrow for says so, since ticking it would not show it.
 */
function DataTableColumnToggle<TData extends RowData>({ table }: { table: DataTableInstance<TData> }) {
  const trigger = React.useRef<HTMLButtonElement>(null);
  const [crowded, setCrowded] = React.useState<string[]>([]);
  const columns = table.getAllLeafColumns().filter((column) => column.getCanHide());
  const hidden = columns.filter((column) => !column.getIsVisible());
  const crowdedColumns = () =>
    [
      ...(trigger.current
        ?.closest('[data-slot="data-table"]')
        ?.querySelectorAll<HTMLElement>('th[data-column-id]') ?? []),
    ]
      .filter((head) => getComputedStyle(head).display === 'none')
      .map((head) => head.dataset.columnId ?? '');

  return (
    <DropdownMenu onOpenChange={(open) => open && setCrowded(crowdedColumns())}>
      <DropdownMenuTrigger
        ref={trigger}
        data-column-toggle=""
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
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => (checked ? column.toggleVisibility(true) : hideColumn(column))}
            >
              {labelOf(column)}
              {crowded.includes(column.id) ? (
                <span className="ms-auto ps-4 text-caption font-normal text-muted-foreground">Too narrow</span>
              ) : null}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {hidden.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => table.setColumnVisibility({})}>Show all</DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Ticks every row on the page. Half ticked while some are. */
function DataTableSelectAll<TData extends RowData>({
  table,
  label,
  disabled,
}: {
  table: DataTableInstance<TData>;
  /** Its name for screen readers: "Select all projects on this page". */
  label: string;
  disabled?: boolean;
}) {
  const all = table.getIsAllPageRowsSelected();
  return (
    <Checkbox
      aria-label={label}
      checked={all}
      indeterminate={table.getIsSomePageRowsSelected() && !all}
      disabled={disabled || table.getRowModel().rows.length === 0}
      onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
    />
  );
}

/** Ticks one row. Shift-click ticks or unticks every row between it and the last one clicked. */
function DataTableSelectRow<TData extends RowData>({
  row,
  label,
}: {
  row: Row<DataTableFeatures, TData>;
  /** Its name for screen readers: "Select Fernhill Books". */
  label: string;
}) {
  return (
    <Checkbox
      aria-label={label}
      checked={row.getIsSelected()}
      onCheckedChange={(checked, details) =>
        row.getToggleSelectedHandler()({ target: { checked }, shiftKey: (details.event as MouseEvent).shiftKey })
      }
    />
  );
}

type DataTableContentProps<TData extends RowData> = Omit<React.ComponentProps<typeof Table>, 'children'> & {
  table: DataTableInstance<TData>;
  /** Shows skeleton rows, up to six, in place of the rows. */
  loading?: boolean;
  /** What shows under the header when no row passes, such as an `EmptyState`. */
  empty?: React.ReactNode;
  /** Opens a row from a click anywhere on it but its buttons, links and checkboxes, which do their own thing. */
  onRowClick?: (row: Row<DataTableFeatures, TData>) => void;
};

/**
 * The table itself: the headers and the rows of the page, from the columns' definitions. A column's `meta` sets its
 * alignment, its classes and its skeleton. It scrolls sideways once the columns that stay are wider than the frame.
 */
function DataTableContent<TData extends RowData>({
  table,
  loading = false,
  empty,
  onRowClick,
  className,
  ...props
}: DataTableContentProps<TData>) {
  const rows = table.getRowModel().rows;
  const skeletonRows = Math.min(table.atoms.pagination.get().pageSize, 6);
  const cellClass = <TValue,>(column: Column<DataTableFeatures, TData, TValue>, part: 'header' | 'cell') => {
    const meta = metaOf(column);
    return cn(meta.align === 'end' && 'text-end', meta.className, part === 'header' ? meta.headerClassName : meta.cellClassName);
  };
  const openFromRow = (event: React.MouseEvent<HTMLTableRowElement>, row: Row<DataTableFeatures, TData>) => {
    if ((event.target as HTMLElement).closest('button, a, input, [role="checkbox"], [role="menuitem"]')) return;
    onRowClick?.(row);
  };

  return (
    <>
      <Table aria-busy={loading || undefined} className={cn('min-w-max', className)} {...props}>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan > 1 ? header.colSpan : undefined}
                    data-column-id={header.column.getCanHide() ? header.column.id : undefined}
                    aria-sort={sorted ? (sorted === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cellClass(header.column, 'header')}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: skeletonRows }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  {table.getVisibleLeafColumns().map((column) => (
                    <TableCell key={column.id} className={cellClass(column, 'cell')}>
                      {metaOf(column).skeleton === undefined ? (
                        <Skeleton className={cn('h-3.5 w-16', metaOf(column).align === 'end' && 'ms-auto')} />
                      ) : (
                        metaOf(column).skeleton
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  onClick={onRowClick ? (event) => openFromRow(event, row) : undefined}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cellClass(cell.column, 'cell')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {!loading && rows.length === 0 ? empty : null}
    </>
  );
}

/**
 * Stands in for the totals while rows are selected: Clear selection, the count, Select all once the whole page is
 * ticked, and the actions you pass for the selected rows.
 */
function DataTableBulkBar<TData extends RowData>({
  table,
  noun = 'row',
  plural,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  table: DataTableInstance<TData>;
  /** The rows in words: "project". */
  noun?: string;
  plural?: string;
  /** The actions for the selected rows, given them. */
  children?: (rows: TData[]) => React.ReactNode;
}) {
  const selected = table.getFilteredSelectedRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  if (!selected.length) return null;
  return (
    <div
      role="group"
      aria-label={`Selected ${plural ?? `${noun}s`}`}
      className={cn('-ms-1 flex min-w-0 flex-wrap items-center gap-1', className)}
      {...props}
    >
      <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={() => table.resetRowSelection(true)}>
        <X aria-hidden />
      </Button>
      <span className="me-1 whitespace-nowrap text-foreground">{count.format(selected.length)} selected</span>
      {table.getIsAllPageRowsSelected() && selected.length < total ? (
        <Button variant="ghost" size="sm" onClick={() => table.toggleAllRowsSelected(true)} className="me-1">
          Select all {count.format(total)}
        </Button>
      ) : null}
      {children?.(selected.map((row) => row.original))}
    </div>
  );
}

type DataTableFooterProps<TData extends RowData> = React.ComponentProps<'div'> & {
  table: DataTableInstance<TData>;
  /** Shows a skeleton line in place of the totals and hides the pages. */
  loading?: boolean;
  /** The rows in words, for the row count and what screen readers hear: "project". */
  noun?: string;
  plural?: string;
  /** Adds a rows-per-page select with these sizes, from 512px. */
  pageSizes?: number[];
  /** Adds the numbered pages between the previous and next buttons. */
  pages?: boolean;
};

/**
 * The row under the table: what you pass on the start side (totals, or the bulk bar), and the rows in view with
 * the page buttons on the end side. Screen readers hear how many rows are selected as it changes.
 */
function DataTableFooter<TData extends RowData>({
  table,
  loading = false,
  noun = 'row',
  plural = `${noun}s`,
  pageSizes,
  pages = false,
  className,
  children,
  ...props
}: DataTableFooterProps<TData>) {
  const { pageIndex, pageSize } = table.atoms.pagination.get();
  const total = table.getFilteredRowModel().rows.length;
  const selected = table.getFilteredSelectedRowModel().rows.length;
  const [announced, setAnnounced] = React.useState(false);
  if (selected && !announced) setAnnounced(true);

  return (
    <div
      data-slot="data-table-footer"
      className={cn(
        'flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-4 py-1.5 text-small text-muted-foreground tabular-nums',
        className,
      )}
      {...props}
    >
      {loading ? <Skeleton className="h-3.5 w-40" /> : children}
      {loading ? null : (
        <Pagination
          aria-label={`Pages of ${plural}`}
          page={pageIndex + 1}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={(size) => table.setPageSize(size)}
          className="ms-auto gap-x-3"
        >
          {pageSizes ? <PaginationPageSize options={pageSizes} className="@max-lg:hidden" /> : null}
          <PaginationStatus>
            {({ from, to }) =>
              total === 0
                ? `No ${plural}`
                : total <= pageSize
                  ? countOf(total, noun, plural)
                  : `${count.format(from)}–${count.format(to)} of ${countOf(total, noun, plural)}`
            }
          </PaginationStatus>
          <div className="flex items-center gap-1">
            <PaginationPrevious />
            {pages ? <PaginationPages /> : null}
            <PaginationNext />
          </div>
        </Pagination>
      )}
      <div aria-live="polite" className="sr-only">
        {selected ? `${countOf(selected, noun, plural)} selected` : announced ? `No ${plural} selected` : ''}
      </div>
    </div>
  );
}

export {
  createDataTableColumnHelper,
  DataTable,
  DataTableBulkBar,
  DataTableColumnHeader,
  DataTableColumnToggle,
  DataTableContent,
  DataTableFacetFilter,
  DataTableFooter,
  dataTableFeatures,
  DataTableReset,
  DataTableSearch,
  DataTableSelectAll,
  DataTableSelectRow,
  DataTableToolbar,
  useDataTable,
  type DataTableColumnMeta,
  type DataTableFacetOption,
  type DataTableFeatures,
  type DataTableInstance,
  type DataTableOptions,
};
