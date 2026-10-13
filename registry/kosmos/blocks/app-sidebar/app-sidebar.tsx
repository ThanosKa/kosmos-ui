'use client';

import {
  Activity,
  ChevronsUpDown,
  CircleDollarSign,
  CircleHelp,
  FolderKanban,
  Layers,
  LayoutDashboard,
  LogOut,
  Milestone,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProps,
} from '@/registry/kosmos/ui/sidebar';

// Sample data: replace it with your app's pages, workspaces and signed-in user.
/** `badge` is a count after the label; `badgeLabel` says what it counts, for screen readers ("unread"). */
type NavItem = { id: string; label: string; href: string; icon: LucideIcon; badge?: number; badgeLabel?: string };
type Workspace = { id: string; name: string; plan: string };
type User = { name: string; email: string; initials: string };

const sampleNavMain: NavItem[] = [
  { id: 'overview', label: 'Overview', href: '#overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', href: '#projects', icon: FolderKanban },
  { id: 'events', label: 'Events', href: '#events', icon: Activity },
  { id: 'users', label: 'Users', href: '#users', icon: Users },
  { id: 'revenue', label: 'Revenue', href: '#revenue', icon: CircleDollarSign },
  { id: 'roadmap', label: 'Roadmap', href: '#roadmap', icon: Milestone },
];

const sampleNavViews: NavItem[] = [
  { id: 'view-scale', label: 'Scale plan', href: '#view-scale', icon: Layers },
  { id: 'view-trials', label: 'Trials', href: '#view-trials', icon: Layers, badge: 2, badgeLabel: 'projects' },
];

const sampleNavFooter: NavItem[] = [
  { id: 'help', label: 'Help and feedback', href: '#help', icon: CircleHelp },
  { id: 'settings', label: 'Settings', href: '#settings', icon: Settings },
];

const sampleWorkspaces: Workspace[] = [
  { id: 'parallax', name: 'Parallax', plan: 'Scale plan' },
  { id: 'parallax-staging', name: 'Parallax Staging', plan: 'Free plan' },
];

const sampleUser: User = { name: 'Lena Park', email: 'lena@parallax.example', initials: 'LP' };

type MenuProps = Omit<React.ComponentProps<typeof DropdownMenu>, 'children'>;

/** What the workspace and user menus offer besides switching workspace. */
type AppSidebarAction = 'add-workspace' | 'profile' | 'preferences' | 'log-out';

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

type AppSidebarContentProps = {
  /** The main pages, at the top. */
  navMain?: NavItem[];
  /** The saved views, under their own heading. */
  navViews?: NavItem[];
  /** The links above the user menu, such as help and settings. */
  navFooter?: NavItem[];
  /** The `id` of the current page; its item is highlighted and marked `aria-current="page"`. */
  activeItem?: string;
  /** Called when an item is clicked, with its `id`. Call `event.preventDefault()` to route in place. */
  onNavigate?: (id: string, event: React.MouseEvent<HTMLElement>) => void;
  /** Called by the search button, usually to open a command menu. */
  onSearch?: () => void;
  /**
   * Shows ⌘K (Ctrl+K on Windows and Linux) on the search button and announces it. Turn it on only when
   * your app binds that shortcut to the same search, as `CommandMenu` does with `hotkey`.
   */
  searchShortcut?: boolean;
  /** The workspaces in the switcher. With none, the switcher is hidden. */
  workspaces?: Workspace[];
  /** The `id` of the workspace shown in the switcher. Use with `onWorkspaceChange`, or leave it out and pass `defaultWorkspace`. */
  workspace?: string;
  /** The workspace shown at first, when the switcher keeps its own state. Defaults to the first one. */
  defaultWorkspace?: string;
  onWorkspaceChange?: (id: string) => void;
  user?: User;
  /** Runs an action from the workspace or user menu. Those items, and the user menu, show only when this is passed. */
  onAction?: (action: AppSidebarAction) => void;
  /** Props for the workspace menu, such as `open` and `onOpenChange`. */
  workspaceMenu?: MenuProps;
  /** Props for the user menu, such as `open` and `onOpenChange`. */
  userMenu?: MenuProps;
};

