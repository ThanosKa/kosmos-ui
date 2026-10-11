'use client';

import { useState } from 'react';
import { KanbanBoard, type KanbanTask } from '@/registry/kosmos/blocks/kanban-board/components/kanban-board';

const initialTasks: KanbanTask[] = [
  { id: 'KOS-121', columnId: 'backlog', title: 'Add CSV export to the reports table', labels: ['Feature'], due: 'Oct 28' },
  { id: 'KOS-125', columnId: 'backlog', title: 'Write the migration guide for v2', labels: ['Docs'] },
  {
    id: 'KOS-131',
    columnId: 'todo',
    title: 'Rate-limit the public search endpoint',
    labels: ['Backend'],
    due: 'Oct 18',
    assignee: { name: 'Sam Rivera', initials: 'SR' },
    comments: 3,
  },
  {
    id: 'KOS-140',
    columnId: 'in-progress',
    title: 'Redesign the onboarding checklist',
    labels: ['Design'],
    due: 'Oct 16',
    assignee: { name: 'Maya Chen', initials: 'MC' },
    comments: 5,
  },
  { id: 'KOS-109', columnId: 'done', title: 'Ship dark mode for the dashboard', labels: ['Feature'], assignee: { name: 'Leo Park', initials: 'LP' } },
];

export default function KanbanBoardDemo() {
  const [tasks, setTasks] = useState(initialTasks);
  const [next, setNext] = useState(150);

  return (
    <div className="flex h-[28rem] w-full min-w-0">
      <KanbanBoard
        tasks={tasks}
        onTasksChange={setTasks}
        onAddTask={(columnId) => {
          setTasks([...tasks, { id: `KOS-${next}`, columnId, title: 'Untitled task' }]);
          setNext(next + 1);
        }}
      />
    </div>
  );
}
