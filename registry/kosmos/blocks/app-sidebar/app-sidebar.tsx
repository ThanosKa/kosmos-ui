'use client';

import {
  Activity,
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
import { DropdownMenuItem, DropdownMenuSeparator } from '@/registry/kosmos/ui/dropdown-menu';
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
  SidebarSubmenu,
  SidebarSubmenuButton,
  SidebarSubmenuContent,
  SidebarSubmenuItem,
  SidebarSubmenuTrigger,
  SidebarUserMenu,
  SidebarWorkspaceSwitcher,
  type SidebarProps,
  type SidebarUser,
  type SidebarWorkspace,
  type SidebarWorkspaceSwitcherProps,
} from '@/registry/kosmos/ui/sidebar';

// Sample data: replace it with your app's pages, workspaces and signed-in user.
/** A page one level down, in an item's submenu. */
type NavSubItem = { id: string; label: string; href: string };
/**
 * `badge` is a count after the label; `badgeLabel` says what it counts, for screen readers ("unread").
 * With `items` the item opens a submenu of those pages instead of being a page itself, and has no `href`.
 */
type NavItem = {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: number;
  badgeLabel?: string;
  items?: NavSubItem[];
};

const sampleNavMain: NavItem[] = [
  { id: 'overview', label: 'Overview', href: '#overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', href: '#projects', icon: FolderKanban },
  {
    id: 'events-menu',
    label: 'Events',
    icon: Activity,
    items: [
      { id: 'events', label: 'Live events', href: '#events' },
      { id: 'funnels', label: 'Funnels', href: '#funnels' },
      { id: 'alerts', label: 'Alerts', href: '#alerts' },
    ],
  },
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

const sampleWorkspaces: SidebarWorkspace[] = [
  { id: 'acme', name: 'Acme', description: 'Scale plan' },
  { id: 'acme-staging', name: 'Acme Staging', description: 'Free plan' },
];

const sampleUser: SidebarUser = { name: 'Lena Park', email: 'lena@acme.example', initials: 'LP' };

type MenuProps = Omit<
  SidebarWorkspaceSwitcherProps,
  'workspaces' | 'value' | 'defaultValue' | 'onValueChange' | 'label' | 'children' | 'className'
>;

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
  /** The main pages, at the top. An item with `items` opens a submenu. */
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
  workspaces?: SidebarWorkspace[];
  /** The `id` of the workspace shown in the switcher. Use with `onWorkspaceChange`, or leave it out and pass `defaultWorkspace`. */
  workspace?: string;
  /** The workspace shown at first, when the switcher keeps its own state. Defaults to the first one. */
  defaultWorkspace?: string;
  onWorkspaceChange?: (id: string) => void;
  user?: SidebarUser;
  /** Runs an action from the workspace or user menu. Those items, and the user menu, show only when this is passed. */
  onAction?: (action: AppSidebarAction) => void;
  /** Props for the workspace menu, such as `open` and `onOpenChange`. */
  workspaceMenu?: MenuProps;
  /** Props for the user menu, such as `open` and `onOpenChange`. */
  userMenu?: MenuProps;
};

const hiddenInIconMode =
  'transition-[opacity] group-data-[collapsible=icon]/sidebar:opacity-0 motion-safe:group-data-[state=expanded]/sidebar:delay-(--transition-duration-fast)';

function Count({ badge, badgeLabel }: Pick<NavItem, 'badge' | 'badgeLabel'>) {
  if (!badge) return null;
  return (
    <SidebarMenuBadge>
      {badge.toLocaleString('en-US')}
      {badgeLabel ? <span className="sr-only"> {badgeLabel}</span> : null}
    </SidebarMenuBadge>
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
      {items.map(({ id, label, href, icon: Icon, badge, badgeLabel, items: pages }) => {
        if (pages?.length) {
          const holdsActive = pages.some((page) => page.id === activeItem);
          return (
            <SidebarMenuItem key={id}>
              <SidebarSubmenu label={label} defaultOpen={holdsActive}>
                <SidebarSubmenuTrigger isActive={holdsActive}>
                  <Icon aria-hidden />
                  <span>{label}</span>
                  <Count badge={badge} badgeLabel={badgeLabel} />
                </SidebarSubmenuTrigger>
                <SidebarSubmenuContent>
                  {pages.map((page) => (
                    <SidebarSubmenuItem key={page.id}>
                      <SidebarSubmenuButton
                        href={page.href}
                        isActive={page.id === activeItem}
                        onClick={(event) => onNavigate?.(page.id, event)}
                      >
                        <span>{page.label}</span>
                      </SidebarSubmenuButton>
                    </SidebarSubmenuItem>
                  ))}
                </SidebarSubmenuContent>
              </SidebarSubmenu>
            </SidebarMenuItem>
          );
        }
        return (
          <SidebarMenuItem key={id}>
            <SidebarMenuButton href={href} isActive={id === activeItem} tooltip={label} onClick={(event: React.MouseEvent<HTMLElement>) => onNavigate?.(id, event)}>
              <Icon aria-hidden />
              <span>{label}</span>
              <Count badge={badge} badgeLabel={badgeLabel} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
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

  return (
    <>
      <SidebarHeader>
        <SidebarWorkspaceSwitcher
          workspaces={workspaces}
          value={workspace}
          defaultValue={defaultWorkspace}
          onValueChange={onWorkspaceChange}
          {...workspaceMenu}
        >
          {onAction ? (
            <DropdownMenuItem onClick={() => onAction('add-workspace')}>
              <Plus />
              Add workspace
            </DropdownMenuItem>
          ) : null}
        </SidebarWorkspaceSwitcher>
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
        <SidebarUserMenu user={user} {...userMenu}>
          {onAction ? (
            <>
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
            </>
          ) : null}
        </SidebarUserMenu>
      </SidebarFooter>
    </>
  );
}

type AppSidebarProps = SidebarProps & AppSidebarContentProps;

/**
 * The app's sidebar: a workspace switcher, search, the main pages with a submenu, saved views with counts and a user
 * menu. It collapses to a column of icons that name their page in a tooltip and open a submenu in a popover; pass
 * `collapsible="offcanvas"` to hide it at the edge instead. Place it inside a `SidebarProvider`, next to a
 * `SidebarResizeHandle` and `SidebarInset`.
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

export {
  AppSidebar,
  AppSidebarContent,
  type AppSidebarAction,
  type AppSidebarProps,
  type AppSidebarContentProps,
  type NavItem as AppSidebarNavItem,
  type NavSubItem as AppSidebarNavSubItem,
};
