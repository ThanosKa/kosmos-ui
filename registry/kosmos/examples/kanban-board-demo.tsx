'use client';

import { useState } from 'react';
import { KanbanBoard, sampleRoadmapItems } from '@/registry/kosmos/blocks/kanban-board/kanban-board';

export default function KanbanBoardDemo() {
  const [items, setItems] = useState(sampleRoadmapItems);

  return (
    <div className="flex h-[30rem] w-full min-w-0">
      <KanbanBoard
        items={items}
        onItemsChange={setItems}
        onAdd={(column) => setItems([...items, { id: `new-${items.length}`, title: 'Untitled item', column, votes: 0 }])}
      />
    </div>
  );
}
