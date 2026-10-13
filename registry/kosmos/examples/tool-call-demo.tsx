'use client';

import { ChartLine, Database, Mail } from 'lucide-react';
import { ToolCall } from '@/registry/kosmos/ui/tool-call';

export default function ToolCallDemo() {
  return (
    <div className="w-full max-w-xl divide-y divide-border rounded-2xl border border-transparent bg-card p-2 shadow-card">
      <ToolCall
        name="warehouse.query"
        title="Query Q3 events for Checkout"
        icon={Database}
        status="done"
        durationMs={1400}
        defaultOpen
        input={{ workspace: 'acme', project: 'Checkout', range: '2026-07-01..2026-09-30' }}
        output="48,210 rows · 4 columns"
      />
      <ToolCall
        name="charts.build"
        title="Chart weekly completions"
        icon={ChartLine}
        status="running"
        durationMs={2300}
        input={{ source: 'warehouse.query', interval: 'week' }}
      />
      <ToolCall
        name="email.send"
        title="Email the chart to growth@acme.example"
        icon={Mail}
        status="awaiting-approval"
        input={{ to: 'growth@acme.example', subject: 'Checkout completions, Q3' }}
      />
    </div>
  );
}
