'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { cn } from '@/registry/kosmos/lib/cn';
import type { ModelEffort, ModelOption } from '@/registry/kosmos/ui/model-select';
import {
  PromptComposer,
  type PromptComposerAttachment,
  type PromptComposerProps,
  type PromptComposerStatus,
} from '@/registry/kosmos/ui/prompt-composer';

const models: ModelOption[] = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', hint: 'Most capable' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', hint: 'Balanced' },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', hint: 'Fastest' },
];

const efforts: ModelEffort[] = ['low', 'medium', 'high'];

const context = {
  limit: 200_000,
  breakdown: [
    { label: 'System prompt', value: 2400 },
    { label: 'Tool definitions', value: 6100 },
    { label: 'Workspace rules', value: 1800 },
    { label: 'Connected data sources', value: 9800 },
    { label: 'Conversation', value: 24_260 },
  ],
};

const nearLimit = {
  limit: 200_000,
  breakdown: [...context.breakdown.slice(0, 4), { label: 'Conversation', value: 152_000 }],
};

const typed = 'Summarize the last 7 days of events for Cirrus Weather and flag projects near their quota.';

const csv: PromptComposerAttachment = { id: 'a1', name: 'cirrus-events-30d.csv', size: 2_400_000, kind: 'table' };
const chart: PromptComposerAttachment = { id: 'a2', name: 'events-dashboard.png', size: 640_000, kind: 'image' };
const brief: PromptComposerAttachment = {
  id: 'a3',
  name: 'acme-weekly-summary-draft-for-the-growth-and-platform-teams-v4-final.pdf',
  size: 18_200_000,
  kind: 'file',
};
const notes: PromptComposerAttachment = { id: 'a4', name: 'notes.txt', size: 300, kind: 'file' };

const longText = [
  'Compare active users across Copperline Bank, Cirrus Weather and Ironbark Logistics.',
  'Break the numbers down by plan and by platform.',
  'Flag any project where events dropped more than 15% week over week.',
  'Ask Tomás Ortega whether the server projects changed their batching.',
  'Check whether the nightly event rollup ran on Monday.',
  'Draft a short note for Lena Park with the three biggest changes.',
  'Keep the table sorted by event volume, highest first.',
  'List the five events with the largest week-over-week change.',
  'Group the events by project and mark any that are no longer sent.',
  'Add the median session length for each project.',
  'End with one recommendation for the next month.',
].join('\n');

const noop = () => {};

const full: Partial<PromptComposerProps> = {
  onAttach: noop,
  models,
  defaultModel: 'claude-sonnet-5-5',
  efforts,
  context,
};

function Frame({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <figure className={cn('flex w-full max-w-2xl min-w-0 flex-col gap-2', className)}>
      <figcaption className="font-mono text-caption text-muted-foreground">{label}</figcaption>
      {children}
    </figure>
  );
}

function Interactive() {
  const [status, setStatus] = useState<PromptComposerStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <PromptComposer
      {...full}
      status={status}
      defaultAttachments={[csv]}
      onSubmit={() => {
        setStatus('submitting');
        timer.current = setTimeout(() => {
          setStatus('streaming');
          timer.current = setTimeout(() => setStatus('idle'), 2500);
        }, 800);
      }}
      onStop={() => {
        clearTimeout(timer.current);
        setStatus('idle');
      }}
    />
  );
}

export default function PromptComposerPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="States">
        <Frame label="empty, Send disabled">
          <PromptComposer {...full} onSubmit={noop} />
        </Frame>
        <Frame label="typed, two attachments, Send enabled">
          <PromptComposer {...full} onSubmit={noop} defaultValue={typed} defaultAttachments={[csv, chart]} />
        </Frame>
        <Frame label="submitting, Send spins">
          <PromptComposer {...full} onSubmit={noop} status="submitting" defaultValue={typed} />
        </Frame>
        <Frame label="streaming, Stop shown, next message typed">
          <PromptComposer {...full} onSubmit={noop} onStop={noop} status="streaming" defaultValue="Then chart it by week." />
        </Frame>
        <Frame label="error">
          <PromptComposer
            {...full}
            onSubmit={noop}
            defaultValue={typed}
            error="copperline-raw-events.zip is over the 25 MB limit. Split it into smaller files and attach them again."
          />
        </Frame>
        <Frame label="disabled, with a reason">
          <PromptComposer
            {...full}
            onSubmit={noop}
            defaultAttachments={[csv]}
            disabled
            disabledReason="Acme has used this month's agent budget. Lena Park can raise it in Settings."
          />
        </Frame>
        <Frame label="context near the limit">
          <PromptComposer {...full} context={nearLimit} onSubmit={noop} />
        </Frame>
      </PreviewSection>

      <PreviewSection title="Parts">
        <Frame label="text and Send only">
          <PromptComposer onSubmit={noop} placeholder="Ask about your Acme projects…" />
        </Frame>
        <Frame label="on a card">
          <div className="rounded-2xl border border-transparent bg-card p-4 shadow-card">
            <PromptComposer {...full} onSubmit={noop} defaultAttachments={[csv]} />
          </div>
        </Frame>
      </PreviewSection>

      <PreviewSection title="Long content">
        <Frame label="long text at max height, scrolls">
          <PromptComposer {...full} onSubmit={noop} defaultValue={longText} />
        </Frame>
        <Frame label="long and many attachments, wrapping">
          <PromptComposer {...full} onSubmit={noop} defaultAttachments={[csv, brief, chart, notes]} />
        </Frame>
        <Frame label="narrow container, 320px" className="max-w-80">
          <PromptComposer {...full} onSubmit={noop} defaultValue={typed} defaultAttachments={[csv, brief]} />
        </Frame>
      </PreviewSection>

      <PreviewSection title="Live">
        <Frame label="Enter sends, 0.8s sending, a 2.5s answer, then idle; Escape stops">
          <Interactive />
        </Frame>
      </PreviewSection>
    </PreviewStack>
  );
}
