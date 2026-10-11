'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { DataTable, type Account } from '@/registry/kosmos/blocks/data-table/data-table';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card';

const longRows: Account[] = [
  {
    id: 'long-1',
    name: 'International Consolidated Shipping and Logistics Partners',
    domain: 'consolidated-shipping-and-logistics-partners.example',
    status: 'at-risk',
    owner: { name: 'Alexandra Konstantinidou-Papadopoulou', initials: 'AK' },
    arr: 12480000,
    health: 47,
    lastActivity: '2026-10-01',
  },
  {
    id: 'long-2',
    name: 'Ål & Ørsted Fjordbyen',
    domain: 'fjordbyen.example',
    status: 'active',
    owner: { name: 'Jonas Weber', initials: 'JW' },
    arr: 900,
    health: 100,
    lastActivity: '2026-10-11',
  },
];

export default function DataTablePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Rows selected, sorted by ARR">
        <div className={frame}>
          <DataTable
            selection={['northwind', 'orbit', 'vela']}
            defaultSort={{ key: 'arr', direction: 'descending' }}
            onOpen={() => {}}
          />
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
          <DataTable rows={longRows} onOpen={() => {}} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
