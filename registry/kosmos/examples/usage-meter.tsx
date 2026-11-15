'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { UsageMeter, type UsageBreakdownRow } from '@/registry/kosmos/ui/usage-meter';

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

export default function UsageMeterPreview() {
  return (
    <PreviewStack>
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
    </PreviewStack>
  );
}
