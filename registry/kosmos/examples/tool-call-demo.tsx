'use client';

import { ChartLine, Database, Mail } from 'lucide-react';
import { ToolCall } from '@/registry/kosmos/ui/tool-call';

export default function ToolCallDemo() {
  return (
    <div className="w-full max-w-xl divide-y divide-border rounded-2xl border border-transparent bg-card p-2 shadow-card">
      <ToolCall
        name="events.query"
        title="Query the last 30 days of Cirrus Weather events"
        icon={Database}
        status="done"
        durationMs={1400}
        defaultOpen
        input={{ project: 'cirrus', range: '2026-09-12..2026-10-11' }}
        output="30 rows · 2 columns"
      />
      <ToolCall
        name="charts.build"
        title="Chart daily events"
        icon={ChartLine}
        status="running"
        durationMs={2300}
        input={{ source: 'events.query', interval: 'day' }}
      />
      <ToolCall
        name="email.send"
        title="Email the chart to kai@acme.example"
        icon={Mail}
        status="awaiting-approval"
        input={{ to: 'kai@acme.example', subject: 'Cirrus Weather events, last 30 days' }}
      />
    </div>
  );
}
