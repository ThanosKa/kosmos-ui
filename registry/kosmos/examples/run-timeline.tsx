'use client';

import { Database, Send } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { RunTimeline, sampleRun, type Run, type RunStep } from '@/registry/kosmos/blocks/run-timeline/run-timeline';
import type { PlanStep } from '@/registry/kosmos/ui/plan-checklist';

const frame = 'w-full rounded-xl border border-transparent bg-background p-4 shadow-card';

const planDetails: Record<string, string> = { '1': '212,840 sessions', '2': '8 cohorts' };

function withPlan(steps: RunStep[], statuses: PlanStep['status'][], details: Record<string, string> = {}): RunStep[] {
  return steps.map((step) =>
    step.kind === 'plan'
      ? {
          ...step,
          steps: step.steps.map((item, index) => {
            const status = statuses[index] ?? item.status;
            return { ...item, status, detail: details[item.id] ?? (status === 'done' ? planDetails[item.id] : undefined) };
          }),
        }
      : step,
  );
}

const publishStep: RunStep = {
  id: 'publish',
  offsetMs: 92_000,
  kind: 'tool',
  call: {
    name: 'reports.publish',
    title: 'Publish Mobile weekly retention',
    icon: Send,
    status: 'done',
    durationMs: 1_400,
    input: { report: 'mobile-weekly-retention', audience: 'team:mobile', schedule: 'MON 09:00' },
    output: 'Published to Mobile › Reports · 14 people notified',
  },
};

const finalMessage: RunStep = {
  id: 'answer',
  offsetMs: 97_000,
  kind: 'message',
  text: 'Week 1 retention is 41.2%, down 2.8 points on last week. The drop comes from Android users who installed during the September campaign. The report is in Mobile › Reports and refreshes every Monday.',
};

const completedRun: Run = {
  ...sampleRun,
  id: 'run_478',
  number: 478,
  status: 'done',
  startedAt: '09:14:02',
  elapsedMs: 318_000,
  tokens: 24_100,
  costUsd: 0.27,
  steps: [
    ...withPlan(sampleRun.steps, ['done', 'done', 'done', 'done', 'done']).map((step) =>
      step.kind === 'approval'
        ? {
            ...step,
            approval: { ...step.approval, status: 'decided' as const, decision: 'allow-once' as const, decidedBy: 'you', decidedAt: '09:15' },
          }
        : step,
    ),
    publishStep,
    finalMessage,
  ],
};

const runningRun: Run = {
  ...sampleRun,
  status: 'running',
  elapsedMs: 49_000,
  tokens: 9_870,
  costUsd: 0.11,
  steps: withPlan(sampleRun.steps, ['done', 'done', 'running', 'pending', 'pending'])
    .filter((step) => step.kind !== 'approval')
    .map((step) =>
      step.id === 'cohorts' && step.kind === 'tool'
        ? { ...step, call: { ...step.call, status: 'running' as const, durationMs: 8_000, output: undefined } }
        : step,
    ),
};

const failedRun: Run = {
  ...sampleRun,
  id: 'run_480',
  number: 480,
  status: 'failed',
  startedAt: '11:40:55',
  elapsedMs: 47_000,
  tokens: 6_310,
  costUsd: 0.07,
  error: {
    stepId: 'query',
    message: 'warehouse.query timed out after 30s while the warehouse was under heavy load. Nothing was written.',
  },
  steps: [
    ...withPlan(sampleRun.steps, ['error', 'pending', 'pending', 'pending', 'pending'], { '1': 'Timed out' }).slice(0, 2),
    {
      id: 'query',
      offsetMs: 14_000,
      kind: 'tool',
      call: {
        name: 'warehouse.query',
        title: 'Query Mobile sessions, last 8 weeks',
        icon: Database,
        status: 'error',
        durationMs: 30_000,
        input: { project: 'mobile', event: 'session_start', range: '2026-08-17..2026-10-11' },
        error: 'Timed out after 30s',
      },
    },
  ],
};

const cancelledRun: Run = {
  ...sampleRun,
  id: 'run_481',
  number: 481,
  status: 'cancelled',
  startedBy: { name: 'Admin' },
  startedAt: '13:20:41',
  elapsedMs: 21_000,
  tokens: 3_240,
  costUsd: 0.04,
  steps: withPlan(sampleRun.steps, ['done', 'skipped', 'skipped', 'skipped', 'skipped']).slice(0, 3),
};

const queuedRun: Run = {
  ...sampleRun,
  id: 'run_483',
  number: 483,
  title: 'Find the top churn signals for the Checkout project',
  status: 'queued',
  startedBy: { name: 'Admin' },
  startedAt: '14:06:40',
  elapsedMs: 0,
  tokens: 0,
  costUsd: 0,
  queuePosition: 2,
  steps: [],
};

const longRun: Run = {
  ...sampleRun,
  id: 'run_1048576',
  number: 1_048_576,
  title:
    'Reconcile every Acme Inc. invoice from the last four quarters against the warehouse ledger and flag mismatches over one cent for the finance team',
  status: 'running',
  startedBy: { name: 'Growth team, Europe and Middle East' },
  model: 'Claude Opus 5.5',
  elapsedMs: 7_384_000,
  tokens: 18_204_554_100,
  costUsd: 32_768.91,
  steps: [
    {
      id: 'think',
      offsetMs: 7_000_000,
      kind: 'reasoning',
      status: 'thinking',
      steps: [
        { label: 'Match invoices to ledger entries by invoice number and amount', done: true },
        { label: 'Look for entries split across two or more ledger lines', done: false },
        { label: 'Summarize mismatches by customer', done: false },
      ],
    },
    {
      id: 'export',
      offsetMs: 7_300_000,
      kind: 'tool',
      call: {
        name: 'warehouse.export_reconciliation_mismatches_to_shared_finance_folder',
        title: 'Export the mismatches over one cent to the shared finance folder for review',
        status: 'running',
        durationMs: 84_000,
        input: { folder: 'finance/reconciliation/2026-q3', threshold: 0.01 },
      },
    },
  ],
};

export default function RunTimelinePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Waiting for an approval">
        <div className={frame}>
          <RunTimeline />
        </div>
      </PreviewSection>

      <PreviewSection title="Running, a tool call in progress">
        <div className={frame}>
          <RunTimeline run={runningRun} />
        </div>
      </PreviewSection>

      <PreviewSection title="Done, folded to the summary">
        <div className={frame}>
          <RunTimeline run={completedRun} />
        </div>
      </PreviewSection>

      <PreviewSection title="Done, steps open">
        <div className={frame}>
          <RunTimeline run={completedRun} defaultStepsOpen />
        </div>
      </PreviewSection>

      <PreviewSection title="Failed on a tool error, with retry">
        <div className={frame}>
          <RunTimeline run={failedRun} />
        </div>
      </PreviewSection>

      <PreviewSection title="Cancelled by Admin">
        <div className={frame}>
          <RunTimeline run={cancelledRun} />
        </div>
      </PreviewSection>

      <PreviewSection title="Queued, no steps yet">
        <div className={frame}>
          <RunTimeline run={queuedRun} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text and extreme values">
        <div className={frame}>
          <RunTimeline run={longRun} />
        </div>
      </PreviewSection>

      <PreviewSection title="In a narrow container, running">
        <div className={`${frame} max-w-sm`}>
          <RunTimeline run={runningRun} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
