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
  SidebarSeparator,
  type SidebarProps,
} from '@/registry/kosmos/ui/sidebar';

// Sample data: replace it with your app's pages, workspaces and signed-in user.
/** `badge` is a count after the label; `badgeLabel` says what it counts, for screen readers ("unread"). */
type NavItem = { id: string; label: string; href: string; icon: LucideIcon; badge?: number; badgeLabel?: string };
type Workspace = { id: string; name: string; plan: string };
type User = { name: string; email: string; initials: string };

const navMain: NavItem[] = [
  { id: 'home', label: 'Home', href: '#home', icon: Home },
  { id: 'inbox', label: 'Inbox', href: '#inbox', icon: Inbox, badge: 3, badgeLabel: 'unread' },
  { id: 'accounts', label: 'Accounts', href: '#accounts', icon: Building2 },
  { id: 'deals', label: 'Deals', href: '#deals', icon: Handshake },
  { id: 'reports', label: 'Reports', href: '#reports', icon: BarChart3 },
];

const navViews: NavItem[] = [
  { id: 'view-enterprise', label: 'Enterprise accounts', href: '#view-enterprise', icon: Layers },
  { id: 'view-renewals', label: 'Renewals this quarter', href: '#view-renewals', icon: Layers },
  { id: 'view-at-risk', label: 'At risk', href: '#view-at-risk', icon: Layers, badge: 4, badgeLabel: 'accounts' },
];

const navFooter: NavItem[] = [
  { id: 'help', label: 'Help and feedback', href: '#help', icon: CircleHelp },
  { id: 'settings', label: 'Settings', href: '#settings', icon: Settings },
];

const sampleWorkspaces: Workspace[] = [
  { id: 'acme', name: 'Acme Inc.', plan: 'Business plan' },
  { id: 'globex', name: 'Globex', plan: 'Free plan' },
];

const sampleUser: User = { name: 'Maya Chen', email: 'maya@acme.com', initials: 'MC' };

type MenuProps = Omit<React.ComponentProps<typeof DropdownMenu>, 'children'>;

type AppSidebarContentProps = {
  /** The `id` of the current page; its item is highlighted and marked `aria-current="page"`. */
  activeItem?: string;
  /** Called when an item is clicked, with its `id`. Call `event.preventDefault()` to route in place. */
  onNavigate?: (id: string, event: React.MouseEvent<HTMLElement>) => void;
  /** Called by the search button, usually to open a command menu. */
  onSearch?: () => void;
  workspaces?: Workspace[];
  /** The `id` of the workspace shown in the switcher. Use with `onWorkspaceChange`; leave it out and the switcher keeps its own state. */
  workspace?: string;
  onWorkspaceChange?: (id: string) => void;
  user?: User;
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
  activeItem = 'accounts',
  onNavigate,
  onSearch,
  workspaces = sampleWorkspaces,
  workspace,
  onWorkspaceChange,
  user = sampleUser,
  workspaceMenu,
  userMenu,
}: AppSidebarContentProps) {
  const [workspaceState, setWorkspaceState] = React.useState(workspaces[0]?.id);
  const currentId = workspace ?? workspaceState;
  const current = workspaces.find((item) => item.id === currentId) ?? workspaces[0];
  const changeWorkspace = (id: string) => {
    if (workspace === undefined) setWorkspaceState(id);
    onWorkspaceChange?.(id);
  };

  return (
    <>
      <SidebarHeader>
        <DropdownMenu {...workspaceMenu}>
          <DropdownMenuTrigger
            render={<SidebarMenuButton className="h-10 gap-2.5 px-1.5 data-popup-open:bg-sidebar-accent" />}
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
            <DropdownMenuRadioGroup
              value={current.id}
              onValueChange={(value: string) => changeWorkspace(value)}
            >
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {workspaces.map((item) => (
                <DropdownMenuRadioItem key={item.id} value={item.id}>
                  <WorkspaceMark name={item.name} className="size-5" />
                  <span className="min-w-0 truncate">{item.name}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus />
              Add workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="secondary"
          className="w-full justify-start px-2 font-normal text-muted-foreground"
          aria-keyshortcuts="Meta+K"
          onClick={onSearch}
        >
          <Search aria-hidden />
          <span className="min-w-0 flex-1 truncate text-start">Search…</span>
          <KbdGroup aria-hidden>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
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

      <SidebarSeparator />
      <SidebarFooter>
        <NavGroup items={navFooter} activeItem={activeItem} onNavigate={onNavigate} />
        <DropdownMenu {...userMenu}>
          <DropdownMenuTrigger
            render={<SidebarMenuButton className="h-10 gap-2.5 px-1.5 data-popup-open:bg-sidebar-accent" />}
            aria-label={`${user.name}, account menu`}
          >
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
            <DropdownMenuItem>
              <UserRound />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              Account settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
  activeItem,
  onNavigate,
  onSearch,
  workspaces,
  workspace,
  onWorkspaceChange,
  user,
  workspaceMenu,
  userMenu,
  label = 'Main navigation',
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar label={label} {...props}>
      <AppSidebarContent
        activeItem={activeItem}
        onNavigate={onNavigate}
        onSearch={onSearch}
        workspaces={workspaces}
        workspace={workspace}
        onWorkspaceChange={onWorkspaceChange}
        user={user}
        workspaceMenu={workspaceMenu}
        userMenu={userMenu}
      />
    </Sidebar>
  );
}

export { AppSidebar, AppSidebarContent, type AppSidebarProps, type AppSidebarContentProps };
