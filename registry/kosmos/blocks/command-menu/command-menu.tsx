'use client';

import {
  ArrowLeft,
  BarChart3,
  Building2,
  CircleDashed,
  Handshake,
  Home,
  Inbox,
  Link,
  Plus,
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

type CommandMenuItem = {
  /** Passed to `onRun`. */
  value: string;
  /** What the search matches. */
  label: string;
  /** What the row shows, when it differs from `label`. */
  title?: string;
  /** Muted text after the title, such as a domain. Not searched unless it is also in `label`. */
  hint?: string;
  icon?: LucideIcon;
  /** A colored status dot in place of the icon: a background class such as `bg-success`. */
  dot?: string;
  /** Initials for an avatar in place of the icon. */
  initials?: string;
  /** Keys your app binds to this command, shown at the end of the row. The menu doesn't bind them. */
  keys?: string[];
  /** Opens this second list instead of running. */
  page?: string;
};

type CommandMenuGroup = { value: string; items: CommandMenuItem[] };

/** A second list, opened by an item whose `page` is its key. */
type CommandMenuPage = { title: string; placeholder: string; groups: CommandMenuGroup[] };

// Sample data: replace it with your records, actions and pages.
const sampleGroups: CommandMenuGroup[] = [
  {
    value: 'Accounts',
    items: [
      { value: 'open:northwind', label: 'Northwind Traders northwind.example', title: 'Northwind Traders', hint: 'northwind.example', dot: 'bg-success' },
      { value: 'open:bluebird', label: 'Bluebird Labs bluebird.example', title: 'Bluebird Labs', hint: 'bluebird.example', dot: 'bg-warning' },
      { value: 'open:lumen', label: 'Lumen Health lumenhealth.example', title: 'Lumen Health', hint: 'lumenhealth.example', dot: 'bg-muted-foreground' },
    ],
  },
  {
    value: 'Actions',
    items: [
      { value: 'new-account', label: 'New account', icon: Plus },
      { value: 'change-status', label: 'Change status…', icon: CircleDashed, page: 'status' },
      { value: 'assign-owner', label: 'Assign owner…', icon: UserRoundPen, page: 'owner' },
      { value: 'copy-link', label: 'Copy link to account', icon: Link },
      { value: 'invite', label: 'Invite people to Acme Inc.', icon: UserPlus },
    ],
  },
  {
    value: 'Go to',
    items: [
      { value: 'go:home', label: 'Home', icon: Home },
      { value: 'go:inbox', label: 'Inbox', icon: Inbox },
      { value: 'go:accounts', label: 'Accounts', icon: Building2 },
      { value: 'go:deals', label: 'Deals', icon: Handshake },
      { value: 'go:reports', label: 'Reports', icon: BarChart3 },
      { value: 'go:settings', label: 'Settings', icon: Settings },
    ],
  },
];

const samplePages: Record<string, CommandMenuPage> = {
  status: {
    title: 'Change status',
    placeholder: 'Change status to…',
    groups: [
      {
        value: 'Status',
        items: [
          { value: 'status:trial', label: 'Trial', dot: 'bg-muted-foreground' },
          { value: 'status:active', label: 'Active', dot: 'bg-success' },
          { value: 'status:at-risk', label: 'At risk', dot: 'bg-warning' },
          { value: 'status:churned', label: 'Churned', dot: 'bg-destructive' },
        ],
      },
    ],
  },
  owner: {
    title: 'Assign owner',
    placeholder: 'Assign to…',
    groups: [
      {
        value: 'People',
        items: [
          { value: 'owner:maya', label: 'Maya Chen', initials: 'MC' },
          { value: 'owner:jonas', label: 'Jonas Weber', initials: 'JW' },
          { value: 'owner:priya', label: 'Priya Raman', initials: 'PR' },
          { value: 'owner:none', label: 'No owner', icon: CircleDashed },
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
        <Avatar size="sm" className="size-5" aria-hidden>
          <AvatarFallback>{item.initials}</AvatarFallback>
        </Avatar>
      ) : item.dot ? (
        <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
          <span className={cn('size-2 rounded-full', item.dot)} />
        </span>
      ) : Icon ? (
        <Icon aria-hidden />
      ) : null}
      <span className="min-w-0 truncate">{item.title ?? item.label}</span>
      {item.hint ? <span className="min-w-0 shrink-[2] truncate text-small text-muted-foreground">{item.hint}</span> : null}
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
  /** The main list. Defaults to sample accounts, actions and pages. */
  groups?: CommandMenuGroup[];
  /** Second lists, by the key an item names in `page`. */
  pages?: Record<string, CommandMenuPage>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called with the `value` of the command that ran, such as `new-account` or `owner:maya`. */
  onRun?: (value: string) => void;
  /** Toggles the menu with ⌘K (Ctrl+K on Windows and Linux) from anywhere on the page. Defaults to `true`. */
  hotkey?: boolean;
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
  /** The second list to open on, by its key, for previews. Defaults to the main list. */
  defaultPage?: string;
  /** The search text to start with, for previews. */
  defaultQuery?: string;
};

/**
 * A ⌘K menu for the whole app: records, actions and places to go, filtered as you type. An item
 * with a `page` opens a second list (Change status…, Assign owner…); Backspace in an empty field
 * or Escape goes back to the main list. The menu opens on the main list every time.
 */
function CommandMenu({
  groups = sampleGroups,
  pages = samplePages,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onRun,
  hotkey = true,
  trigger,
  className,
  modal = true,
  container,
  initialFocus,
  defaultPage,
  defaultQuery = '',
}: CommandMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const [page, setPage] = React.useState<string | null>(defaultPage ?? null);
  const [query, setQuery] = React.useState(defaultQuery);
  const isMac = useIsMac();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Start from the main list each time the menu opens, however it was closed.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPage(null);
      setQuery('');
    }
  }

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const openRef = React.useRef(open);
  React.useEffect(() => {
    openRef.current = open;
  }, [open]);

  React.useEffect(() => {
    if (!hotkey) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        setOpen(!openRef.current);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hotkey, setOpen]);

  function goTo(next: string | null) {
    setPage(next);
    setQuery('');
    // Clicking Back or an item can move focus off the field; keep typing in it.
    inputRef.current?.focus();
  }

  function run(item: CommandMenuItem) {
    if (item.page && pages[item.page]) {
      goTo(item.page);
      return;
    }
    onRun?.(item.value);
    setOpen(false);
  }

  const current = page ? pages[page] : undefined;

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
          aria-keyshortcuts={hotkey ? (isMac ? 'Meta+K' : 'Control+K') : undefined}
          onClick={() => setOpen(true)}
        >
          <span className="flex items-center gap-2">
            <Search aria-hidden />
            Search
          </span>
          {hotkey ? (
            <KbdGroup aria-hidden>
              <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          ) : null}
        </Button>
      )}
      <CommandDialog
        title="Command menu"
        description="Search accounts, actions and pages."
        open={open}
        modal={modal}
        container={container}
        initialFocus={initialFocus}
        onOpenChange={(next, details) => {
          // Escape on a second list goes back to the main one instead of closing.
          if (!next && details.reason === 'escape-key' && current) {
            details.cancel();
            goTo(null);
            return;
          }
          setOpen(next);
        }}
      >
        <Command items={current ? current.groups : groups} value={query} onValueChange={(value) => setQuery(value)}>
          {current ? (
            <div className="flex shrink-0 items-center gap-1.5 px-2 pt-2">
              <Button variant="ghost" size="icon-sm" aria-label="Back to all commands" onClick={() => goTo(null)}>
                <ArrowLeft aria-hidden />
              </Button>
              <span className="text-caption font-medium text-muted-foreground">{current.title}</span>
            </div>
          ) : null}
          <CommandInput
            ref={inputRef}
            placeholder={current ? current.placeholder : 'Search accounts, actions and pages…'}
            aria-label={current ? current.title : 'Search accounts, actions and pages'}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && query === '' && current) {
                event.preventDefault();
                goTo(null);
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
