'use client';

import { Download, Ellipsis, KanbanSquare, Link2, ListFilter, Plus, Rows3, Search, Upload } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { Input } from '@/registry/kosmos/ui/input';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

// Sample data: replace it with your page's views and filters.
type PageTab = { value: string; label: string; count?: number };
type FilterOption = { value: string; label: string };
type PageView = 'table' | 'board';
/** What the More actions menu offers. */
type PageHeaderAction = 'import' | 'export' | 'copy-link';

const sampleTabs: PageTab[] = [
  { value: 'all', label: 'All accounts', count: 128 },
  { value: 'active', label: 'Active', count: 96 },
  { value: 'at-risk', label: 'At risk', count: 12 },
  { value: 'churned', label: 'Churned', count: 20 },
];

const sampleFilters: FilterOption[] = [
  { value: 'maya', label: 'Owned by Maya Chen' },
  { value: 'jonas', label: 'Owned by Jonas Weber' },
  { value: 'priya', label: 'Owned by Priya Raman' },
  { value: 'enterprise', label: 'Enterprise plan' },
];

type MenuProps = Omit<React.ComponentProps<typeof DropdownMenu>, 'children'>;

function useControlled<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const current = value === undefined ? uncontrolled : value;
  const setValue = React.useCallback(
    (next: T) => {
      if (value === undefined) setUncontrolled(next);
      onChange?.(next);
    },
    [value, onChange],
  );
  return [current, setValue] as const;
}

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

type PageHeaderProps = Omit<React.ComponentProps<'div'>, 'title' | 'children'> & {
  title?: string;
  /** The heading level of the title. Keep `1` when the header tops the page; lower it when the page already has an `<h1>`. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Goes before the title, usually a `SidebarTrigger`. */
  leading?: React.ReactNode;
  /** The views the tabs switch between, each with an optional count. */
  tabs?: PageTab[];
  /** The selected tab. Use with `onTabChange`, or leave it out and pass `defaultTab`. */
  tab?: string;
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
  /** The search text. Use with `onQueryChange`, or leave it out and pass `defaultQuery`. */
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** What the Filter menu offers. */
  filterOptions?: FilterOption[];
  /** The values of the filters that are on. Use with `onFiltersChange`, or leave it out and pass `defaultFilters`. */
  filters?: string[];
  defaultFilters?: string[];
  onFiltersChange?: (filters: string[]) => void;
  /** The selected layout. Use with `onViewChange`, or leave it out and pass `defaultView`. */
  view?: PageView;
  defaultView?: PageView;
  onViewChange?: (view: PageView) => void;
  /** The label of the primary action. */
  newLabel?: string;
  /** Runs the primary action, usually opening a dialog. */
  onNew?: () => void;
  /** Runs an action from the More actions menu. The menu shows only when this is passed. */
  onAction?: (action: PageHeaderAction) => void;
  /** Props for the Filter menu, such as `open` and `onOpenChange`. */
  filterMenu?: MenuProps;
  /** Props for the More actions menu, such as `open` and `onOpenChange`. */
  moreMenu?: MenuProps;
  /** The page body. It renders as the panel of the selected tab. */
  children?: React.ReactNode;
};

/**
 * The top of a list page: a title with a primary action and a More actions menu, tabs for saved views
 * with counts, and a toolbar with search, filters and a table or board switch. Pass the page body as
 * `children`: it becomes the panel of the selected tab. Lays itself out by its own width, not the
 * screen's, so it fits next to a sidebar or inside a panel.
 */
