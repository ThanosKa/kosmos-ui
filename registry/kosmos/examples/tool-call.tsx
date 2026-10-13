'use client';

import { Database, Download, FileText, Gauge, Mail, Receipt } from 'lucide-react';
import * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { ToolCall } from '@/registry/kosmos/ui/tool-call';

const card = 'min-w-0 rounded-2xl border border-transparent bg-card p-2 shadow-card';

const queryInput = { project: 'cirrus', range: '2026-09-12..2026-10-11', metric: 'events' };

const dailyEvents = [
  73100, 73400, 65400, 65700, 66100, 66400, 66700, 75300, 75700, 67700, 68000, 68300, 68600, 69000, 77600, 77900, 69900,
  70300, 70600, 113500, 149600, 151800, 112300, 72200, 72500, 72900, 73200, 73500, 82100, 82400,
];

const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

const longOutput = Array.from(
  { length: dailyEvents.length },
  (_, i) =>
    `${dayLabel.format(Date.UTC(2026, 8, 12 + i))}  ${dailyEvents[i].toLocaleString('en-US')} events`,
).join('\n');

const states = ['default', 'hover', 'focus', 'active'] as const;

/** Pins an interaction state on the trigger inside, which ToolCall renders itself. */
function PinState({ state, children }: { state: (typeof states)[number]; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const trigger = ref.current?.querySelector('[data-slot="collapsible-trigger"]');
    if (trigger && state !== 'default') trigger.setAttribute('data-preview', state);
  }, [state]);
  return <div ref={ref}>{children}</div>;
}

function Cell({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-caption text-muted-foreground">{label}</p>
      <div className={className ?? card}>{children}</div>
    </div>
  );
}

export default function ToolCallPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="All six statuses, collapsed">
        <div className={card}>
          <div className="divide-y divide-border">
            <ToolCall
              name="events.query"
              title="Query the last 30 days of Cirrus Weather events"
              icon={Database}
              status="done"
              durationMs={1400}
              input={queryInput}
              output="30 rows · 2 columns"
            />
            <ToolCall
              name="events.scan"
              title="Scan the event stream"
              icon={Database}
              status="running"
              durationMs={2300}
              input={{ project: 'cirrus', platform: 'ios', window: '24h' }}
            />
            <ToolCall
              name="dashboards.export"
              title="Export the revenue dashboard"
              icon={FileText}
              status="queued"
              input={{ dashboard: 'Revenue by plan', format: 'pdf' }}
            />
            <ToolCall
              name="projects.update_plan"
              title="Raise Cirrus Weather to the Scale plan"
              icon={Gauge}
              status="awaiting-approval"
              input={{ project: 'cirrus', plan: 'scale' }}
            />
            <ToolCall
              name="email.send"
              title="Email the weekly summary to kai@acme.example"
              icon={Mail}
              status="denied"
              input={{ to: 'kai@acme.example', subject: 'Weekly summary' }}
              output="Denied by Tomás Ortega · 14:02"
            />
            <ToolCall
              name="events.export"
              title="Export Copperline Bank events"
              icon={Download}
              status="error"
              durationMs={30000}
              input={{ project: 'copperline', range: '2026-09-12..2026-10-11', limit: 500000 }}
              error="Timed out after 30s. Try again with a shorter range."
            />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Row states">
        <div className="grid gap-6 sm:grid-cols-2">
          {states.map((state) => (
            <Cell key={state} label={state}>
              <PinState state={state}>
                <ToolCall
                  name="events.query"
                  title="Query the last 30 days of Cirrus Weather events"
                  icon={Database}
                  status="done"
                  durationMs={1400}
                  input={queryInput}
                  output="30 rows · 2 columns"
                />
              </PinState>
            </Cell>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Open">
        <div className="grid gap-6 lg:grid-cols-2">
          <Cell label="Done, with input and output">
            <ToolCall
              name="events.query"
              title="Query the last 30 days of Cirrus Weather events"
              icon={Database}
              status="done"
              durationMs={1400}
              defaultOpen
              input={queryInput}
              output="30 rows · 2 columns"
            />
          </Cell>
          <Cell label="Error">
            <ToolCall
              name="events.export"
              title="Export Copperline Bank events"
              icon={Download}
              status="error"
              durationMs={30000}
              defaultOpen
              input={{ project: 'copperline', range: '2026-09-12..2026-10-11', limit: 500000 }}
              error="Timed out after 30s. Try again with a shorter range."
            />
          </Cell>
          <Cell label="Long output, scrolls">
            <ToolCall
              name="events.query"
              title="Daily events, September 12 to October 11"
              icon={Database}
              status="done"
              durationMs={125000}
              defaultOpen
              output={longOutput}
            />
          </Cell>
          <Cell label="Custom output in children">
            <ToolCall
              name="billing.revenue_by_plan"
              title="Revenue by plan"
              icon={Receipt}
              status="done"
              durationMs={820}
              defaultOpen
              input={{ sort: 'revenue' }}
            >
              <ul className="divide-y divide-border rounded-lg bg-muted px-3 text-small">
                {[
                  ['Scale', '$13,700'],
                  ['Pro', '$928'],
                  ['Free', '$0'],
                ].map(([plan, revenue]) => (
                  <li key={plan} className="flex justify-between gap-4 py-2">
                    <span>{plan}</span>
                    <span className="tabular-nums">{revenue}</span>
                  </li>
                ))}
              </ul>
            </ToolCall>
          </Cell>
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow and long">
        <div className="grid gap-6 lg:grid-cols-2">
          <Cell label="Long titles in a 320px card: clamped to two lines until opened, in full without details" className={`${card} max-w-80`}>
            <div className="divide-y divide-border">
              <ToolCall
                name="dashboards.rebuild_all_widgets"
                title="Rebuild every widget on the Revenue by plan and platform dashboard"
                icon={Database}
                status="running"
                durationMs={61000}
                input={{ dashboard: 'Revenue by plan and platform', widgets: 'all' }}
              />
              <ToolCall
                name="dashboards.rebuild_all_widgets"
                title="Rebuild every widget on the Revenue by plan and platform dashboard"
                icon={Database}
                status="queued"
              />
            </div>
          </Cell>
          <Cell label="No input or output yet (no chevron)">
            <ToolCall name="dashboards.export" title="Export the revenue dashboard" icon={FileText} status="queued" />
          </Cell>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
