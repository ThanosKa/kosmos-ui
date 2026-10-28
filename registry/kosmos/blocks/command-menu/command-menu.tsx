'use client';

import {
  Activity,
  ArrowLeftRight,
  CircleDashed,
  CircleDollarSign,
  FolderKanban,
  LayoutDashboard,
  Milestone,
  Plus,
  Search,
  Settings,
  UserPlus,
  UserRoundSearch,
  Users,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Command,
  CommandBack,
  CommandCollection,
  CommandDescription,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemText,
  CommandList,
  CommandLoading,
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
  /** A muted second line under the title. Not searched unless it is also in `label`. */
  description?: string;
  icon?: LucideIcon;
  /** A colored status dot in place of the icon: a background class such as `bg-success`. */
  dot?: string;
  /** Initials for an avatar in place of the icon. */
  initials?: string;
  /** The URL of a photo for that avatar. The initials show until it loads. */
  avatar?: string;
  /** The URL of a logo in place of the icon, such as a workspace's. */
  logo?: string;
  /** Keys your app binds to this command, shown at the end of the row. The menu doesn't bind them. */
  keys?: string[];
  /** Opens this second list instead of running. */
  page?: string;
};

type CommandMenuGroup = { value: string; items: CommandMenuItem[] };

/** A second list, opened by an item whose `page` is its key. */
type CommandMenuPage = { title: string; placeholder: string; groups: CommandMenuGroup[] };

// Sample data: replace it with your records, actions and pages.
type ProjectStatus = 'live' | 'trial' | 'paused';

const statusDot: Record<ProjectStatus, string> = {
  live: 'bg-success',
  trial: 'bg-muted-foreground',
  paused: 'bg-warning',
};

const sampleProjects: { id: string; name: string; domain: string; status: ProjectStatus }[] = [
  { id: 'fernhill', name: 'Fernhill Books', domain: 'fernhill.example', status: 'live' },
  { id: 'brightloop', name: 'Brightloop Fitness', domain: 'brightloop.example', status: 'live' },
  { id: 'copperline', name: 'Copperline Bank', domain: 'copperline.example', status: 'live' },
  { id: 'saltmarsh', name: 'Saltmarsh Coffee', domain: 'saltmarsh.example', status: 'live' },
  { id: 'driftwood', name: 'Driftwood Travel', domain: 'driftwood.example', status: 'live' },
  { id: 'hollowoak', name: 'Hollow Oak Games', domain: 'hollowoak.example', status: 'paused' },
  { id: 'cirrus', name: 'Cirrus Weather', domain: 'cirrus.example', status: 'live' },
  { id: 'pebblepine', name: 'Pebble & Pine', domain: 'pebblepine.example', status: 'live' },
  { id: 'marigold', name: 'Marigold Recipes', domain: 'marigold.example', status: 'trial' },
  { id: 'kiln', name: 'Kiln Studio', domain: 'kiln.example', status: 'paused' },
  { id: 'tidepool', name: 'Tidepool Notes', domain: 'tidepool.example', status: 'trial' },
  { id: 'ironbark', name: 'Ironbark Logistics', domain: 'ironbark.example', status: 'live' },
];

const sampleGroups: CommandMenuGroup[] = [
  {
    value: 'Projects',
    items: sampleProjects.map((project) => ({
      value: `open:${project.id}`,
      label: `${project.name} ${project.domain}`,
      title: project.name,
      hint: project.domain,
      dot: statusDot[project.status],
    })),
  },
  {
    value: 'Actions',
    items: [
      { value: 'new-roadmap-item', label: 'New roadmap item', icon: Plus, keys: ['C'] },
      { value: 'invite', label: 'Invite teammate', description: 'Send an email invite to your workspace', icon: UserPlus },
      { value: 'assigned', label: 'Show roadmap items assigned to…', icon: UserRoundSearch, page: 'assignee' },
      { value: 'switch-workspace', label: 'Switch workspace…', icon: ArrowLeftRight, page: 'workspace' },
    ],
  },
  {
    value: 'Go to',
    items: [
      { value: 'go:overview', label: 'Overview', icon: LayoutDashboard },
      { value: 'go:projects', label: 'Projects', icon: FolderKanban },
      { value: 'go:events', label: 'Events', icon: Activity },
      { value: 'go:users', label: 'Users', icon: Users },
      { value: 'go:revenue', label: 'Revenue', icon: CircleDollarSign },
      { value: 'go:roadmap', label: 'Roadmap', icon: Milestone },
      { value: 'go:settings', label: 'Settings', icon: Settings },
    ],
  },
];

