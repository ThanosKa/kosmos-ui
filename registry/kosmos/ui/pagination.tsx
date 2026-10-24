'use client';

import { ArrowDown, ChevronLeft, ChevronRight, Ellipsis, LoaderCircle } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { clampPage, pageCount as countPages, pageForPageSize, pageRows, paginationItemsByWidth } from '@/registry/kosmos/lib/paging';
import { Button } from '@/registry/kosmos/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';

// Fixed locale, so the server and the browser render the same text.
const count = new Intl.NumberFormat('en-US');

type PaginationContextValue = {
  page: number;
  pageCount: number;
  total?: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  getPageHref?: (page: number) => string;
};

const PaginationContext = React.createContext<PaginationContextValue | null>(null);

function usePagination(part: string) {
  const context = React.useContext(PaginationContext);
  if (!context) throw new Error(`${part} must be placed inside Pagination.`);
  return context;
}

type PaginationProps = Omit<React.ComponentProps<'nav'>, 'onChange'> & {
  /** The current page, from 1. Pair it with `onPageChange`, or set `defaultPage` instead. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** How many pages there are. Leave it out and pass `total` to count them from the rows. */
  pageCount?: number;
  /** How many rows the whole list holds. Counts the pages and lets `PaginationStatus` show the rows in view. */
  total?: number;
  /** Rows per page, used with `total`. Pair it with `onPageSizeChange`, or set `defaultPageSize` instead. */
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  /** Renders every page as a link to this URL, for pages the server renders. Without it, pages are buttons. */
  getPageHref?: (page: number) => string;
};

/**
 * Moves through a long list a page at a time. It holds the page (and, with `total`, the page size)
 * and lays out the parts inside it in a row: `PaginationPrevious`, `PaginationPages`, `PaginationNext`,
 * `PaginationStatus` and `PaginationPageSize`, in any order.
 */
function Pagination({
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageCount: pageCountProp,
  total,
  pageSize: pageSizeProp,
  defaultPageSize = 10,
  onPageSizeChange,
  getPageHref,
  className,
  'aria-label': ariaLabel = 'Pagination',
  ...props
}: PaginationProps) {
  const [pageState, setPageState] = React.useState(defaultPage);
  const [pageSizeState, setPageSizeState] = React.useState(defaultPageSize);
  const pageSize = pageSizeProp ?? pageSizeState;
  const pageCount = pageCountProp === undefined ? countPages(total ?? 0, pageSize) : Math.max(1, pageCountProp);
  const page = clampPage(pageProp ?? pageState, pageCount);

  const context = React.useMemo<PaginationContextValue>(() => {
    const setPage = (next: number) => {
      const clamped = clampPage(next, pageCount);
      if (pageProp === undefined) setPageState(clamped);
      onPageChange?.(clamped);
    };
    return {
      page,
      pageCount,
      total,
      pageSize,
      setPage,
      setPageSize: (next) => {
        if (pageSizeProp === undefined) setPageSizeState(next);
        onPageSizeChange?.(next);
        const nextPage = pageForPageSize(page, pageSize, next);
        if (pageProp === undefined) setPageState(nextPage);
        onPageChange?.(nextPage);
      },
      getPageHref,
    };
  }, [page, pageCount, total, pageSize, pageProp, pageSizeProp, onPageChange, onPageSizeChange, getPageHref]);

  return (
    <PaginationContext.Provider value={context}>
      <nav
        data-slot="pagination"
        aria-label={ariaLabel}
        className={cn('flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2', className)}
        {...props}
      />
    </PaginationContext.Provider>
  );
}

/** Data attributes pass through to the button or link underneath. */
type DataAttributes = { [key: `data-${string}`]: string | undefined };

type PaginationStepProps = DataAttributes & {
  direction: 'previous' | 'next';
  children?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
};

