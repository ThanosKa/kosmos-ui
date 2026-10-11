'use client';

import { useState } from 'react';
import { KanbanBoard, type KanbanItem } from '@/registry/kosmos/blocks/kanban-board/kanban-board';

const initialItems: KanbanItem[] = [
  { id: 'lumen', name: 'Lumen Health', domain: 'lumenhealth.example', status: 'trial', owner: { name: 'Maya Chen', initials: 'MC' }, arr: 0, health: 55, lastActivity: '2026-10-11' },
  { id: 'northwind', name: 'Northwind Traders', domain: 'northwind.example', status: 'active', owner: { name: 'Maya Chen', initials: 'MC' }, arr: 184000, health: 86, lastActivity: '2026-10-10' },
  { id: 'orbit', name: 'Orbit Freight', domain: 'orbitfreight.example', status: 'active', owner: { name: 'Jonas Weber', initials: 'JW' }, arr: 238000, health: 91, lastActivity: '2026-10-09' },
  { id: 'bluebird', name: 'Bluebird Labs', domain: 'bluebird.example', status: 'at-risk', owner: { name: 'Jonas Weber', initials: 'JW' }, arr: 96500, health: 38, lastActivity: '2026-09-21' },
  { id: 'harbor', name: 'Harbor Savings Bank', domain: 'harborbank.example', status: 'churned', owner: { name: 'Priya Raman', initials: 'PR' }, arr: 0, health: 12, lastActivity: '2026-08-30' },
];

export default function KanbanBoardDemo() {
  const [items, setItems] = useState(initialItems);

  return (
    <div className="flex h-[26rem] w-full min-w-0">
      <KanbanBoard
        items={items}
        onItemsChange={setItems}
        onAdd={(status) => setItems([...items, { id: `new-${items.length}`, name: 'Untitled account', status }])}
      />
    </div>
  );
}
