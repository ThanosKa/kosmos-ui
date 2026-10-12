'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { DataTable, type Project } from '@/registry/kosmos/blocks/data-table/data-table';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card';

const longRows: Project[] = [
  {
    id: 'long-1',
    name: 'Fernhill Books Marketplace for Independent Booksellers and Publishers',
    domain: 'marketplace.independent-booksellers.fernhill.example',
    platform: 'server',
    plan: 'scale',
    status: 'live',
    users: 1284300,
    events: 912480600,
    mrr: 124800,
    lastEventAt: '2026-10-11',
  },
  {
    id: 'long-2',
    name: 'Kiln',
    domain: 'kiln.example',
    platform: 'android',
    plan: 'free',
    status: 'paused',
    users: 1,
    events: 3,
    mrr: 0,
    lastEventAt: '2026-08-30',
  },
];

export default function DataTablePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Rows selected, sorted by revenue">
        <div className={frame}>
          <DataTable
            selection={['fernhill', 'copperline', 'cirrus']}
            defaultSort={{ key: 'mrr', direction: 'descending' }}
            onOpen={() => {}}
            onAction={() => {}}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Filtered: Pro plan on iOS and Android">
        <div className={frame}>
          <DataTable filters={['pro', 'ios', 'android']} onOpen={() => {}} onAction={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="Loading">
        <div className={frame}>
          <DataTable loading />
        </div>
      </PreviewSection>

      <PreviewSection title="No rows match the search">
        <div className={frame}>
          <DataTable query="zzz" onClearFilters={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="No rows yet">
        <div className={frame}>
          <DataTable rows={[]} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text and extreme values">
        <div className={frame}>
          <DataTable rows={longRows} onOpen={() => {}} onAction={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="In a narrow container (scrolls sideways)">
        <div className={`${frame} max-w-sm`}>
          <DataTable defaultSelection={['brightloop']} onAction={() => {}} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
