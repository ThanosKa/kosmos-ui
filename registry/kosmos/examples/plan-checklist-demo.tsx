'use client';

import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';

const proposed: PlanStep[] = [
  { id: 'events', label: 'Pull the last 7 days of events', status: 'pending' },
  { id: 'seats', label: 'Compare each project with its plan', status: 'pending' },
  { id: 'quota', label: 'Flag projects near their quota', status: 'pending' },
  { id: 'summary', label: 'Draft the summary for Lena Park', status: 'pending' },
  { id: 'review', label: 'Share it with the Acme team', status: 'pending' },
];

function advance(steps: PlanStep[]): PlanStep[] {
  const index = steps.findIndex((step) => step.status !== 'done');
  return steps.map((step, i) => {
    if (i !== index) return step;
    return { ...step, status: step.status === 'running' ? 'done' : 'running' };
  });
}

export default function PlanChecklistDemo() {
  const [steps, setSteps] = useState(proposed);
  const [running, setRunning] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const started = steps.some((step) => step.status !== 'pending');

  useEffect(() => {
    if (!running || steps.every((step) => step.status === 'done')) return;
    const timer = setTimeout(() => setSteps(advance), 900);
    return () => clearTimeout(timer);
  }, [running, steps]);

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <PlanChecklist
        key={attempt}
        title="Prepare the weekly summary for Acme"
        steps={steps}
        actions={
          started ? null : (
            <>
              <Button variant="primary" onClick={() => setRunning(true)}>
                Run plan
              </Button>
              <Button variant="secondary">Edit plan</Button>
            </>
          )
        }
      />
      {started ? (
        <Button
          variant="secondary"
          onClick={() => {
            setRunning(false);
            setSteps(proposed);
            setAttempt((count) => count + 1);
          }}
        >
          <RotateCcw aria-hidden data-icon="inline-start" />
          Start over
        </Button>
      ) : null}
    </div>
  );
}
