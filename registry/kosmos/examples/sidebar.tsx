'use client';

import type * as React from 'react';
import { BarChart3, Folder, Home, Inbox, LifeBuoy, Settings, Users } from 'lucide-react';
import { OverlayStage } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Drawer, DrawerContent, DrawerTitle } from '@/registry/kosmos/ui/drawer';
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
  SidebarTrigger,
} from '@/registry/kosmos/ui/sidebar';

const pages = [
  { label: 'Home', icon: Home, active: true },
  { label: 'Inbox', icon: Inbox, count: 12 },
  { label: 'Reports', icon: BarChart3 },
  { label: 'Customers', icon: Users },
];

const projects = ['Q3 Roadmap', 'Billing revamp', 'Reconcile September payouts with the bank export'];

function SidebarBody() {
  return (
    <>
      <SidebarHeader>
        <div className="flex h-8 items-center gap-2 px-2">
          <span aria-hidden className="flex size-5 items-center justify-center rounded-md bg-primary text-caption font-medium text-primary-foreground">
            A
          </span>
          <span className="truncate text-body font-medium">Acme Inc.</span>
        </div>
      </SidebarHeader>
      <SidebarContent render={<nav aria-label="Main" />}>
        <SidebarGroup>
          <SidebarMenu>
            {pages.map(({ label, icon: Icon, active, count }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton href={`/${label.toLowerCase()}`} isActive={active} onClick={stay}>
                  <Icon aria-hidden />
                  <span>{label}</span>
                  {count ? <SidebarMenuBadge>{count}</SidebarMenuBadge> : null}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarMenu>
            {projects.map((project) => (
              <SidebarMenuItem key={project}>
                <SidebarMenuButton href="/projects" onClick={stay}>
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
            <SidebarMenuButton href="/help" onClick={stay}>
              <LifeBuoy aria-hidden />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/settings" onClick={stay}>
              <Settings aria-hidden />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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

/** The preview's links go nowhere: a click must not change the page URL. */
const stay = (event: React.MouseEvent) => event.preventDefault();

export default function SidebarPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="App shell (a drawer below 768px)">
        <SidebarProvider className={`${frame} h-[34rem]`}>
          <Sidebar>
            <SidebarBody />
          </Sidebar>
          <SidebarResizeHandle />
          <SidebarInset render={<div />}>
            <PageHeader title="Home" />
            <div className="flex flex-col gap-2 p-4 text-muted-foreground">
              <p>Drag the sidebar edge, or focus it with Tab and use the arrow keys.</p>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </PreviewSection>

      <PreviewSection title="Collapsed">
        <SidebarProvider defaultOpen={false} className={`${frame} h-40`}>
          <Sidebar>
            <SidebarBody />
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

      <PreviewSection title="Resize handle × states (768px and wider)">
        <StateMatrix
          rows={['handle'] as const}
          states={['default', 'hover', 'focus', 'dragging'] as const}
          render={(_, state) => (
            <>
              <SidebarProvider defaultWidth={64} minWidth={48} className={`${frame} h-20 max-md:hidden`}>
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
        <OverlayStage label="open, below 768px" className="max-w-sm">
          {(container) => (
            <Drawer open modal={false} swipeDirection="left">
              <DrawerContent
                container={container}
                initialFocus={false}
                showCloseButton={false}
                className="bg-sidebar text-sidebar-foreground data-[swipe-direction=left]:w-72 data-[swipe-direction=left]:max-w-[calc(100%-1rem)] sm:data-[swipe-direction=left]:w-72"
              >
                <DrawerTitle className="sr-only">Sidebar</DrawerTitle>
                <SidebarBody />
              </DrawerContent>
            </Drawer>
          )}
        </OverlayStage>
      </PreviewSection>
    </PreviewStack>
  );
}
