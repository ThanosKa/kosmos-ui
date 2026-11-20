'use client';

import { DataSetPreview } from '@/components/preview/data-set-preview';
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
  { id: 'emoji', title: '🚀 Launch checklist for the Japanese market: 日本語のドキュメントと価格表', column: 'planned', area: { label: 'Internationalization and localization', hue: 'violet' }, votes: 1284000, target: 'Q4 2026, pending the security review' },
  { id: 'rtl', title: 'دعم اللغة العربية في لوحة التحكم', column: 'in-progress', votes: 0, assignee: { name: 'ليلى', initials: 'ل' } },
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
  return <DataSetPreview demo={<Demo />} worst={<Worst />} />;
}

function Worst() {
  return (
    <PreviewStack>
      <PreviewSection title="Long text and extreme counts">
        <div className={`${frame} h-[28rem]`}>
          <KanbanBoard defaultItems={longItems} />
        </div>
      </PreviewSection>

      <PreviewSection title="Worst case in a narrow container">
        <div className={`${frame} h-[28rem] max-w-xs`}>
          <KanbanBoard defaultItems={longItems} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}

function Demo() {
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