function PageHeader({
  title = 'Accounts',
  headingLevel = 1,
  leading,
  tabs = sampleTabs,
  tab: tabProp,
  defaultTab,
  onTabChange,
  query: queryProp,
  defaultQuery = '',
  onQueryChange,
  filterOptions = sampleFilters,
  filters: filtersProp,
  defaultFilters = [],
  onFiltersChange,
  view: viewProp,
  defaultView = 'table',
  onViewChange,
  newLabel = 'New account',
  onNew,
  onAction,
  filterMenu,
  moreMenu,
  className,
  children,
  ...props
}: PageHeaderProps) {
  const [tab, setTab] = useControlled(tabProp, defaultTab ?? tabs[0]?.value ?? '', onTabChange);
  const [query, setQuery] = useControlled(queryProp, defaultQuery, onQueryChange);
  const [filters, setFilters] = useControlled<string[]>(filtersProp, defaultFilters, onFiltersChange);
  const [view, setView] = useControlled<PageView>(viewProp, defaultView, onViewChange);
  const searchId = React.useId();
  const Heading = `h${headingLevel}` as const;

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(String(value))}
      className={cn('@container min-w-0 gap-0', className)}
      {...props}
    >
      <div data-slot="page-header" className="flex flex-col">
        <div className="flex h-14 items-center gap-2 px-4">
          {leading}
          <Heading className="min-w-0 flex-1 truncate text-heading">{title}</Heading>
          {onAction ? (
            <DropdownMenu {...moreMenu}>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="More actions" />}>
                <Ellipsis aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAction('import')}>
                  <Upload />
                  Import from CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('export')}>
                  <Download />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAction('copy-link')}>
                  <Link2 />
                  Copy link to view
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <Button variant="primary" onClick={onNew} aria-label={newLabel} className="@max-md:w-7.5 @max-md:px-0">
            <Plus aria-hidden data-icon="inline-start" />
            <span className="@max-md:hidden">{newLabel}</span>
          </Button>
        </div>

        <div className="flex flex-col @3xl:flex-row @3xl:items-end @3xl:gap-4 @3xl:border-b @3xl:border-border @3xl:pe-4">
          <TabsList aria-label="Views" className="min-w-0 px-3 @3xl:flex-1 @3xl:data-[orientation=horizontal]:border-b-0">
            {tabs.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
                {item.count !== undefined ? (
                  <span className="text-caption font-normal text-muted-foreground tabular-nums">
                    {compact.format(item.count)}
                  </span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>

          <div
            role="group"
            aria-label={`Search and filter ${title.toLowerCase()}`}
            className="flex min-w-0 items-center gap-2 border-b border-border px-4 py-2 @3xl:h-9 @3xl:border-b-0 @3xl:px-0 @3xl:py-0 @3xl:pb-1"
          >
            <div className="relative min-w-0 flex-1 @3xl:w-52 @3xl:flex-none">
              <Search
                aria-hidden
                className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <label htmlFor={searchId} className="sr-only">
                Search {title.toLowerCase()}
              </label>
              <Input
                id={searchId}
                type="search"
                placeholder="Search…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="ps-8"
              />
            </div>

            <DropdownMenu {...filterMenu}>
              <DropdownMenuTrigger
                render={<Button variant="secondary" />}
                aria-label={filters.length ? `Filter, ${filters.length} on` : 'Filter'}
              >
                <ListFilter aria-hidden data-icon="inline-start" />
                <span className="@max-md:hidden">Filter</span>
                {filters.length ? (
                  <span aria-hidden className="text-muted-foreground tabular-nums">
                    {filters.length}
                  </span>
                ) : null}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="sm:min-w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  {filterOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={filters.includes(option.value)}
                      onCheckedChange={(checked) =>
                        setFilters(
                          checked ? [...filters, option.value] : filters.filter((value) => value !== option.value),
                        )
                      }
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                {filters.length ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilters([])}>Clear filters</DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            <SegmentedControl
              aria-label="Layout"
              value={view}
              onValueChange={(value) => setView(value as PageView)}
            >
              <SegmentedControlItem value="table" aria-label="Table">
                <Rows3 aria-hidden />
              </SegmentedControlItem>
              <SegmentedControlItem value="board" aria-label="Board">
                <KanbanSquare aria-hidden />
              </SegmentedControlItem>
            </SegmentedControl>
          </div>
        </div>
      </div>

      {children !== undefined ? (
        <TabsContent value={tab} className="flex min-h-0 flex-col">
          {children}
        </TabsContent>
      ) : null}
    </Tabs>
  );
}

export { PageHeader, type PageHeaderAction, type PageHeaderProps, type PageTab, type PageView, type FilterOption };