/** The workspace and user menu triggers: two lines of text beside a 24px mark, which stays centered in the icon column. */
const menuTrigger =
  'h-10 gap-2.5 px-1.5 text-sidebar-foreground data-popup-open:bg-sidebar-accent group-data-[collapsible=icon]/sidebar:px-1';
const hiddenInIconMode = 'transition-[opacity] group-data-[collapsible=icon]/sidebar:opacity-0';
const menuChevron = cn('ms-auto', hiddenInIconMode);

function WorkspaceMark({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-caption font-medium text-sidebar-primary-foreground',
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function NavGroup({
  items,
  activeItem,
  onNavigate,
}: {
  items: NavItem[];
  activeItem?: string;
  onNavigate?: AppSidebarContentProps['onNavigate'];
}) {
  return (
    <SidebarMenu>
      {items.map(({ id, label, href, icon: Icon, badge, badgeLabel }) => (
        <SidebarMenuItem key={id}>
          <SidebarMenuButton href={href} isActive={id === activeItem} tooltip={label} onClick={(event) => onNavigate?.(id, event)}>
            <Icon aria-hidden />
            <span>{label}</span>
            {badge ? (
              <SidebarMenuBadge>
                {badge.toLocaleString('en-US')}
                {badgeLabel ? <span className="sr-only"> {badgeLabel}</span> : null}
              </SidebarMenuBadge>
            ) : null}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

/**
 * What goes inside the sidebar: the workspace switcher and search, the pages and saved views, and the
 * help and settings links and the user menu at the bottom. `AppSidebar` wraps it in a `Sidebar`; render it on its
 * own to put the same content in another surface, such as your own drawer.
 */
function AppSidebarContent({
  navMain = sampleNavMain,
  navViews = sampleNavViews,
  navFooter = sampleNavFooter,
  activeItem = 'projects',
  onNavigate,
  onSearch,
  searchShortcut = false,
  workspaces = sampleWorkspaces,
  workspace,
  defaultWorkspace,
  onWorkspaceChange,
  user = sampleUser,
  onAction,
  workspaceMenu,
  userMenu,
}: AppSidebarContentProps) {
  const isMac = useIsMac();
  const [workspaceState, setWorkspaceState] = React.useState(defaultWorkspace ?? workspaces[0]?.id);
  const currentId = workspace ?? workspaceState;
  const current = workspaces.find((item) => item.id === currentId) ?? workspaces[0];
  const changeWorkspace = (id: string) => {
    if (workspace === undefined) setWorkspaceState(id);
    onWorkspaceChange?.(id);
  };

  const userDetails = (
    <>
      <Avatar size="sm" aria-hidden>
        <AvatarFallback>{user.initials}</AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-1 flex-col text-start">
        <span title={user.name} className="truncate font-medium">
          {user.name}
        </span>
        <span title={user.email} className="truncate text-caption text-muted-foreground">
          {user.email}
        </span>
      </span>
    </>
  );

  return (
    <>
      <SidebarHeader>
        {current ? (
          <DropdownMenu {...workspaceMenu}>
            <DropdownMenuTrigger
              render={<SidebarMenuButton tooltip={current.name} className={menuTrigger} />}
              aria-label={`${current.name}, switch workspace`}
            >
              <WorkspaceMark name={current.name} />
              <span className="flex min-w-0 flex-1 flex-col text-start">
                <span title={current.name} className="truncate font-medium">
                  {current.name}
                </span>
                <span className="truncate text-caption text-muted-foreground">{current.plan}</span>
              </span>
              <ChevronsUpDown aria-hidden className={menuChevron} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-(--anchor-width) sm:min-w-56">
              <DropdownMenuRadioGroup value={current.id} onValueChange={(value: string) => changeWorkspace(value)}>
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                {workspaces.map((item) => (
                  <DropdownMenuRadioItem key={item.id} value={item.id}>
                    <WorkspaceMark name={item.name} className="size-5" />
                    <span className="min-w-0 truncate">{item.name}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              {onAction ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAction('add-workspace')}>
                    <Plus />
                    Add workspace
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <SidebarMenuButton
          tooltip="Search"
          className={cn(
            'bg-secondary font-normal shadow-control hover:not-data-disabled:bg-muted hover:not-data-disabled:text-muted-foreground',
            'transition-[background-color,color,box-shadow,scale] motion-safe:not-disabled:not-data-disabled:active:scale-96',
          )}
          // The hint is shown and announced only when the app binds the shortcut (`searchShortcut`).
          aria-keyshortcuts={searchShortcut ? (isMac ? 'Meta+K' : 'Control+K') : undefined}
          onClick={onSearch}
        >
          <Search aria-hidden />
          <span className="flex-1 text-start">Search…</span>
          {searchShortcut ? (
            <KbdGroup aria-hidden className={hiddenInIconMode}>
              <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          ) : null}
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent render={<nav aria-label="Main" />}>
        <SidebarGroup>
          <NavGroup items={navMain} activeItem={activeItem} onNavigate={onNavigate} />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel render={<h2 />}>Saved views</SidebarGroupLabel>
          <NavGroup items={navViews} activeItem={activeItem} onNavigate={onNavigate} />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavGroup items={navFooter} activeItem={activeItem} onNavigate={onNavigate} />
        {onAction ? (
          <DropdownMenu {...userMenu}>
            <DropdownMenuTrigger
              render={<SidebarMenuButton tooltip={user.name} className={menuTrigger} />}
              aria-label={`${user.name}, user menu`}
            >
              {userDetails}
              <ChevronsUpDown aria-hidden className={menuChevron} />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" className="min-w-(--anchor-width) sm:min-w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="truncate text-body font-medium text-foreground">{user.name}</span>
                  <span className="truncate font-normal">{user.email}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction('profile')}>
                <UserRound />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('preferences')}>
                <SlidersHorizontal />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction('log-out')}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Without actions there is no menu to open: the signed-in user shows as plain text.
          <div className="flex h-10 min-w-0 items-center gap-2.5 overflow-hidden px-1.5 text-body text-sidebar-foreground group-data-[collapsible=icon]/sidebar:px-1 [&>span:last-child]:transition-[opacity] group-data-[collapsible=icon]/sidebar:[&>span:last-child]:opacity-0">
            {userDetails}
          </div>
        )}
      </SidebarFooter>
    </>
  );
}

type AppSidebarProps = SidebarProps & AppSidebarContentProps;

/**
 * The app's sidebar: a workspace switcher, search, the main pages, saved views with counts and a user menu.
 * It collapses to a column of icons that name their page in a tooltip; pass `collapsible="offcanvas"` to hide it
 * at the edge instead. Place it inside a `SidebarProvider`, next to a `SidebarResizeHandle` and `SidebarInset`.
 */
function AppSidebar({
  navMain,
  navViews,
  navFooter,
  activeItem,
  onNavigate,
  onSearch,
  searchShortcut,
  workspaces,
  workspace,
  defaultWorkspace,
  onWorkspaceChange,
  user,
  onAction,
  workspaceMenu,
  userMenu,
  label = 'Main navigation',
  collapsible = 'icon',
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar label={label} collapsible={collapsible} {...props}>
      <AppSidebarContent
        navMain={navMain}
        navViews={navViews}
        navFooter={navFooter}
        activeItem={activeItem}
        onNavigate={onNavigate}
        onSearch={onSearch}
        searchShortcut={searchShortcut}
        workspaces={workspaces}
        workspace={workspace}
        defaultWorkspace={defaultWorkspace}
        onWorkspaceChange={onWorkspaceChange}
        user={user}
        onAction={onAction}
        workspaceMenu={workspaceMenu}
        userMenu={userMenu}
      />
    </Sidebar>
  );
}

export { AppSidebar, AppSidebarContent, type AppSidebarAction, type AppSidebarProps, type AppSidebarContentProps, type NavItem as AppSidebarNavItem };
