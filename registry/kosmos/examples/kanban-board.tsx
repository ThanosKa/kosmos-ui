'use client';

import type { ReactNode } from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { KanbanBoard, KanbanCard, type KanbanTask } from '@/registry/kosmos/blocks/kanban-board/components/kanban-board';

const longTasks: KanbanTask[] = [
  {
    id: 'KOS-201',
    columnId: 'backlog',
    title:
      'Investigate why the weekly digest email is sent twice to workspace owners who belong to more than one organization and also manage billing',
    labels: ['Bug', 'Email', 'Billing', 'Needs triage'],
    due: 'Nov 30',
    assignee: { name: 'Maya Chen', initials: 'MC' },
    comments: 128,
  },
  { id: 'KOS-202', columnId: 'backlog', title: 'Supercalifragilisticexpialidocious-configuration-flag-cleanup', labels: ['Chore'] },
  { id: 'KOS-203', columnId: 'todo', title: 'Short', assignee: { name: 'Leo Park', initials: 'LP' } },
];

const sampleCard: KanbanTask = {
  id: 'KOS-142',
  columnId: 'in-progress',
  title: 'Fix the billing date in the invoice email',
  labels: ['Bug'],
  due: 'Oct 14',
  assignee: { name: 'Leo Park', initials: 'LP' },
  comments: 2,
};

function Frame({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={className ?? 'flex h-[32rem] w-full min-w-0'}>{children}</div>;
}

export default function KanbanBoardPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Full (drag a card, or Tab to it and press Space)">
        <Frame>
          <KanbanBoard onAddTask={() => {}} />
        </Frame>
      </PreviewSection>

      <PreviewSection title="Loading">
        <Frame className="flex h-72 w-full min-w-0">
          <KanbanBoard loading />
        </Frame>
      </PreviewSection>

      <PreviewSection title="Empty">
        <Frame className="flex h-48 w-full min-w-0">
          <KanbanBoard defaultTasks={[]} onAddTask={() => {}} />
        </Frame>
      </PreviewSection>

      <PreviewSection title="Long text">
        <Frame className="flex h-96 w-full min-w-0">
          <KanbanBoard defaultTasks={longTasks} />
        </Frame>
      </PreviewSection>

      <PreviewSection title="Card states: resting, lifted while dragged, the slot it leaves">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <KanbanCard task={sampleCard} />
          <KanbanCard task={sampleCard} lifted />
          <KanbanCard task={sampleCard} placeholder />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
