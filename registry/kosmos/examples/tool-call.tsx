'use client';

import { Database, FileText, Mail, Receipt, UserCog } from 'lucide-react';
import * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { ToolCall } from '@/registry/kosmos/ui/tool-call';

const card = 'min-w-0 rounded-2xl border border-transparent bg-card p-2 shadow-card';

const queryInput = { workspace: 'acme', project: 'Checkout', range: '2026-07-01..2026-09-30', metric: 'events' };

const longOutput = Array.from(
  { length: 24 },
  (_, i) =>
    `2026-09-${String(i + 1).padStart(2, '0')}  checkout.completed  ${(1800 + i * 37).toLocaleString('en-US')} events`,
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
              name="warehouse.query"
              title="Query Q3 events for Checkout"
              icon={Database}
              status="done"
              durationMs={1400}
              input={queryInput}
              output="48,210 rows · 4 columns"
            />
            <ToolCall
              name="events.scan"
              title="Scan the event stream"
              icon={Database}
              status="running"
              durationMs={2300}
              input={{ workspace: 'acme', stream: 'web', window: '24h' }}
            />
            <ToolCall
              name="dashboards.export"
              title="Export the revenue dashboard"
              icon={FileText}
              status="queued"
              input={{ dashboard: 'Revenue by plan', format: 'pdf' }}
            />
            <ToolCall
              name="projects.update_owner"
              title="Move Mobile to the Growth team"
              icon={UserCog}
              status="awaiting-approval"
              input={{ project: 'Mobile', owner: 'growth@acme.example' }}
            />
            <ToolCall
              name="email.send"
              title="Email the weekly summary to reports@acme.example"
              icon={Mail}
              status="denied"
              input={{ to: 'reports@acme.example', subject: 'Weekly summary' }}
              output="Denied by Admin · 14:02"
            />
            <ToolCall
              name="billing.fetch_invoices"
              title="Fetch invoices"
              icon={Receipt}
              status="error"
              durationMs={30000}
              input={{ workspace: 'acme', customer: 'admin@acme.example', limit: 50 }}
              error="Timed out after 30s. Try again with a limit under 50."
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
                  name="warehouse.query"
                  title="Query Q3 events for Checkout"
                  icon={Database}
                  status="done"
                  durationMs={1400}
                  input={queryInput}
                  output="48,210 rows · 4 columns"
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
              name="warehouse.query"
              title="Query Q3 events for Checkout"
              icon={Database}
              status="done"
              durationMs={1400}
              defaultOpen
              input={queryInput}
              output="48,210 rows · 4 columns"
            />
          </Cell>
          <Cell label="Error">
            <ToolCall
              name="billing.fetch_invoices"
              title="Fetch invoices"
              icon={Receipt}
              status="error"
              durationMs={30000}
              defaultOpen
              input={{ workspace: 'acme', customer: 'admin@acme.example', limit: 50 }}
              error="Timed out after 30s. Try again with a limit under 50."
            />
          </Cell>
          <Cell label="Long output, scrolls">
            <ToolCall
              name="warehouse.query"
              title="Daily completions in September"
              icon={Database}
              status="done"
              durationMs={125000}
              defaultOpen
              output={longOutput}
            />
          </Cell>
          <Cell label="Custom output in children">
            <ToolCall
              name="billing.list_plans"
              title="List plans by revenue"
              icon={Receipt}
              status="done"
              durationMs={820}
              defaultOpen
              input={{ workspace: 'acme', sort: 'revenue' }}
            >
              <ul className="divide-y divide-border rounded-lg bg-muted px-3 text-small">
                {[
                  ['Enterprise', '$412,800'],
                  ['Team', '$186,250'],
                  ['Starter', '$42,900'],
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
                title="Rebuild every widget on the Revenue by plan and region dashboard"
                icon={Database}
                status="running"
                durationMs={61000}
                input={{ dashboard: 'Revenue by plan and region', widgets: 'all' }}
              />
              <ToolCall
                name="dashboards.rebuild_all_widgets"
                title="Rebuild every widget on the Revenue by plan and region dashboard"
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
