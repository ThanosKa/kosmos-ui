'use client';

import { Database } from 'lucide-react';
import { RunTimeline, sampleRun, type RunStep } from '@/registry/kosmos/blocks/run-timeline/run-timeline';
import { AssistantMessage } from '@/registry/kosmos/ui/assistant-message';
import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';
import { PromptComposer } from '@/registry/kosmos/ui/prompt-composer';
import { Reasoning } from '@/registry/kosmos/ui/reasoning';
import { ToolApproval, type ApprovalDecision } from '@/registry/kosmos/ui/tool-approval';
import { ToolCall } from '@/registry/kosmos/ui/tool-call';
import { UsageMeter } from '@/registry/kosmos/ui/usage-meter';
import type { GalleryItem } from '../gallery';
import { Stage, at, typed } from '../stage';

const prompt = 'Why did signups drop last Tuesday?';
const answer = 'Signups fell 18% on Tuesday. Almost all of it came from one release: the Android build from Monday stopped sending the signup event.';
const models = [
  { id: 'sonnet', name: 'Claude Sonnet 5.5', hint: 'Balanced' },
  { id: 'haiku', name: 'Claude Haiku 5', hint: 'Fast' },
];

const planSteps: PlanStep[] = [
  { id: 'schema', label: 'Read the events schema', status: 'pending', detail: '12 tables' },
  { id: 'join', label: 'Join events to users', status: 'pending', detail: '1.2M rows' },
  { id: 'rollup', label: 'Build the daily rollup', status: 'pending' },
  { id: 'alerts', label: 'Add the signup alert', status: 'pending' },
  { id: 'report', label: 'Send the weekly summary', status: 'pending' },
];

const frame = 'flex h-full w-full flex-col justify-center gap-3 p-5';

export const promptComposerCard: GalleryItem = {
  id: 'composer',
  title: 'Prompt composer',
  description: 'Type, attach, pick a model. Send turns into Stop while the reply streams.',
  href: '/docs/components/prompt-composer',
  stage: (
    <Stage base={320} interval={70} staticTick={40}>
      {(tick) => {
        const t = at(tick, 76);
        return (
          <div className={frame}>
            <AssistantMessage role="user" className="opacity-100">
              Summarise last week&apos;s funnel
            </AssistantMessage>
            <PromptComposer
              value={typed(prompt, t)}
              onValueChange={() => {}}
              onSubmit={() => {}}
              status={t > 60 ? 'streaming' : 'idle'}
              models={models}
              defaultModel="sonnet"
              placeholder="Ask anything"
              className="w-full"
            />
          </div>
        );
      }}
    </Stage>
  ),
};

export const assistantMessageCard: GalleryItem = {
  id: 'message',
  title: 'Assistant message',
  description: 'A reply streams in, then its actions, sources and follow-ups appear.',
  href: '/docs/components/assistant-message',
  stage: (
    <Stage base={400} interval={60} staticTick={90}>
      {(tick) => {
        const t = at(tick, 150);
        const done = t > 100;
        return (
          <div className="flex h-full flex-col justify-center gap-3 p-5">
            <AssistantMessage role="user">{prompt}</AssistantMessage>
            <AssistantMessage key={done ? 'done' : 'live'} status={done ? 'done' : 'streaming'} model="Sonnet 5.5" followUps={done ? ['Which build?'] : undefined}>
              {typed(answer, t * 2)}
            </AssistantMessage>
          </div>
        );
      }}
    </Stage>
  ),
};

export const reasoningCard: GalleryItem = {
  id: 'thinking',
  title: 'Reasoning',
  description: 'A shimmer while the agent thinks, then a line you can open to read it.',
  href: '/docs/components/reasoning',
  stage: (
    <Stage base={380} interval={900} staticTick={6}>
      {(tick) => {
        const t = at(tick, 9);
        const thinking = t < 6;
        const steps = ['Read the signup events', 'Split them by app version', 'Compare Monday with Tuesday'].map((label, index) => ({ label, done: t > index * 2 + 1 || !thinking }));
        return (
          <div className="flex h-full flex-col justify-center gap-4 p-5">
            <Reasoning status={thinking ? 'thinking' : 'done'} durationMs={4200} steps={steps} open />
            <p className="min-h-15 text-body text-pretty text-foreground">{thinking ? null : typed('Android 4.2.1 stopped sending the signup event on Monday at 09:40.', (t - 6) * 30)}</p>
          </div>
        );
      }}
    </Stage>
  ),
};

