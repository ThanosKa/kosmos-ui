'use client';

import type * as React from 'react';
import { BarChart3, Folder, Home, Inbox, LifeBuoy, LogOut, Plus, Settings, UserRound, Users } from 'lucide-react';
import { OverlayStage } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Drawer, DrawerContent, DrawerTitle } from '@/registry/kosmos/ui/drawer';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/registry/kosmos/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarResizeHandle,
  SidebarSubmenu,
  SidebarSubmenuButton,
  SidebarSubmenuContent,
  SidebarSubmenuItem,
  SidebarSubmenuTrigger,
  SidebarTrigger,
  SidebarUserMenu,
  SidebarWorkspaceSwitcher,
  type SidebarWorkspace,
} from '@/registry/kosmos/ui/sidebar';

const pages = [
  { label: 'Home', icon: Home, active: true },
  { label: 'Inbox', icon: Inbox, count: 12 },
];

const reports = ['Revenue', 'Retention', 'Funnels', 'Signups by first event, platform and plan'];

const projects = ['Q3 Roadmap', 'Billing revamp', 'Reconcile September payouts with the bank export'];

const workspaces: SidebarWorkspace[] = [
  { id: 'acme', name: 'Acme', description: 'Scale plan' },
  { id: 'acme-staging', name: 'Acme Staging', description: 'Free plan' },
];

const user = { name: 'Lena Park', email: 'lena@acme.example', initials: 'LP' };

type Pinned = 'submenu' | 'workspace' | 'user';

/** The preview's links go nowhere: a click must not change the page URL. */
const stay = (event: React.MouseEvent) => event.preventDefault();

