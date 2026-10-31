'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import FlowChartDemo from '@/registry/kosmos/examples/flow-chart-demo';
import { FlowChart, type FlowChartFlow, type FlowChartNode } from '@/registry/kosmos/ui/flow-chart';

const sources: FlowChartNode[] = [
  { id: 'search', label: 'Search' },
  { id: 'direct', label: 'Direct' },
  { id: 'referral', label: 'Referral' },
  { id: 'social', label: 'Social' },
  { id: 'email', label: 'Email' },
];

const plans: FlowChartNode[] = [
  { id: 'free', label: 'Free' },
  { id: 'pro', label: 'Pro' },
  { id: 'scale', label: 'Scale' },
];

const signups: FlowChartFlow[] = [
  [392, 84, 6],
  [284, 80, 7],
  [176, 69, 3],
  [86, 11, 0],
  [64, 20, 2],
].flatMap((row, s) => row.map((value, p) => ({ source: sources[s].id, target: plans[p].id, value })));

const projects: FlowChartNode[] = [
  { id: 'brightloop', label: 'Brightloop Fitness and Wellness Studios, iOS and watchOS apps' },
  { id: 'copperline', label: 'Copperline Bank' },
  { id: 'ironbark', label: 'Ironbark Logistics' },
];

const platforms: FlowChartNode[] = [
  { id: 'ios', label: 'iOS, iPadOS and watchOS' },
  { id: 'server', label: 'Server' },
];

type Case = { title: string; sources: FlowChartNode[]; targets: FlowChartNode[]; flows: FlowChartFlow[] };

const cases: Case[] = [
  { title: 'Five sources to three plans', sources, targets: plans, flows: signups },
  {
    title: 'One flow',
    sources: sources.slice(0, 1),
    targets: plans.slice(0, 1),
    flows: [{ source: 'search', target: 'free', value: 392 }],
  },
  { title: 'Every value zero', sources, targets: plans, flows: signups.map((flow) => ({ ...flow, value: 0 })) },
  { title: 'No data', sources: [], targets: [], flows: [] },
  {
    title: 'Long labels and huge values',
    sources: projects,
    targets: platforms,
    flows: [
      { source: 'brightloop', target: 'ios', value: 2_468_013_579 },
      { source: 'copperline', target: 'server', value: 1_234_567_890 },
      { source: 'ironbark', target: 'server', value: 987_654_321 },
      { source: 'ironbark', target: 'ios', value: 12_480 },
    ],
  },
  {
    title: 'A source with no flows, and flows to unknown ids',
    sources,
    targets: plans,
    flows: [...signups.filter((flow) => flow.source !== 'social'), { source: 'ads', target: 'pro', value: 500 }],
  },
];

export default function FlowChartPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="In a chart card, with a range switch">
        <FlowChartDemo />
      </PreviewSection>

      <PreviewSection title="Data">
        <div className="grid w-full gap-8 sm:grid-cols-2">
          {cases.map(({ title, ...data }) => (
            <div key={title} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{title}</p>
              <FlowChart {...data} label={title} unit="signups" sourceLabel="Source" targetLabel="Plan" entrance="none" />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Entrance: always, session (default), none">
        <div className="grid w-full gap-8 lg:grid-cols-3">
          {(['always', 'session', 'none'] as const).map((entrance) => (
            <div key={entrance} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{entrance}</p>
              <FlowChart
                sources={sources}
                targets={plans}
                flows={signups}
                label={`New signups, ${entrance}`}
                unit="signups"
                sourceLabel="Source"
                targetLabel="Plan"
                entrance={entrance}
              />
            </div>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
