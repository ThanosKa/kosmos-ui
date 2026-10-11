'use client';

import type * as React from 'react';
import { OverlayStage } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { AppSidebar, AppSidebarContent, type AppSidebarProps } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { Drawer, DrawerContent, DrawerTitle } from '@/registry/kosmos/ui/drawer';
import {
  SidebarInset,
  SidebarProvider,
  SidebarResizeHandle,
  SidebarTrigger,
  useSidebar,
} from '@/registry/kosmos/ui/sidebar';

const frame = 'min-h-0 overflow-hidden rounded-xl border border-transparent shadow-card';

function Page({ title }: { title: string }) {
  return (
    <SidebarInset>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
        <SidebarTrigger />
        <h1 className="truncate text-body font-medium">{title}</h1>
      </header>
      <p className="p-4 text-body text-muted-foreground">Page content</p>
    </SidebarInset>
  );
}

/** Pins a menu open from 768px up; below that the sidebar is a closed drawer and the menu has no trigger. */
function PinnedSidebar({ menu }: { menu: 'workspace' | 'user' }) {
  const { isMobile } = useSidebar();
  const pinned = isMobile ? undefined : { open: true, modal: false };
  return (
    <AppSidebar
      searchShortcut
      onAction={() => {}}
      workspaceMenu={menu === 'workspace' ? pinned : undefined}
      userMenu={menu === 'user' ? pinned : undefined}
    />
  );
}

function Shell({
  className,
  title = 'Accounts',
  children,
  ...props
}: React.ComponentProps<typeof SidebarProvider> & { title?: string }) {
  return (
    <SidebarProvider className={`${frame} ${className ?? ''}`} {...props}>
      {children}
      <SidebarResizeHandle />
      <Page title={title} />
    </SidebarProvider>
  );
}

const longNames: Pick<AppSidebarProps, 'workspaces' | 'user'> = {
  workspaces: [{ id: 'northwind', name: 'Northwind Traders International Holdings', plan: 'Enterprise plan, billed yearly' }],
  user: { name: 'Alexandra Konstantinidou-Papadopoulou', email: 'alexandra.konstantinidou@northwind-traders.example', initials: 'AK' },
};

export default function AppSidebarPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Expanded, with each menu open (a drawer below 768px)">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Shell className="h-40 md:h-[38rem]">
            <PinnedSidebar menu="workspace" />
          </Shell>
          <Shell className="h-40 md:h-[38rem]">
            <PinnedSidebar menu="user" />
          </Shell>
        </div>
      </PreviewSection>

      <PreviewSection title="Collapsed">
        <Shell defaultOpen={false} className="h-40">
          <AppSidebar />
        </Shell>
      </PreviewSection>

      <PreviewSection title="Long names">
        <Shell className="h-40 md:h-[38rem]" title="Renewals this quarter">
          <AppSidebar activeItem="view-renewals" onAction={() => {}} {...longNames} />
        </Shell>
      </PreviewSection>

      <PreviewSection title="No workspaces, no actions, no shortcut: no switcher, the user as plain text">
        <Shell className="h-40 md:h-[38rem]">
          <AppSidebar workspaces={[]} />
        </Shell>
      </PreviewSection>

      <PreviewSection title="Phone: the sidebar as a drawer">
        <OverlayStage label="open, below 768px" className="h-[40rem] max-w-sm">
          {(container) => (
            <Drawer open modal={false} swipeDirection="left">
              <DrawerContent
                container={container}
                initialFocus={false}
                showCloseButton={false}
                className="bg-sidebar text-sidebar-foreground data-[swipe-direction=left]:w-72 data-[swipe-direction=left]:max-w-[calc(100%-1rem)] sm:data-[swipe-direction=left]:w-72"
              >
                <DrawerTitle className="sr-only">Main navigation</DrawerTitle>
                <div className="flex min-h-0 flex-1 flex-col">
                  <AppSidebarContent searchShortcut onAction={() => {}} />
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </OverlayStage>
      </PreviewSection>
    </PreviewStack>
  );
}
