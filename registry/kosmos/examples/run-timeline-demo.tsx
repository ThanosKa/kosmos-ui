'use client';

import { Send } from 'lucide-react';
import * as React from 'react';
import { RunTimeline, sampleRun, type Run, type RunStep } from '@/registry/kosmos/blocks/run-timeline/run-timeline';
import { Button } from '@/registry/kosmos/ui/button';
import type { PlanStep } from '@/registry/kosmos/ui/plan-checklist';
import type { ApprovalDecision, ToolApprovalProps } from '@/registry/kosmos/ui/tool-approval';

const answer =
  'Week 1 retention is 41.2%, down 2.8 points on last week. The drop comes from Android users who installed during the September campaign. The report is in Mobile › Reports and refreshes every Monday.';

function publishStep(offsetMs: number, done: boolean): RunStep {
  return {
    id: 'publish',
    offsetMs,
    kind: 'tool',
    call: {
      name: 'reports.publish',
      title: 'Publish Mobile weekly retention',
      icon: Send,
      status: done ? 'done' : 'running',
      durationMs: done ? 1_400 : undefined,
      input: { report: 'mobile-weekly-retention', audience: 'team:mobile', schedule: 'MON 09:00' },
      output: done ? 'Published to Mobile › Reports · 14 people notified' : undefined,
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
      steps: patchApproval(current.steps, { status: 'decided', decidedBy: 'you', decidedAt: clockAt(current) }),
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
            text: 'The report stays a draft in your workspace. Week 1 retention is 41.2%, down 2.8 points on last week.',
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