const samplePages: Record<string, CommandMenuPage> = {
  assignee: {
    title: 'Show roadmap items assigned to',
    placeholder: 'Assigned to…',
    groups: [
      {
        value: 'Team',
        items: [
          { value: 'assignee:lena', label: 'Lena Park', initials: 'LP', avatar: '/avatars/lena.jpg' },
          { value: 'assignee:tomas', label: 'Tomás Ortega', initials: 'TO', avatar: '/avatars/tomas.jpg' },
          { value: 'assignee:ama', label: 'Ama Mensah', initials: 'AM', avatar: '/avatars/ama.jpg' },
          { value: 'assignee:kai', label: 'Kai Nakamura', initials: 'KN', avatar: '/avatars/kai.jpg' },
          { value: 'assignee:none', label: 'No one', icon: CircleDashed },
        ],
      },
    ],
  },
  workspace: {
    title: 'Switch workspace',
    placeholder: 'Switch to…',
    groups: [
      {
        value: 'Workspaces',
        items: [
          { value: 'workspace:acme', label: 'Acme', hint: 'Scale plan', logo: '/logos/acme.svg' },
          { value: 'workspace:acme-staging', label: 'Acme Staging', hint: 'Free plan', logo: '/logos/acme-staging.svg' },
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
          {item.avatar ? <AvatarImage src={item.avatar} alt="" /> : null}
          <AvatarFallback>{item.initials}</AvatarFallback>
        </Avatar>
      ) : item.logo ? (
        <Avatar size="sm" className="size-5 rounded-sm" aria-hidden>
          <AvatarImage src={item.logo} alt="" />
          <AvatarFallback>{item.label.charAt(0)}</AvatarFallback>
        </Avatar>
      ) : item.dot ? (
        <span aria-hidden className="flex size-4 shrink-0 items-center justify-center">
          <span className={cn('size-2 rounded-full', item.dot)} />
        </span>
      ) : Icon ? (
        <Icon aria-hidden />
      ) : null}
      {item.description ? (
        <CommandItemText>
          <span className="truncate">{item.title ?? item.label}</span>
          <CommandDescription>{item.description}</CommandDescription>
        </CommandItemText>
      ) : (
        <span className="min-w-0 truncate">{item.title ?? item.label}</span>
      )}
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
  /** The main list. Defaults to sample projects, actions and pages. */
  groups?: CommandMenuGroup[];
  /** Second lists, by the key an item names in `page`. */
  pages?: Record<string, CommandMenuPage>;
  /** Replaces the list with a loading row while your records load. */
  loading?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called with the `value` of the command that ran, such as `new-roadmap-item` or `assignee:lena`. */
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
  /**
   * The search text. Use with `onQueryChange`, or leave it out and pass `defaultQuery`. The menu clears
   * its own search each time it opens; a controlled one stays as you set it.
   */
  query?: string;
  /** The search text at first, when the menu keeps its own state. */
  defaultQuery?: string;
  /** Called as the search text changes, including when it is cleared on moving between lists. */
  onQueryChange?: (query: string) => void;
};

/**
 * A ⌘K menu for the whole app: records, actions and places to go, filtered as you type. An item
 * with a `page` opens a second list (Switch workspace…); Backspace in an empty field
 * or Escape goes back to the main list. The menu opens on the main list every time.
 */
function CommandMenu({
  groups = sampleGroups,
  pages = samplePages,
  loading = false,
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
  query: queryProp,
  defaultQuery = '',
  onQueryChange,
}: CommandMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const [page, setPage] = React.useState<string | null>(defaultPage ?? null);
  const [uncontrolledQuery, setUncontrolledQuery] = React.useState(defaultQuery);
  const query = queryProp ?? uncontrolledQuery;
  const setQuery = (next: string) => {
    if (queryProp === undefined) setUncontrolledQuery(next);
    onQueryChange?.(next);
  };
  const isMac = useIsMac();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Start from the main list each time the menu opens, however it was closed. A controlled search stays as set.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPage(null);
      if (queryProp === undefined) setUncontrolledQuery('');
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
        description="Search projects, actions and pages."
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
          {current ? <CommandBack title={current.title} onBack={() => goTo(null)} /> : null}
          <CommandInput
            ref={inputRef}
            placeholder={current ? current.placeholder : 'Search projects, actions and pages…'}
            aria-label={current ? current.title : 'Search projects, actions and pages'}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && query === '' && current) {
                event.preventDefault();
                goTo(null);
              }
            }}
          />
          {loading ? (
            <CommandLoading />
          ) : (
            <CommandEmpty>No results for “{query}”.</CommandEmpty>
          )}
          <CommandList className={loading ? 'hidden' : undefined}>
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
          <CommandFooter back={Boolean(current)} />
        </Command>
      </CommandDialog>
    </>
  );
}

export { CommandMenu, type CommandMenuGroup, type CommandMenuItem, type CommandMenuPage, type CommandMenuProps };
