'use client';

import { DataSetPreview } from '@/components/preview/data-set-preview';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { ProjectsTable, type Project } from '@/registry/kosmos/blocks/projects-table/projects-table';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card';

const longRows: Project[] = [
  {
    id: 'long-1',
    name: 'Fernhill Books Marketplace for Independent Booksellers and Publishers',
    domain: 'marketplace.independent-booksellers.fernhill.example',
    platform: 'server',
    plan: 'scale',
    status: 'live',
    users: 128430,
    events: 9124800,
    mrr: 4800,
    lastEventAt: '2026-10-11',
  },
  {
    id: 'emoji',
    name: '🚀 Launchpad',
    domain: 'launchpad.example',
    platform: 'ios',
    plan: 'free',
    status: 'trial',
    users: 48210000,
    events: 9999999999,
    mrr: 0,
    lastEventAt: '2026-10-11',
  },
  {
    id: 'cjk',
    name: '山田書店オンラインストア',
    domain: 'yamada-shoten.example',
    platform: 'web',
    plan: 'scale',
    status: 'live',
    users: 0,
    events: 0,
    mrr: 12400000,
    lastEventAt: '2026-10-11',
  },
  {
    id: 'long-2',
    name: 'Kiln',
    domain: 'kiln.example',
    platform: 'web',
    plan: 'free',
    status: 'paused',
    users: 1,
    events: 3,
    mrr: 0,
    lastEventAt: '2026-08-30',
  },
];

export default function ProjectsTablePreview() {
  return <DataSetPreview demo={<Demo />} worst={<Worst />} />;
}

function Worst() {
  return (
    <PreviewStack>
      <PreviewSection title="Long text and extreme values">
        <div className={frame}>
          <ProjectsTable rows={longRows} onOpen={() => {}} onAction={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="Worst case in a narrow container">
        <div className={`${frame} max-w-sm`}>
          <ProjectsTable rows={longRows} onOpen={() => {}} onAction={() => {}} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}

function Demo() {
  return (
    <PreviewStack>
      <PreviewSection title="Rows selected, sorted by revenue">
        <div className={frame}>
          <ProjectsTable
            selection={['fernhill', 'copperline', 'cirrus']}
            defaultSort={{ key: 'mrr', direction: 'descending' }}
            onOpen={() => {}}
            onAction={() => {}}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Filtered: Pro plan on iOS and Android, searched">
        <div className={frame}>
          <ProjectsTable defaultQuery="i" defaultFilters={['pro', 'ios', 'android']} onOpen={() => {}} onAction={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="Three statuses on, two columns hidden">
        <div className={frame}>
          <ProjectsTable defaultFilters={['live', 'trial', 'paused']} defaultHiddenColumns={['events', 'quota']} />
        </div>
      </PreviewSection>

      <PreviewSection title="Page 2 of 3, five rows a page">
        <div className={frame}>
          <ProjectsTable pageSize={5} defaultPage={2} onOpen={() => {}} onAction={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="Every row of the page selected">
        <div className={frame}>
          <ProjectsTable
            pageSize={5}
            defaultSelection={['fernhill', 'brightloop', 'copperline', 'saltmarsh', 'driftwood']}
            onAction={() => {}}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Loading">
        <div className={frame}>
          <ProjectsTable loading />
        </div>
      </PreviewSection>

      <PreviewSection title="No rows match the search">
        <div className={frame}>
          <ProjectsTable defaultQuery="zzz" />
        </div>
      </PreviewSection>

      <PreviewSection title="No rows yet">
        <div className={frame}>
          <ProjectsTable rows={[]} />
        </div>
      </PreviewSection>

      <PreviewSection title="Without the toolbar, under a page header">
        <div className={frame}>
          <ProjectsTable toolbar={false} status="live" filters={['scale']} onClearFilters={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="In a narrow container (scrolls sideways)">
        <div className={`${frame} max-w-sm`}>
          <ProjectsTable defaultSelection={['brightloop']} onAction={() => {}} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