export const toolCallCard: GalleryItem = {
  id: 'tool',
  title: 'Tool call',
  description: 'Running, done, then open to the input and output as JSON.',
  href: '/docs/components/tool-call',
  stage: (
    <Stage base={580} interval={1000} staticTick={5}>
      {(tick) => {
        const t = at(tick, 9);
        return (
          <div className="flex h-full items-center p-5">
            <ToolCall
              className="w-full rounded-xl border border-transparent bg-card p-3 shadow-card"
              name="events.query"
              title="Query signups, last 7 days"
              icon={Database}
              status={t < 2 ? 'running' : 'done'}
              durationMs={t < 2 ? undefined : 1480}
              open={t >= 4 && t < 8}
              input={{ event: 'signup', range: '7d' }}
              output={{ rows: 42 }}
            />
          </div>
        );
      }}
    </Stage>
  ),
};

export const planChecklistCard: GalleryItem = {
  id: 'plan',
  title: 'Plan checklist',
  description: 'Follow an agent step by step, from pending to done.',
  href: '/docs/components/plan-checklist',
  stage: (
    <Stage base={380} interval={1100} staticTick={2}>
      {(tick) => {
        const done = at(tick, 7);
        const steps = planSteps.map((step, index) => ({ ...step, status: index < done ? ('done' as const) : index === done ? ('running' as const) : ('pending' as const) }));
        return (
          <div className="flex h-full items-center p-5">
            <PlanChecklist title="Set up Acme analytics" steps={steps} defaultOpen collapseWhenDone={false} className="w-full max-w-none" />
          </div>
        );
      }}
    </Stage>
  ),
};

export const toolApprovalCard: GalleryItem = {
  id: 'approval',
  title: 'Tool approval',
  description: 'The agent asks before it acts. Allow, and the card folds into a record.',
  href: '/docs/components/tool-approval',
  stage: (
    <Stage base={440} interval={900} staticTick={1}>
      {(tick) => {
        const t = at(tick, 7);
        const decision: ApprovalDecision | undefined = t >= 3 ? 'allow-once' : undefined;
        return (
          <div className="flex h-full items-center p-5">
            <ToolApproval
              title="Send the weekly summary?"
              tool="email.send"
              description="Emails the funnel report to 14 teammates."
              details={[{ label: 'To', value: 'team@acme.example' }]}
              status={t < 2 ? 'pending' : t === 2 ? 'submitting' : 'decided'}
              decision={decision}
              decidedBy="Lena"
              decidedAt="14:03"
              onDecide={() => {}}
            />
          </div>
        );
      }}
    </Stage>
  ),
};

export const runTimelineCard: GalleryItem = {
  id: 'run',
  title: 'Run timeline',
  description: 'An agent run as it happens, with its plan ticking off, tokens and cost.',
  href: '/docs/blocks/run-timeline',
  stage: (
    <Stage base={600} interval={1500} staticTick={3}>
      {(tick) => {
        const finished = at(tick, 5) + 1;
        const [plan] = sampleRun.steps;
        const advancing = {
          ...plan,
          steps: planSteps.map((step, index) => ({ ...step, status: index < finished ? ('done' as const) : index === finished ? ('running' as const) : ('pending' as const) })),
        } as RunStep;
        return (
          <div className="flex h-full items-center p-5">
            <RunTimeline run={{ ...sampleRun, status: 'running', steps: [advancing] }} />
          </div>
        );
      }}
    </Stage>
  ),
};

export const usageMeterCard: GalleryItem = {
  id: 'usage',
  title: 'Usage meter',
  description: 'Context fills as the thread grows, and warns before the limit.',
  href: '/docs/components/usage-meter',
  stage: (
    <Stage base={340} interval={700} staticTick={4}>
      {(tick) => {
        const t = at(tick, 12);
        return (
          <div className="flex h-full items-center p-5">
            <UsageMeter
              variant="inline"
              limit={200_000}
              breakdown={[
                { label: 'System prompt', value: 12_000 },
                { label: 'Tools', value: 18_000 + t * 4_000 },
                { label: 'Messages', value: 30_000 + t * 11_000 },
                { label: 'Files', value: 8_000 + t * 3_000 },
              ]}
              className="w-full"
            />
          </div>
        );
      }}
    </Stage>
  ),
};
