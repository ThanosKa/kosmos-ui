'use client';

import { useState } from 'react';
import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';

const steps: PlanStep[] = [
  { id: 'events', label: 'Pull the last 7 days of events', status: 'done', detail: '6,838,800 events' },
  { id: 'seats', label: 'Compare each project with its plan', status: 'done' },
  { id: 'quota', label: 'Flag projects near their quota', status: 'done', detail: '3 projects' },
];

export default function PlanChecklistControlled() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <PlanChecklist title="Prepare the weekly summary for Acme" steps={steps} open={open} onOpenChange={setOpen} />
      <p className="px-1 text-small text-muted-foreground">The list is {open ? 'open' : 'closed'}.</p>
    </div>
  );
}
