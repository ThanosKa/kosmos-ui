'use client';

import * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Reasoning } from '@/registry/kosmos/ui/reasoning';

const sample =
  'Acme Inc. has 14 projects. Three are above 90% of their event quota: Checkout, Mobile and Partner API. The plan renews in November, so the Admin should see this before the renewal call.';

const longText = Array.from(
  { length: 6 },
  (_, i) =>
    `${i + 1}. ${sample} The Analyst asked for revenue by region, so I compared Q3 against Q2 for every project before picking the three with the steepest growth.`,
).join('\n\n');

const steps = [
  { label: 'Read the Q3 event totals', done: true },
  { label: 'Compare quota use across projects', done: true },
  { label: 'Draft the summary for the Admin', done: false },
  { label: 'Suggest a new quota for each project', done: false },
];

const cells = [
  { status: 'thinking', open: false },
  { status: 'thinking', open: true },
  { status: 'done', open: false },
  { status: 'done', open: true },
] as const;

function Streaming() {
  const [length, setLength] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setLength((n) => (n >= sample.length ? 0 : n + 3)), 60);
    return () => window.clearInterval(id);
  }, []);
  return (
    <Reasoning status="thinking" defaultOpen>
      {sample.slice(0, length)}
    </Reasoning>
  );
}

export default function ReasoningPreview() {
  return (
    <PreviewStack>
      <div className="grid gap-10 md:grid-cols-2">
        {cells.map(({ status, open }) => (
          <PreviewSection key={`${status}-${open}`} title={`${status}, ${open ? 'open' : 'collapsed'}`}>
            <Reasoning status={status} durationMs={12000} defaultOpen={open}>
              {sample}
            </Reasoning>
          </PreviewSection>
        ))}
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <PreviewSection title="Streaming, follows the bottom">
          <Streaming />
        </PreviewSection>

        <PreviewSection title="Durations">
          <div className="flex flex-col">
            <Reasoning status="done" durationMs={400}>
              {sample}
            </Reasoning>
            <Reasoning status="done" durationMs={4200}>
              {sample}
            </Reasoning>
            <Reasoning status="done" durationMs={125000}>
              {sample}
            </Reasoning>
          </div>
        </PreviewSection>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <PreviewSection title="Steps, thinking">
          <Reasoning status="thinking" steps={steps} />
        </PreviewSection>

        <PreviewSection title="Steps, stopped early, open">
          <Reasoning status="done" durationMs={9000} defaultOpen steps={steps} />
        </PreviewSection>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <PreviewSection title="Long text scrolls">
          <Reasoning status="done" durationMs={48000} defaultOpen>
            {longText}
          </Reasoning>
        </PreviewSection>

        <PreviewSection title="Narrow slot">
          <div className="w-full max-w-48">
            <Reasoning status="done" durationMs={125000} defaultOpen>
              {sample}
            </Reasoning>
          </div>
        </PreviewSection>
      </div>
    </PreviewStack>
  );
}
