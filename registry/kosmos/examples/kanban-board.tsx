'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { KanbanBoard, KanbanCard, type KanbanItem } from '@/registry/kosmos/blocks/kanban-board/kanban-board';

const frame = 'flex w-full min-w-0 overflow-hidden rounded-xl border border-transparent bg-background p-3 shadow-card';

const longItems: KanbanItem[] = [
  {
    id: 'long',
    name: 'International Association of Independent Freight Forwarders and Customs Brokers',
    domain: 'association-of-independent-freight-forwarders.example',
    status: 'trial',
    owner: { name: 'Priya Raman', initials: 'PR' },
    arr: 1250000,
    health: 100,
    lastActivity: '2026-10-11',
  },
  { id: 'bare', name: 'Supercalifragilisticexpialidocious-holdings', status: 'trial' },
  { id: 'short', name: 'Ox', domain: 'ox.example', status: 'active', owner: { name: 'Jonas Weber', initials: 'JW' }, arr: 1200, health: 3 },
];

const sample: KanbanItem = {
  id: 'northwind',
  name: 'Northwind Traders',
  domain: 'northwind.example',
  status: 'active',
  owner: { name: 'Maya Chen', initials: 'MC' },
  arr: 184000,
  health: 86,
  lastActivity: '2026-10-10',
};

export default function KanbanBoardPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Full (drag a card, or Tab to it and press Space)">
        <div className={`${frame} h-[30rem]`}>
          <KanbanBoard onAdd={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="Filtered by a search">
        <div className={`${frame} h-72`}>
          <KanbanBoard query="maya" />
        </div>
      </PreviewSection>

      <PreviewSection title="Loading">
        <div className={`${frame} h-72`}>
          <KanbanBoard loading />
        </div>
      </PreviewSection>

      <PreviewSection title="Empty">
        <div className={`${frame} h-44`}>
          <KanbanBoard defaultItems={[]} onAdd={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text">
        <div className={`${frame} h-96`}>
          <KanbanBoard defaultItems={longItems} />
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container">
        <div className={`${frame} h-96 max-w-xs`}>
          <KanbanBoard />
        </div>
      </PreviewSection>

      <PreviewSection title="Card states: resting, lifted while dragged, the slot it leaves">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <KanbanCard item={sample} />
          <KanbanCard item={sample} lifted />
          <KanbanCard item={sample} placeholder />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
