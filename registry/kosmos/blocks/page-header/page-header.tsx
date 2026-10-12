'use client';

import { Download, Ellipsis, Link2, ListFilter, Plus, Search, Upload, X } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

type PageTab = { value: string; label: string; count?: number };
/** One option of the Filter menu. Options that share a `group` sit under its name, in the menu and on the chip. */
type FilterOption = { value: string; label: string; group?: string };
/** What the More actions menu offers. */
type PageHeaderAction = 'import' | 'export' | 'copy-link';

// Sample data: replace it with your page's views and filters.
const sampleTabs: PageTab[] = [
  { value: 'all', label: 'All', count: 12 },
  { value: 'live', label: 'Live', count: 8 },
  { value: 'trial', label: 'Trial', count: 2 },
  { value: 'paused', label: 'Paused', count: 2 },
];

const sampleFilters: FilterOption[] = [
  { value: 'free', label: 'Free', group: 'Plan' },
  { value: 'pro', label: 'Pro', group: 'Plan' },
  { value: 'scale', label: 'Scale', group: 'Plan' },
  { value: 'web', label: 'Web', group: 'Platform' },
  { value: 'ios', label: 'iOS', group: 'Platform' },
  { value: 'android', label: 'Android', group: 'Platform' },
  { value: 'server', label: 'Server', group: 'Platform' },
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

/** Options in their order, gathered under each group's name. */
function groupOptions(options: FilterOption[]) {
  const groups: { name: string; options: FilterOption[] }[] = [];
  for (const option of options) {
    const name = option.group ?? 'Filter by';
    const group = groups.find((item) => item.name === name);
    if (group) group.options.push(option);
    else groups.push({ name, options: [option] });
  }
  return groups;
}

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

type PageHeaderProps = Omit<React.ComponentProps<'div'>, 'title' | 'children'> & {
  title?: string;
  /** One line under the title that says what the page lists. */
  description?: string;
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
 * The top of a list page: a title and a description with a primary action and a More actions menu,
 * saved views as tabs with counts, search, a grouped filter menu, and a chip for each filter that is on.
 * Pass the page body as `children`: it becomes the panel of the selected tab. Lays itself out by its own
 * width, not the screen's, so it fits next to a sidebar or inside a panel.
 */
function PageHeader({
  title = 'Projects',
  description = 'Every site and app that sends events to Parallax.',
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
  newLabel = 'New project',
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
  const searchId = React.useId();
  const Heading = `h${headingLevel}` as const;
  const noun = title.toLowerCase();
  const activeOptions = filters.flatMap((value) => filterOptions.filter((option) => option.value === value));
  const toggleFilter = (value: string, on: boolean) =>
    setFilters(on ? [...filters, value] : filters.filter((item) => item !== value));

  // A removed chip takes its focus with it, so focus moves to the chip that takes its place, or to Filter.
  const headerRef = React.useRef<HTMLDivElement>(null);
  const focusAfterRemove = React.useRef<string | null>(null);
  React.useEffect(() => {
    const target = focusAfterRemove.current;
    if (target === null) return;
    focusAfterRemove.current = null;
    const chip = target ? headerRef.current?.querySelector<HTMLElement>(`[data-filter-chip="${CSS.escape(target)}"]`) : null;
    (chip ?? headerRef.current?.querySelector<HTMLElement>('[data-filter-trigger]'))?.focus();
  }, [filters]);
  const removeFilter = (index: number) => {
    const next = activeOptions[index + 1] ?? activeOptions[index - 1];
    focusAfterRemove.current = next?.value ?? '';
    toggleFilter(activeOptions[index].value, false);
  };
  const clearFilters = () => {
    focusAfterRemove.current = '';
    setFilters([]);
  };

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(String(value))}
      className={cn('@container min-w-0 gap-0', className)}
      {...props}
    >
      <div ref={headerRef} data-slot="page-header" className="flex flex-col gap-3 border-b border-border px-4 py-3">
        <div className="flex min-h-7.5 items-center gap-2">
          {leading}
          <div className="flex min-w-0 flex-1 flex-col">
            <Heading className="text-title font-medium text-pretty break-words">{title}</Heading>
            {description ? <p className="text-small text-pretty text-muted-foreground">{description}</p> : null}
          </div>
          {onAction ? (
            <DropdownMenu {...moreMenu}>
              <DropdownMenuTrigger render={<Button variant="secondary" size="icon" aria-label="More actions" />}>
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

        <div className="flex flex-col gap-2 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:gap-4">
          <TabsList
            aria-label="Views"
            className={cn(
              'w-fit max-w-full gap-0.5 rounded-lg border border-transparent bg-muted p-0.5 shadow-inset',
              'data-[orientation=horizontal]:border-b-transparent',
              '*:data-[slot=tabs-indicator]:hidden',
            )}
          >
            {tabs.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className={cn(
                  'h-6.5 rounded-md px-2.5',
                  'transition-[color,background-color,box-shadow] data-active:bg-secondary data-active:shadow-control',
                  // The raised surface marks the selected view, so the underline and its reduced-motion twin stay hidden.
                  'after:hidden',
                )}
              >
                {item.label}
                {item.count !== undefined ? (
                  <span className="text-caption font-normal text-muted-foreground tabular-nums">
                    {compact.format(item.count)}
                  </span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>

          <div role="group" aria-label={`Search and filter ${noun}`} className="flex min-w-0 items-center gap-2">
            <div className="relative min-w-0 flex-1 @3xl:w-56 @3xl:flex-none">
              <Search
                aria-hidden
                className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <label htmlFor={searchId} className="sr-only">
                Search {noun}
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

            <DropdownMenu {...filterMenu}>
              <DropdownMenuTrigger
                data-filter-trigger=""
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
                {groupOptions(filterOptions).map((group, index) => (
                  <React.Fragment key={group.name}>
                    {index > 0 ? <DropdownMenuSeparator /> : null}
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>{group.name}</DropdownMenuLabel>
                      {group.options.map((option) => (
                        <DropdownMenuCheckboxItem
                          key={option.value}
                          checked={filters.includes(option.value)}
                          onCheckedChange={(checked) => toggleFilter(option.value, checked)}
                        >
                          {option.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuGroup>
                  </React.Fragment>
                ))}
                {filters.length ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilters([])}>Clear filters</DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {activeOptions.length ? (
          <div role="group" aria-label="Filters on" className="flex flex-wrap items-center gap-1.5">
            {activeOptions.map((option, index) => {
              const name = option.group ? `${option.group}: ${option.label}` : option.label;
              return (
                <Button
                  key={option.value}
                  variant="secondary"
                  size="sm"
                  data-filter-chip={option.value}
                  aria-label={`Remove filter ${name}`}
                  onClick={() => removeFilter(index)}
                  className="max-w-full"
                >
                  {option.group ? <span className="text-muted-foreground">{option.group}</span> : null}
                  <span className="truncate">{option.label}</span>
                  <X aria-hidden data-icon="inline-end" />
                </Button>
              );
            })}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        ) : null}
      </div>

      {children !== undefined ? (
        <TabsContent value={tab} className="flex min-h-0 flex-col">
          {children}
        </TabsContent>
      ) : null}
    </Tabs>
  );
}

export { PageHeader, type PageHeaderAction, type PageHeaderProps, type PageTab, type FilterOption };
