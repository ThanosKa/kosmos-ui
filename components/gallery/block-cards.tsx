'use client';

import { useState } from 'react';
import { GalleryCard, GalleryStage, StageBackdropRows } from '@/components/gallery/gallery-card';
import { AppSidebar } from '@/registry/kosmos/blocks/app-sidebar/app-sidebar';
import { CommandMenu } from '@/registry/kosmos/blocks/command-menu/command-menu';
import { DataTable, sampleAccounts } from '@/registry/kosmos/blocks/data-table/data-table';
import { DetailDrawer } from '@/registry/kosmos/blocks/detail-drawer/detail-drawer';
import { KanbanBoard } from '@/registry/kosmos/blocks/kanban-board/kanban-board';
import { NewItemDialog } from '@/registry/kosmos/blocks/new-item-dialog/new-item-dialog';
import { PageHeader } from '@/registry/kosmos/blocks/page-header/page-header';
import { SidebarProvider, SidebarResizeHandle, SidebarTrigger } from '@/registry/kosmos/ui/sidebar';

const workspaces = [
  { id: 'halden', name: 'Halden Labs', plan: 'Team plan' },
  { id: 'sandbox', name: 'Halden Sandbox', plan: 'Free plan' },
];
const user = { name: 'Maya Chen', email: 'maya@haldenlabs.example', initials: 'MC' };

const tabs = [
  { value: 'all', label: 'All accounts', count: sampleAccounts.length },
  { value: 'active', label: 'Active', count: sampleAccounts.filter((row) => row.status === 'active').length },
  { value: 'at-risk', label: 'At risk', count: sampleAccounts.filter((row) => row.status === 'at-risk').length },
];

/** AppSidebar, SidebarResizeHandle, PageHeader and DataTable in one app frame. */
export function AppFrame() {
  const [active, setActive] = useState('accounts');
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  return (
    <SidebarProvider
      defaultWidth={232}
      className="min-h-0 overflow-hidden rounded-2xl border border-transparent shadow-card md:h-[36rem]"
    >
      <AppSidebar
        workspaces={workspaces}
        user={user}
        activeItem={active}
        onNavigate={(id, event) => {
          event.preventDefault();
          setActive(id);
        }}
      />
      <SidebarResizeHandle />
      <div className="flex min-w-0 flex-1 flex-col bg-background md:overflow-y-auto">
        <PageHeader
          title="Accounts"
          headingLevel={3}
          leading={<SidebarTrigger />}
          tabs={tabs}
          tab={tab}
          onTabChange={setTab}
          query={query}
          onQueryChange={setQuery}
          filterOptions={[{ value: 'mine', label: 'Owned by me' }]}
          defaultView="table"
        >
          <div className="p-4">
            <div className="overflow-hidden rounded-2xl border border-transparent bg-card shadow-card">
              <DataTable query={query} status={tab as 'all' | 'active' | 'at-risk'} />
            </div>
          </div>
        </PageHeader>
      </div>
    </SidebarProvider>
  );
}

/** KanbanBoard with its sample columns and cards. */
export function PipelineCard() {
  return (
    <GalleryCard title="Pipeline" description="Drag a card, or pick it up with Space." bodyClassName="h-[30rem] overflow-hidden p-2 pt-4">
      <KanbanBoard />
    </GalleryCard>
  );
}

export function NewItemStage() {
  return (
    <GalleryStage title="New item dialog" description="A form with validation, in a dialog." stageClassName="h-[40rem]">
      {(container) => (
        <NewItemDialog
          open
          modal={false}
          container={container}
          initialFocus={false}
          trigger={null}
          defaultValues={{ name: 'Quarry Supply', domain: 'quarry.example', status: 'trial', owner: 'maya' }}
        />
      )}
    </GalleryStage>
  );
}

export function CommandMenuStage() {
  return (
    <GalleryStage title="Command menu" description="The ⌘K palette with records, actions and pages." stageClassName="h-[32rem] lg:h-[40rem]">
      {(container) => (
        <CommandMenu open modal={false} container={container} initialFocus={false} trigger={null} hotkey={false} />
      )}
    </GalleryStage>
  );
}

export function DetailDrawerStage() {
  return (
    <GalleryStage title="Detail drawer" description="One record, its activity and a note field." stageClassName="h-[40rem]">
      {(container) => (
        <>
          <StageBackdropRows
            rows={['Northwind Traders · Active', 'Bluebird Labs · At risk', 'Cedar & Pine · Active', 'Lumen Health · Trial', 'Orbit Freight · Active']}
          />
          <DetailDrawer open modal={false} container={container} initialFocus={false} trigger={null} />
        </>
      )}
    </GalleryStage>
  );
}
