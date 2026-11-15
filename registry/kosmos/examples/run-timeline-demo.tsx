'use client';

import { Send } from 'lucide-react';
import * as React from 'react';
import { RunTimeline, sampleRun, type Run, type RunStep } from '@/registry/kosmos/blocks/run-timeline/run-timeline';
import { Button } from '@/registry/kosmos/ui/button';
import type { PlanStep } from '@/registry/kosmos/ui/plan-checklist';
import type { ApprovalDecision, ToolApprovalProps } from '@/registry/kosmos/ui/tool-approval';

const answer =
  'Hollow Oak Games sent 96,200 events up to 18 September and none since. The project was paused that day, so nothing is wrong with its SDK. The findings are with Tomás, Ama and Kai.';

function publishStep(offsetMs: number, done: boolean): RunStep {
  return {
    id: 'publish',
    offsetMs,
    kind: 'tool',
    call: {
      name: 'email.send',
      title: 'Email the findings to the Acme team',
      icon: Send,
      status: done ? 'done' : 'running',
      durationMs: done ? 1_400 : undefined,
      input: { to: 'tomas@acme.example, ama@acme.example, kai@acme.example', subject: 'Hollow Oak Games: events stopped on 18 September' },
      output: done ? 'Sent to 3 people' : undefined,
    },
  };
}

function setPlan(steps: RunStep[], statuses: PlanStep['status'][]): RunStep[] {
  return steps.map((step) =>
    step.kind === 'plan'
      ? { ...step, steps: step.steps.map((item, index) => ({ ...item, status: statuses[index] ?? item.status })) }
      : step,
  );
}

function patchApproval(steps: RunStep[], patch: Partial<ToolApprovalProps>): RunStep[] {
  return steps.map((step) => (step.kind === 'approval' ? { ...step, approval: { ...step.approval, ...patch } } : step));
}

function clockAt(run: Run) {
  const [hours = 0, minutes = 0, seconds = 0] = run.startedAt.split(':').map(Number);
  const total = hours * 3600 + minutes * 60 + seconds + Math.floor(run.elapsedMs / 1000);
  return `${String(Math.floor(total / 3600) % 24).padStart(2, '0')}:${String(Math.floor((total % 3600) / 60)).padStart(2, '0')}`;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function RunTimelineDemo() {
  const [run, setRun] = React.useState(sampleRun);
  const [attempt, setAttempt] = React.useState(0);
  const generation = React.useRef(0);

  React.useEffect(() => {
    if (run.status !== 'running' && run.status !== 'waiting') return;
    const timer = setInterval(() => setRun((current) => ({ ...current, elapsedMs: current.elapsedMs + 1000 })), 1000);
    return () => clearInterval(timer);
  }, [run.status]);

  React.useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );

  async function later(ms: number, change: (current: Run) => Run) {
    const own = generation.current;
    await wait(ms);
    if (own !== generation.current) return false;
    setRun(change);
    return true;
  }

  function reset() {
    generation.current++;
    setRun(sampleRun);
    setAttempt((current) => current + 1);
  }

  function stop() {
    generation.current++;
    setRun((current) => ({
      ...current,
      status: 'cancelled',
      steps: current.steps
        .filter((step) => step.kind !== 'approval' || step.approval.status === 'decided')
        .map((step) =>
          step.kind === 'plan'
            ? {
                ...step,
                steps: step.steps.map((item) =>
                  item.status === 'running' || item.status === 'pending' ? { ...item, status: 'skipped' as const } : item,
                ),
              }
            : step,
        ),
    }));
  }

  async function decide(_stepId: string, decision: ApprovalDecision) {
    setRun((current) => ({ ...current, steps: patchApproval(current.steps, { status: 'submitting', decision }) }));
    const decided = await later(900, (current) => ({
      ...current,
      status: 'running',
      steps: patchApproval(current.steps, { status: 'decided', decidedBy: 'Lena Park', decidedAt: clockAt(current) }),
    }));
    if (!decided) return;

    if (decision === 'deny') {
      await later(1000, (current) => ({
        ...current,
        status: 'done',
        tokens: current.tokens + 640,
        steps: [
          ...setPlan(current.steps, ['done', 'done', 'done', 'skipped', 'skipped']),
          {
            id: 'answer',
            offsetMs: current.elapsedMs,
            kind: 'message',
            text: 'The findings stay a draft. Hollow Oak Games sent no events after the project was paused on 18 September.',
          },
        ],
      }));
      return;
    }

    const started = await later(1000, (current) => ({
      ...current,
      tokens: current.tokens + 1_120,
      costUsd: current.costUsd + 0.01,
      steps: [...current.steps, publishStep(current.elapsedMs, false)],
    }));
    if (!started) return;
    await later(1600, (current) => ({
      ...current,
      status: 'done',
      tokens: current.tokens + 2_480,
      costUsd: current.costUsd + 0.03,
      steps: [
        ...setPlan(current.steps, ['done', 'done', 'done', 'done', 'done']).map((step) =>
          step.id === 'publish' ? publishStep(step.offsetMs, true) : step,
        ),
        { id: 'answer', offsetMs: current.elapsedMs, kind: 'message', text: answer },
      ],
    }));
  }

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <RunTimeline key={attempt} run={run} onDecide={decide} onStop={stop} />
      {run.status === 'done' || run.status === 'cancelled' ? (
        <Button variant="ghost" size="sm" onClick={reset}>
          Start again
        </Button>
      ) : null}
    </div>
  );
}
