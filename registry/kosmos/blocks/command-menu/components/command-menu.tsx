'use client';

import {
  ArrowLeft,
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  FilePlus,
  FolderKanban,
  LayoutDashboard,
  Link,
  ListTodo,
  Search,
  Settings,
  UserPlus,
  UserRoundPen,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/registry/kosmos/ui/command';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';

type CommandMenuPage = 'root' | 'status' | 'assign';

type CommandMenuItem = {
  /** Passed to `onRun`. */
  value: string;
  /** What the search matches. */
  label: string;
  /** What the row shows, when it differs from `label` (which also holds the task ID, so the ID is searchable). */
  title?: string;
  icon?: LucideIcon;
  /** Colors the icon, such as a status color. */
  iconClassName?: string;
  /** Initials for an avatar in place of the icon. */
  initials?: string;
  /** A task ID shown before the label. */
  code?: string;
  /** The keys that run the command, shown at the end of the row. */
  keys?: string[];
  /** Opens a second list instead of running. */
  page?: Exclude<CommandMenuPage, 'root'>;
};

type CommandMenuGroup = { value: string; items: CommandMenuItem[] };

const rootGroups: CommandMenuGroup[] = [
  {
    value: 'Recent tasks',
    items: [
      { value: 'open:KOS-142', code: 'KOS-142', label: 'KOS-142 Fix the billing date in the invoice email', title: 'Fix the billing date in the invoice email', icon: CircleDot, iconClassName: 'text-warning' },
      { value: 'open:KOS-140', code: 'KOS-140', label: 'KOS-140 Redesign the onboarding checklist', title: 'Redesign the onboarding checklist', icon: CircleDot, iconClassName: 'text-warning' },
      { value: 'open:KOS-131', code: 'KOS-131', label: 'KOS-131 Rate-limit the public search endpoint', title: 'Rate-limit the public search endpoint', icon: Circle },
    ],
  },
  {
    value: 'Actions',
    items: [
      { value: 'create-task', label: 'Create task', icon: FilePlus, keys: ['C'] },
      { value: 'change-status', label: 'Change status…', icon: ListTodo, page: 'status' },
      { value: 'assign', label: 'Assign to…', icon: UserRoundPen, page: 'assign' },
      { value: 'copy-link', label: 'Copy link to task', icon: Link },
      { value: 'invite', label: 'Invite people', icon: UserPlus },
    ],
  },
  {
    value: 'Go to',
    items: [
      { value: 'go:dashboard', label: 'Dashboard', icon: LayoutDashboard, keys: ['G', 'D'] },
      { value: 'go:projects', label: 'Projects', icon: FolderKanban, keys: ['G', 'P'] },
      { value: 'go:settings', label: 'Settings', icon: Settings, keys: ['G', 'S'] },
    ],
  },
];

const pages: Record<Exclude<CommandMenuPage, 'root'>, { title: string; placeholder: string; groups: CommandMenuGroup[] }> = {
  status: {
    title: 'Change status',
    placeholder: 'Change status to…',
    groups: [
      {
        value: 'Status',
        items: [
          { value: 'status:backlog', label: 'Backlog', icon: CircleDashed, iconClassName: 'text-muted-foreground' },
          { value: 'status:todo', label: 'To do', icon: Circle },
          { value: 'status:in-progress', label: 'In progress', icon: CircleDot, iconClassName: 'text-warning' },
          { value: 'status:done', label: 'Done', icon: CircleCheck, iconClassName: 'text-success' },
        ],
      },
    ],
  },
  assign: {
    title: 'Assign to',
    placeholder: 'Assign to…',
    groups: [
      {
        value: 'People',
        items: [
          { value: 'assign:maya', label: 'Maya Chen', initials: 'MC' },
          { value: 'assign:leo', label: 'Leo Park', initials: 'LP' },
          { value: 'assign:sam', label: 'Sam Rivera', initials: 'SR' },
          { value: 'assign:none', label: 'Unassigned', icon: CircleDashed, iconClassName: 'text-muted-foreground' },
        ],
      },
    ],
  },
};

/** For values that never change after hydration: nothing to subscribe to. */
const subscribeNever = () => () => {};

/** Apple platforms show ⌘ for the shortcut, the rest Ctrl. The server renders ⌘. */
function useIsMac() {
  return React.useSyncExternalStore(
    subscribeNever,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => true,
  );
}

function ItemRow({ item }: { item: CommandMenuItem }) {
  const Icon = item.icon;
  return (
    <>
      {item.initials ? (
        <Avatar size="sm" className="size-5">
          <AvatarFallback className="text-caption">{item.initials}</AvatarFallback>
        </Avatar>
      ) : Icon ? (
        <Icon aria-hidden className={item.iconClassName} />
      ) : null}
      {item.code ? <span className="shrink-0 font-mono text-caption text-muted-foreground tabular-nums">{item.code}</span> : null}
      <span className="min-w-0 truncate">{item.title ?? item.label}</span>
      {item.keys ? (
        <CommandShortcut>
          {item.keys.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </CommandShortcut>
      ) : null}
    </>
  );
}

type CommandMenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called with the `value` of the command that ran, such as `create-task` or `assign:maya`. */
  onRun?: (value: string) => void;
  /** Toggles the menu with ⌘K (Ctrl+K on Windows and Linux) from anywhere on the page. Defaults to `true`. */
  shortcut?: boolean;
  /** The element that opens the menu. Defaults to a search button that shows the shortcut; pass `null` for none. */
  trigger?: React.ReactElement | null;
  /** Classes for the default trigger. */
  className?: string;
  /** Blocks the page behind the menu. Defaults to `true`. */
  modal?: boolean;
  /** The element the menu renders into. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof CommandDialog>['container'];
  /** Where focus goes when the menu opens. Defaults to the search field. */
  initialFocus?: React.ComponentProps<typeof CommandDialog>['initialFocus'];
  /** Opens on a second list, for previews. Defaults to the main list. */
  defaultPage?: CommandMenuPage;
  /** The search text to start with, for previews. */
  defaultQuery?: string;
};

/**
 * A ⌘K menu for the whole app: recent tasks, actions and places to go, filtered as you type.
 * Some actions open a second list (Change status…, Assign to…); Backspace in an empty field or
 * Escape goes back to the main list.
 */
function CommandMenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onRun,
  shortcut = true,
  trigger,
  className,
  modal = true,
  container,
  initialFocus,
  defaultPage = 'root',
  defaultQuery = '',
}: CommandMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const [page, setPage] = React.useState<CommandMenuPage>(defaultPage);
  const [query, setQuery] = React.useState(defaultQuery);
  const isMac = useIsMac();

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
      if (!next) {
        setPage('root');
        setQuery('');
      }
    },
    [openProp, onOpenChange],
  );

  const openRef = React.useRef(open);
  React.useEffect(() => {
    openRef.current = open;
  }, [open]);

  React.useEffect(() => {
    if (!shortcut) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        setOpen(!openRef.current);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shortcut, setOpen]);

  const inputRef = React.useRef<HTMLInputElement>(null);

  function goTo(next: CommandMenuPage) {
    setPage(next);
    setQuery('');
    // Clicking Back or an item can move focus off the field; keep typing in it.
    inputRef.current?.focus();
  }

  function run(item: CommandMenuItem) {
    if (item.page) {
      goTo(item.page);
      return;
    }
    onRun?.(item.value);
    setOpen(false);
  }

  const current = page === 'root' ? null : pages[page];
  const groups = current ? current.groups : rootGroups;

  return (
    <>
      {trigger === null ? null : trigger ? (
        React.cloneElement(trigger as React.ReactElement<{ onClick?: (event: React.MouseEvent) => void }>, {
          onClick: (event: React.MouseEvent) => {
            (trigger.props as { onClick?: (event: React.MouseEvent) => void }).onClick?.(event);
            setOpen(true);
          },
        })
      ) : (
        <Button
          variant="secondary"
          className={cn('w-full max-w-64 justify-between ps-2.5 pe-1.5 font-normal text-muted-foreground', className)}
          aria-keyshortcuts={shortcut ? (isMac ? 'Meta+K' : 'Control+K') : undefined}
          onClick={() => setOpen(true)}
        >
          <span className="flex items-center gap-2">
            <Search aria-hidden />
            Search
          </span>
          {shortcut ? (
            <KbdGroup aria-hidden>
              <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          ) : null}
        </Button>
      )}
      <CommandDialog
        title="Command menu"
        description="Search tasks, actions and pages."
        open={open}
        modal={modal}
        container={container}
        initialFocus={initialFocus}
        onOpenChange={(next, details) => {
          // Escape on a second list goes back to the main one instead of closing.
          if (!next && details.reason === 'escape-key' && page !== 'root') {
            details.cancel();
            goTo('root');
            return;
          }
          setOpen(next);
        }}
      >
        <Command items={groups} value={query} onValueChange={(value) => setQuery(value)}>
          {current ? (
            <div className="flex shrink-0 items-center gap-1.5 px-2 pt-2">
              <Button variant="ghost" size="icon-sm" aria-label="Back to all commands" onClick={() => goTo('root')}>
                <ArrowLeft aria-hidden />
              </Button>
              <span className="text-caption font-medium text-muted-foreground">{current.title}</span>
            </div>
          ) : null}
          <CommandInput
            ref={inputRef}
            placeholder={current ? current.placeholder : 'Search tasks, actions and pages…'}
            aria-label={current ? current.title : 'Search tasks, actions and pages'}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && query === '' && page !== 'root') {
                event.preventDefault();
                goTo('root');
              }
            }}
          />
          <CommandEmpty>No results for “{query}”.</CommandEmpty>
          <CommandList>
            {(group: CommandMenuGroup) => (
              <CommandGroup key={group.value} items={group.items}>
                <CommandGroupLabel>{group.value}</CommandGroupLabel>
                <CommandCollection>
                  {(item: CommandMenuItem) => (
                    <CommandItem key={item.value} value={item} onClick={() => run(item)}>
                      <ItemRow item={item} />
                    </CommandItem>
                  )}
                </CommandCollection>
              </CommandGroup>
            )}
          </CommandList>
          <CommandFooter />
        </Command>
      </CommandDialog>
    </>
  );
}

export { CommandMenu, type CommandMenuGroup, type CommandMenuItem, type CommandMenuPage, type CommandMenuProps };
