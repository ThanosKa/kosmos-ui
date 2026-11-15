'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { KanbanBoard, KanbanCard, type KanbanItem } from '@/registry/kosmos/blocks/kanban-board/kanban-board';

const frame = 'flex w-full min-w-0 overflow-hidden rounded-xl border border-transparent bg-background p-3 shadow-card';

const longItems: KanbanItem[] = [
  {
    id: 'long',
    title: 'Retention cohorts by plan, platform and signup month, with a comparison against the cohort a year before and an export to CSV',
    column: 'ideas',
    area: { label: 'Insights', hue: 'amber' },
    votes: 12480,
    assignee: { name: 'Tomás Ortega', initials: 'TO', avatarUrl: '/avatars/tomas.jpg' },
    target: 'Q1 2027',
  },
  { id: 'bare', title: 'Server-side-batching-for-every-ingestion-endpoint-and-region', column: 'ideas' },
  { id: 'short', title: 'SSO', column: 'planned', area: { label: 'Platform', hue: 'blue' }, votes: 1 },
];

const sample: KanbanItem = {
  id: 'funnel-comparisons',
  title: 'Funnel comparisons',
  column: 'in-progress',
  area: { label: 'Insights', hue: 'amber' },
  votes: 112,
  assignee: { name: 'Ama Mensah', initials: 'AM', avatarUrl: '/avatars/ama.jpg' },
  target: 'Q4 2026',
};

export default function KanbanBoardPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Full (drag a card, or Tab to it and press Space)">
        <div className={`${frame} h-[34rem]`}>
          <KanbanBoard onAdd={() => {}} />
        </div>
      </PreviewSection>

      <PreviewSection title="Filtered by a search">
        <div className={`${frame} h-80`}>
          <KanbanBoard query="insights" />
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
        <div className={`${frame} h-[28rem]`}>
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
