'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { UsageMeter, type UsageBreakdownRow } from '@/registry/kosmos/ui/usage-meter';
import { DataSetPreview } from '@/components/preview/data-set-preview';

const LIMIT = 200_000;

function rows(dataSources: number, conversation: number): UsageBreakdownRow[] {
  return [
    { label: 'System prompt', value: 2400 },
    { label: 'Tool definitions', value: 6100 },
    { label: 'Rules', value: 1800 },
    { label: 'Skills', value: 3200 },
    { label: 'Connected data sources', value: dataSources },
    { label: 'Subagent definitions', value: 900 },
    { label: 'Conversation', value: conversation },
  ];
}

const empty: UsageBreakdownRow[] = [];
const low = rows(1100, 1900);
const half = rows(24_000, 61_600);
const near = rows(38_000, 117_600);
const critical = rows(46_200, 133_400);
const over = rows(52_000, 175_600);
const single: UsageBreakdownRow[] = [{ label: 'Conversation', value: 38_400 }];
const longLabel: UsageBreakdownRow[] = [
  { label: 'System prompt', value: 2400 },
  { label: 'Weekly summary instructions for the Acme Staging workspace and its twelve projects', value: 9400 },
  { label: 'Conversation', value: 12_300 },
];

const rings = [
  { label: '0%, nothing used', breakdown: empty },
  { label: '9%', breakdown: low },
  { label: '50%', breakdown: half },
  { label: '85%, near limit', breakdown: near },
  { label: '97%, almost full', breakdown: critical },
  { label: '121%, over the limit', breakdown: over },
];

const stages: { label: string; breakdown: UsageBreakdownRow[]; title?: string }[] = [
  { label: '9%, seven categories (every color)', breakdown: low },
  { label: '85%, near limit', breakdown: near },
  { label: '97%, almost full', breakdown: critical },
  { label: 'one category', breakdown: single },
  { label: 'long category label', breakdown: longLabel },
  {
    label: 'long title, almost full',
    breakdown: critical,
    title: 'Context usage, Claude Opus 5.5 in the Acme Staging workspace',
  },
  { label: 'nothing used yet', breakdown: empty },
  { label: '121%, over the limit', breakdown: over },
];

const stageClass = 'h-[25rem]';

function Normal() {
  return (
    <>
      <PreviewSection title="Ring trigger">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-4">
          {rings.map((ring) => (
            <li key={ring.label} className="flex flex-col items-start gap-2">
              <span className="text-caption text-muted-foreground">{ring.label}</span>
              <UsageMeter breakdown={ring.breakdown} limit={LIMIT} />
            </li>
          ))}
        </ul>
      </PreviewSection>

      <PreviewSection title="Panel open">
        <OverlayStageGrid>
          {stages.map((stage) => (
            <OverlayStage key={stage.label} label={stage.label} className={stageClass}>
              {(container) => (
                <UsageMeter
                  label={stage.title}
                  breakdown={stage.breakdown}
                  limit={LIMIT}
                  open
                  modal={false}
                  container={container}
                />
              )}
            </OverlayStage>
          ))}
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Inline">
        <div className="grid gap-6 md:grid-cols-2">
          <UsageMeter variant="inline" breakdown={low} limit={LIMIT} />
          <UsageMeter variant="inline" breakdown={critical} limit={LIMIT} label="Context usage, Claude Opus 5.5" />
          <div className="max-w-60">
            <UsageMeter variant="inline" breakdown={longLabel} limit={LIMIT} />
          </div>
          <UsageMeter variant="inline" breakdown={over} limit={LIMIT} />
        </div>
      </PreviewSection>
    </>
  );
}

const crowded: UsageBreakdownRow[] = Array.from({ length: 24 }, (_, index) => ({ label: `Connected data source ${index + 1}`, value: 1_000 + index * 137 }));
const huge: UsageBreakdownRow[] = [
  { label: 'Conversation', value: 1_284_903_772 },
  { label: 'Ιστότοπος καφέ Saltmarsh, tool definitions 🌊', value: 6_100 },
  { label: 'K', value: 1 },
];
const worstStages: { label: string; breakdown: UsageBreakdownRow[]; limit: number; title?: string }[] = [
  { label: 'twenty-four categories', breakdown: crowded, limit: LIMIT },
  { label: 'billions of tokens, a one-letter label', breakdown: huge, limit: 2_000_000_000 },
  { label: 'a limit of zero', breakdown: single, limit: 0 },
  { label: 'a long title and a long label', breakdown: longLabel, limit: LIMIT, title: 'Context usage, Claude Opus 5.5 in the Acme Staging workspace for the EU data region' },
];

function Worst() {
  return (
    <>
      <PreviewSection title="Ring trigger: a limit of zero and billions">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-4">
          {worstStages.map((stage) => (
            <li key={stage.label} className="flex flex-col items-start gap-2">
              <span className="text-caption text-muted-foreground">{stage.label}</span>
              <UsageMeter breakdown={stage.breakdown} limit={stage.limit} />
            </li>
          ))}
        </ul>
      </PreviewSection>

      <PreviewSection title="Panel open">
        <OverlayStageGrid>
          {worstStages.map((stage) => (
            <OverlayStage key={stage.label} label={stage.label} className={stageClass}>
              {(container) => <UsageMeter label={stage.title} breakdown={stage.breakdown} limit={stage.limit} open modal={false} container={container} />}
            </OverlayStage>
          ))}
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Inline, in a narrow slot">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="max-w-60">
            <UsageMeter variant="inline" breakdown={huge} limit={2_000_000_000} />
          </div>
          <div className="max-w-60">
            <UsageMeter variant="inline" breakdown={single} limit={0} />
          </div>
        </div>
      </PreviewSection>
    </>
  );
}

export default function UsageMeterPreview() {
  return (
    <DataSetPreview
      demo={
        <PreviewStack>
          <Normal />
        </PreviewStack>
      }
      worst={
        <PreviewStack>
          <Worst />
        </PreviewStack>
      }
    />
  );
}