function PaginationStep({ direction, children, className, 'aria-label': ariaLabel, ...data }: PaginationStepProps) {
  const { page, pageCount, setPage, getPageHref } = usePagination(direction === 'previous' ? 'PaginationPrevious' : 'PaginationNext');
  const target = direction === 'previous' ? page - 1 : page + 1;
  const atEnd = target < 1 || target > pageCount;
  const content =
    direction === 'previous' ? (
      <>
        <ChevronLeft aria-hidden className="rtl:rotate-180" />
        {children ? <span className="max-sm:sr-only">{children}</span> : null}
      </>
    ) : (
      <>
        {children ? <span className="max-sm:sr-only">{children}</span> : null}
        <ChevronRight aria-hidden className="rtl:rotate-180" />
      </>
    );
  const shared = {
    size: 'icon' as const,
    'data-slot': `pagination-${direction}`,
    'aria-label': ariaLabel ?? (children ? undefined : direction === 'previous' ? 'Previous page' : 'Next page'),
    // Below 640px a labelled step keeps only its icon, so the row fits a phone; the label stays its name.
    className: cn(children && (direction === 'previous' ? 'sm:w-auto sm:ps-2 sm:pe-2.5' : 'sm:w-auto sm:ps-2.5 sm:pe-2'), className),
    children: content,
    ...data,
  };
  if (getPageHref && !atEnd)
    return (
      <Button
        variant="secondary"
        {...shared}
        href={getPageHref(target)}
        rel={direction === 'previous' ? 'prev' : 'next'}
        onClick={() => setPage(target)}
      />
    );
  // At the ends the step stays in the tab order, so focus never drops to the page when the last click reaches the end.
  return <Button variant="secondary" {...shared} disabled={atEnd} focusableWhenDisabled onClick={() => setPage(target)} />;
}

type PaginationStepPartProps = Omit<PaginationStepProps, 'direction'>;

/** Goes back one page. Alone it is an icon button named "Previous page"; give it children to show a label from 640px. */
function PaginationPrevious(props: PaginationStepPartProps) {
  return <PaginationStep direction="previous" {...props} />;
}

/** Goes forward one page. Alone it is an icon button named "Next page"; give it children to show a label from 640px. */
function PaginationNext(props: PaginationStepPartProps) {
  return <PaginationStep direction="next" {...props} />;
}

type PaginationLinkProps = DataAttributes & {
  page: number;
  className?: string;
  /** The accessible name. Defaults to "Page 3". */
  'aria-label'?: string;
};

/** One page. The current page reads as the current item in navigation; the others step back to muted. */
function PaginationLink({ page: target, className, 'aria-label': ariaLabel, ...data }: PaginationLinkProps) {
  const { page, setPage, getPageHref } = usePagination('PaginationLink');
  const current = target === page;
  const shared = {
    size: 'icon' as const,
    'data-slot': 'pagination-link',
    'data-active': current ? '' : undefined,
    'aria-current': current ? ('page' as const) : undefined,
    'aria-label': ariaLabel ?? `Page ${target}`,
    className: cn(
      'w-auto min-w-7.5 px-1 text-muted-foreground tabular-nums transition-[background-color,color]',
      'hover:not-data-disabled:text-foreground',
      'data-active:bg-accent data-active:text-active-foreground hover:data-active:not-data-disabled:text-active-foreground',
      className,
    ),
    children: count.format(target),
    ...data,
  };
  if (getPageHref) return <Button variant="item" {...shared} href={getPageHref(target)} onClick={() => setPage(target)} />;
  return <Button variant="item" {...shared} onClick={() => setPage(target)} />;
}

/** Stands for the pages hidden between two shown ones. */
function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden
      className={cn('flex size-7.5 items-center justify-center text-muted-foreground', className)}
      {...props}
    >
      <Ellipsis className="size-3.5" />
    </span>
  );
}

type PaginationPagesProps = Omit<React.ComponentProps<'ul'>, 'children'> & {
  /** Pages shown either side of the current one. Below 640px the row drops them, so it fits a phone. */
  siblings?: number;
  /** The accessible name of each page. Defaults to "Page 3". */
  pageLabel?: (page: number) => string;
};

/**
 * The numbered pages: the first and last, the current one with its neighbors, and a gap for each run of
 * hidden pages. The row keeps the same length on every page, so it never shifts under the pointer.
 */
function PaginationPages({ siblings = 1, pageLabel, className, ...props }: PaginationPagesProps) {
  const { page, pageCount } = usePagination('PaginationPages');
  return (
    <ul data-slot="pagination-pages" className={cn('flex items-center gap-1', className)} {...props}>
      {paginationItemsByWidth(page, pageCount, siblings).map(({ item, wide, narrow }) => {
        const shows = cn(!wide && 'sm:hidden', !narrow && 'max-sm:hidden');
        return typeof item === 'number' ? (
          <li key={item} className={shows}>
            <PaginationLink page={item} aria-label={pageLabel?.(item)} />
          </li>
        ) : (
          <li key={item} aria-hidden className={shows}>
            <PaginationEllipsis />
          </li>
        );
      })}
    </ul>
  );
}

type PaginationStatusProps = Omit<React.ComponentProps<'p'>, 'children'> & {
  /** Your own text, for another language: gets the page, the page count and, with `total`, the rows in view. */
  children?: (status: { page: number; pageCount: number; from: number; to: number; total?: number }) => React.ReactNode;
};

