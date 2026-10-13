'use client';

import { useState } from 'react';
import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';

const steps: PlanStep[] = [
  { id: 'events', label: 'Pull Q3 usage events', status: 'done', detail: '48,210 events' },
  { id: 'seats', label: 'Compare seats with the contract', status: 'done' },
  { id: 'quota', label: 'Flag projects over quota', status: 'done', detail: '3 projects' },
];

export default function PlanChecklistControlled() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <PlanChecklist title="Prepare the Q3 usage review for Acme Inc." steps={steps} open={open} onOpenChange={setOpen} />
      <p className="px-1 text-small text-muted-foreground">The list is {open ? 'open' : 'closed'}.</p>
    </div>
  );
}