function SidebarBody({
  pinned,
  activePage = 'Home',
  reportsOpen = false,
  menus = true,
}: {
  pinned?: Pinned;
  activePage?: string;
  reportsOpen?: boolean;
  menus?: boolean;
}) {
  const pin = (menu: Pinned) => (pinned === menu ? { open: true, modal: false } : {});
  return (
    <>
      <SidebarHeader>
        {menus ? (
          <SidebarWorkspaceSwitcher workspaces={workspaces} {...pin('workspace')}>
            <DropdownMenuItem>
              <Plus />
              Add workspace
            </DropdownMenuItem>
          </SidebarWorkspaceSwitcher>
        ) : (
          <div className="flex h-8 items-center gap-2 px-1.5">
            <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-caption font-medium text-primary-foreground">
              A
            </span>
            <span className="truncate text-body font-medium transition-[opacity] group-data-[collapsible=icon]/sidebar:opacity-0 motion-safe:group-data-[state=expanded]/sidebar:delay-(--transition-duration-fast)">Acme</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent render={<nav aria-label="Main" />}>
        <SidebarGroup>
          <SidebarMenu>
            {pages.map(({ label, icon: Icon, count }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton href={`/${label.toLowerCase()}`} isActive={label === activePage} tooltip={label} onClick={stay}>
                  <Icon aria-hidden />
                  <span>{label}</span>
                  {count ? <SidebarMenuBadge>{count}</SidebarMenuBadge> : null}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarSubmenu label="Reports" defaultOpen={reportsOpen} popoverOpen={pinned === 'submenu' ? true : undefined}>
                <SidebarSubmenuTrigger isActive={reports.includes(activePage)}>
                  <BarChart3 aria-hidden />
                  <span>Reports</span>
                </SidebarSubmenuTrigger>
                <SidebarSubmenuContent>
                  {reports.map((report) => (
                    <SidebarSubmenuItem key={report}>
                      <SidebarSubmenuButton href={`/reports/${report.toLowerCase()}`} isActive={report === activePage} onClick={stay}>
                        <span>{report}</span>
                      </SidebarSubmenuButton>
                    </SidebarSubmenuItem>
                  ))}
                </SidebarSubmenuContent>
              </SidebarSubmenu>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarSubmenu label="Customers">
                <SidebarSubmenuTrigger>
                  <Users aria-hidden />
                  <span>Customers</span>
                </SidebarSubmenuTrigger>
                <SidebarSubmenuContent>
                  {['Segments', 'Cohorts'].map((label) => (
                    <SidebarSubmenuItem key={label}>
                      <SidebarSubmenuButton href={`/customers/${label.toLowerCase()}`} onClick={stay}>
                        <span>{label}</span>
                      </SidebarSubmenuButton>
                    </SidebarSubmenuItem>
                  ))}
                </SidebarSubmenuContent>
              </SidebarSubmenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarMenu>
            {projects.map((project) => (
              <SidebarMenuItem key={project}>
                <SidebarMenuButton href="/projects" tooltip={project} onClick={stay}>
                  <Folder aria-hidden />
                  <span>{project}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/help" tooltip="Help" onClick={stay}>
              <LifeBuoy aria-hidden />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/settings" tooltip="Settings" onClick={stay}>
              <Settings aria-hidden />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {menus ? (
          <SidebarUserMenu user={user} {...pin('user')}>
            <DropdownMenuItem>
              <UserRound />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </SidebarUserMenu>
        ) : null}
      </SidebarFooter>
    </>
  );
}

function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
      <SidebarTrigger />
      <h1 className="truncate text-body font-medium">{title}</h1>
    </header>
  );
}

const frame = 'min-h-0 overflow-hidden rounded-xl border border-transparent shadow-card';

/** A collapsed, icons-only shell with one menu pinned open beside the column. Below 768px it is a closed drawer. */
function IconShell({ pinned, activePage }: { pinned: Pinned; activePage?: string }) {
  return (
    <SidebarProvider defaultOpen={false} storageKey={false} keyboardShortcut={false} className={`${frame} h-40 md:h-[30rem]`}>
      <Sidebar collapsible="icon">
        <SidebarBody pinned={pinned} activePage={activePage} />
      </Sidebar>
      <SidebarResizeHandle />
      <SidebarInset render={<div />}>
        <PageHeader title={activePage ?? 'Home'} />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function SidebarPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="App shell, collapsing to icons (a drawer below 768px)">
        <SidebarProvider storageKey={false} className={`${frame} h-[34rem]`}>
          <Sidebar collapsible="icon">
            <SidebarBody activePage="Retention" reportsOpen />
          </Sidebar>
          <SidebarResizeHandle />
          <SidebarInset render={<div />}>
            <PageHeader title="Retention" />
            <div className="flex flex-col gap-2 p-4 text-muted-foreground">
              <p>Drag the sidebar edge, or focus it with Tab and use the arrow keys. The trigger’s tooltip shows the shortcut that collapses it to icons.</p>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </PreviewSection>

      <PreviewSection title="Icon mode: collapsed to icons, names in tooltips; the current page sits in Reports">
        <SidebarProvider defaultOpen={false} storageKey={false} keyboardShortcut={false} className={`${frame} h-[34rem]`}>
          <Sidebar collapsible="icon">
            <SidebarBody activePage="Retention" reportsOpen />
          </Sidebar>
          <SidebarResizeHandle />
          <SidebarInset render={<div />}>
            <PageHeader title="Retention" />
          </SidebarInset>
        </SidebarProvider>
      </PreviewSection>

      <PreviewSection title="Icon mode: the submenu, the workspace switcher and the user menu open beside the column">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <IconShell pinned="submenu" activePage="Retention" />
          <IconShell pinned="workspace" />
          <IconShell pinned="user" />
        </div>
      </PreviewSection>

      <PreviewSection title="Expanded: the workspace switcher and the user menu open">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {(['workspace', 'user'] as const).map((pinned) => (
            <SidebarProvider key={pinned} storageKey={false} keyboardShortcut={false} className={`${frame} h-40 md:h-[34rem]`}>
              <Sidebar collapsible="icon">
                <SidebarBody pinned={pinned} />
              </Sidebar>
              <SidebarResizeHandle />
              <SidebarInset render={<div />}>
                <PageHeader title="Home" />
              </SidebarInset>
            </SidebarProvider>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Offcanvas: collapsed to the edge">
        <SidebarProvider defaultOpen={false} storageKey={false} keyboardShortcut={false} className={`${frame} h-40`}>
          <Sidebar collapsible="offcanvas">
            <SidebarBody menus={false} />
          </Sidebar>
          <SidebarResizeHandle />
          <SidebarInset render={<div />}>
            <PageHeader title="Reports" />
          </SidebarInset>
        </SidebarProvider>
      </PreviewSection>

      <PreviewSection title="Menu button × states">
        <StateMatrix
          rows={['item', 'active item'] as const}
          render={(row, state) => (
            <ul className="w-full rounded-lg bg-sidebar p-1">
              <SidebarMenuItem>
                <SidebarMenuButton isActive={row === 'active item'} {...previewState(state)}>
                  <Inbox aria-hidden />
                  <span>Inbox</span>
                  <SidebarMenuBadge>12</SidebarMenuBadge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </ul>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Submenu trigger and page × states">
        <StateMatrix
          rows={['closed', 'closed, holds the current page', 'open, holds the current page'] as const}
          render={(row, state) => (
            <ul className="w-full rounded-lg bg-sidebar p-1">
              <SidebarMenuItem>
                <SidebarSubmenu label="Reports" open={row.startsWith('open')}>
                  <SidebarSubmenuTrigger isActive={row !== 'closed'} {...previewState(state)}>
                    <BarChart3 aria-hidden />
                    <span>Reports</span>
                  </SidebarSubmenuTrigger>
                  <SidebarSubmenuContent>
                    <SidebarSubmenuItem>
                      <SidebarSubmenuButton href="/reports/revenue" onClick={stay} {...previewState(state)}>
                        <span>Revenue</span>
                      </SidebarSubmenuButton>
                    </SidebarSubmenuItem>
                    <SidebarSubmenuItem>
                      <SidebarSubmenuButton href="/reports/retention" isActive onClick={stay}>
                        <span>Retention</span>
                      </SidebarSubmenuButton>
                    </SidebarSubmenuItem>
                  </SidebarSubmenuContent>
                </SidebarSubmenu>
              </SidebarMenuItem>
            </ul>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Resize handle × states (768px and wider)">
        <StateMatrix
          rows={['handle'] as const}
          states={['default', 'hover', 'focus', 'dragging'] as const}
          render={(_, state) => (
            <>
              <SidebarProvider
                defaultWidth={64}
                minWidth={48}
                storageKey={false}
                keyboardShortcut={false}
                className={`${frame} h-20 max-md:hidden`}
              >
                <Sidebar aria-hidden />
                <SidebarResizeHandle
                  {...(state === 'dragging' ? { 'data-dragging': '' } : previewState(state))}
                />
                <SidebarInset render={<div />} />
              </SidebarProvider>
              <p className="text-caption text-muted-foreground md:hidden">Below 768px the sidebar is a drawer, with no handle.</p>
            </>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Phone: the sidebar as a drawer">
        <OverlayStage label="open, below 768px" className="h-[36rem] max-w-sm">
          {(container) => (
            <Drawer open modal={false} swipeDirection="left">
              <DrawerContent
                container={container}
                initialFocus={false}
                showCloseButton={false}
                className="bg-sidebar text-sidebar-foreground data-[swipe-direction=left]:w-72 data-[swipe-direction=left]:max-w-[calc(100%-1rem)] sm:data-[swipe-direction=left]:w-72"
              >
                <DrawerTitle className="sr-only">Sidebar</DrawerTitle>
                <SidebarBody activePage="Retention" reportsOpen />
              </DrawerContent>
            </Drawer>
          )}
        </OverlayStage>
      </PreviewSection>
    </PreviewStack>
  );
}
