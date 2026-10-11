'use client';

import {
  BarChart3,
  Building2,
  ChevronsUpDown,
  CircleHelp,
  Handshake,
  Home,
  Inbox,
  Layers,
  LogOut,
  Plus,
  Search,
  Settings,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';
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
  { id: 'home', label: 'Home', href: '#home', icon: Home },
  { id: 'inbox', label: 'Inbox', href: '#inbox', icon: Inbox, badge: 3, badgeLabel: 'unread' },
  { id: 'accounts', label: 'Accounts', href: '#accounts', icon: Building2 },
  { id: 'deals', label: 'Deals', href: '#deals', icon: Handshake },
  { id: 'reports', label: 'Reports', href: '#reports', icon: BarChart3 },
];

const sampleNavViews: NavItem[] = [
  { id: 'view-enterprise', label: 'Enterprise accounts', href: '#view-enterprise', icon: Layers },
  { id: 'view-renewals', label: 'Renewals this quarter', href: '#view-renewals', icon: Layers },
  { id: 'view-at-risk', label: 'At risk', href: '#view-at-risk', icon: Layers, badge: 4, badgeLabel: 'accounts' },
];

const sampleNavFooter: NavItem[] = [
  { id: 'help', label: 'Help and feedback', href: '#help', icon: CircleHelp },
  { id: 'settings', label: 'Settings', href: '#settings', icon: Settings },
];

const sampleWorkspaces: Workspace[] = [
  { id: 'acme', name: 'Acme Inc.', plan: 'Business plan' },
  { id: 'globex', name: 'Globex', plan: 'Free plan' },
];

const sampleUser: User = { name: 'Maya Chen', email: 'maya@acme.example', initials: 'MC' };

type MenuProps = Omit<React.ComponentProps<typeof DropdownMenu>, 'children'>;

/** What the workspace and account menus offer besides switching workspace. */
type AppSidebarAction = 'add-workspace' | 'profile' | 'account-settings' | 'log-out';

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
  /** The links above the account menu, such as help and settings. */
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
  /** Runs an action from the workspace or account menu. Those items, and the account menu, show only when this is passed. */
  onAction?: (action: AppSidebarAction) => void;
  /** Props for the workspace menu, such as `open` and `onOpenChange`. */
  workspaceMenu?: MenuProps;
  /** Props for the account menu, such as `open` and `onOpenChange`. */
  userMenu?: MenuProps;
};

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
          <SidebarMenuButton href={href} isActive={id === activeItem} onClick={(event) => onNavigate?.(id, event)}>
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
 * help, settings and account links at the bottom. `AppSidebar` wraps it in a `Sidebar`; render it on its
 * own to put the same content in another surface, such as your own drawer.
 */
function AppSidebarContent({
  navMain = sampleNavMain,
  navViews = sampleNavViews,
  navFooter = sampleNavFooter,
  activeItem = 'accounts',
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
              render={<SidebarMenuButton className="h-10 gap-2.5 px-1.5 text-sidebar-foreground data-popup-open:bg-sidebar-accent" />}
              aria-label={`${current.name}, switch workspace`}
            >
              <WorkspaceMark name={current.name} />
              <span className="flex min-w-0 flex-1 flex-col text-start">
                <span title={current.name} className="truncate font-medium">
                  {current.name}
                </span>
                <span className="truncate text-caption text-muted-foreground">{current.plan}</span>
              </span>
              <ChevronsUpDown aria-hidden className="ms-auto" />
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
        <Button
          variant="secondary"
          className="w-full justify-start px-2 font-normal text-muted-foreground"
          // The hint is shown and announced only when the app binds the shortcut (`searchShortcut`).
          aria-keyshortcuts={searchShortcut ? (isMac ? 'Meta+K' : 'Control+K') : undefined}
          onClick={onSearch}
        >
          <Search aria-hidden />
          <span className="min-w-0 flex-1 truncate text-start">Search…</span>
          {searchShortcut ? (
            <KbdGroup aria-hidden>
              <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          ) : null}
        </Button>
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
              render={<SidebarMenuButton className="h-10 gap-2.5 px-1.5 text-sidebar-foreground data-popup-open:bg-sidebar-accent" />}
              aria-label={`${user.name}, account menu`}
            >
              {userDetails}
              <ChevronsUpDown aria-hidden className="ms-auto" />
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
              <DropdownMenuItem onClick={() => onAction('account-settings')}>
                <Settings />
                Account settings
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
          <div className="flex h-10 min-w-0 items-center gap-2.5 px-1.5 text-body text-sidebar-foreground">
            {userDetails}
          </div>
        )}
      </SidebarFooter>
    </>
  );
}

type AppSidebarProps = SidebarProps & AppSidebarContentProps;

/**
 * The app's sidebar: a workspace switcher, search, the main pages with unread counts, saved views and
 * an account menu. Place it inside a `SidebarProvider`, next to a `SidebarResizeHandle` and `SidebarInset`.
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
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar label={label} {...props}>
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