/**
 * Where the list stands: "Page 3 of 12", or "21–30 of 2,450" when Pagination has `total`.
 * Screen readers hear it change, since focus stays on the button that turned the page.
 */
function PaginationStatus({ children, className, ...props }: PaginationStatusProps) {
  const { page, pageCount, total, pageSize } = usePagination('PaginationStatus');
  const { from, to } = pageRows(page, pageSize, total ?? 0);
  const value = (n: number) => <span className="font-medium text-foreground">{count.format(n)}</span>;
  let text: React.ReactNode;
  if (children) text = children({ page, pageCount, from, to, total });
  else if (total === undefined)
    text = (
      <>
        Page {value(page)} of {value(pageCount)}
      </>
    );
  else if (total === 0) text = 'No rows';
  else
    text = (
      <>
        {value(from)}–{value(to)} of {value(total)}
      </>
    );
  return (
    <p
      data-slot="pagination-status"
      aria-live="polite"
      aria-atomic
      className={cn('text-small whitespace-nowrap text-muted-foreground tabular-nums', className)}
      {...props}
    >
      {text}
    </p>
  );
}

type PaginationPageSizeProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The page sizes to offer. */
  options?: number[];
  label?: string;
};

/**
 * Picks how many rows a page shows. Needs `total` on Pagination. A new size keeps the first row
 * of the current page in view.
 */
function PaginationPageSize({ options = [10, 25, 50, 100], label = 'Rows per page', className, ...props }: PaginationPageSizeProps) {
  const { pageSize, setPageSize } = usePagination('PaginationPageSize');
  const labelId = React.useId();
  const items = options.map((size) => ({ value: size, label: count.format(size) }));
  return (
    <div data-slot="pagination-page-size" className={cn('flex items-center gap-2', className)} {...props}>
      <span id={labelId} className="text-small whitespace-nowrap text-muted-foreground">
        {label}
      </span>
      <Select items={items} value={pageSize} onValueChange={(next) => next !== null && setPageSize(next)}>
        <SelectTrigger aria-labelledby={labelId} className="h-7.5 tabular-nums">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value} className="tabular-nums">
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type PaginationLoadMoreProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** Rows already in the list. */
  shown: number;
  /** Rows the whole list holds. */
  total: number;
  onLoadMore: () => void;
  /** While the next rows load: the button keeps its place and its focus, and ignores clicks. */
  loading?: boolean;
};

/**
 * Loads the next rows under a list, and says how many are left. Once every row shows, it says so
 * instead, and takes the focus the button had.
 */
function PaginationLoadMore({ shown, total, onLoadMore, loading = false, className, ...props }: PaginationLoadMoreProps) {
  const remaining = Math.max(0, total - shown);
  const empty = total <= 0;
  const buttonFocused = React.useRef(false);
  const doneRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    if (remaining === 0 && buttonFocused.current) {
      buttonFocused.current = false;
      doneRef.current?.focus();
    }
  }, [remaining]);

  return (
    <div data-slot="pagination-load-more" className={cn('flex flex-col items-center gap-2', className)} {...props}>
      {remaining > 0 ? (
        <Button
          variant="secondary"
          disabled={loading}
          focusableWhenDisabled
          onClick={onLoadMore}
          onFocus={() => (buttonFocused.current = true)}
          onBlur={() => (buttonFocused.current = false)}
          className="data-disabled:opacity-100"
        >
          {loading ? (
            <LoaderCircle aria-hidden data-icon="inline-start" className="motion-safe:animate-spin" />
          ) : (
            <ArrowDown aria-hidden data-icon="inline-start" />
          )}
          Load more
          <span className="font-normal text-muted-foreground tabular-nums">{count.format(remaining)} left</span>
        </Button>
      ) : empty ? null : (
        <p
          ref={doneRef}
          tabIndex={-1}
          className="rounded-sm text-small text-muted-foreground tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          All {count.format(total)} shown
        </p>
      )}
      <p aria-live="polite" className="sr-only">
        {loading ? 'Loading more' : empty ? '' : `Showing ${count.format(shown)} of ${count.format(total)}`}
      </p>
    </div>
  );
}

export {
  Pagination,
  PaginationEllipsis,
  PaginationLink,
  PaginationLoadMore,
  PaginationNext,
  PaginationPages,
  PaginationPageSize,
  PaginationPrevious,
  PaginationStatus,
  type PaginationLinkProps,
  type PaginationLoadMoreProps,
  type PaginationPagesProps,
  type PaginationPageSizeProps,
  type PaginationProps,
  type PaginationStatusProps,
};
