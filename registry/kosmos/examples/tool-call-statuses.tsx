'use client';

import { Database, Download, FileText, Gauge, Mail } from 'lucide-react';
import { ToolCall } from '@/registry/kosmos/ui/tool-call';

export default function ToolCallStatuses() {
  return (
    <div className="w-full max-w-xl divide-y divide-border rounded-2xl border border-transparent bg-card p-2 shadow-card">
      <ToolCall name="dashboards.export" title="Export the revenue dashboard" icon={FileText} status="queued" />
      <ToolCall
        name="projects.update_plan"
        title="Raise Cirrus Weather to the Scale plan"
        icon={Gauge}
        status="awaiting-approval"
        input={{ project: 'cirrus', plan: 'scale' }}
      />
      <ToolCall name="events.scan" title="Scan the event stream" icon={Database} status="running" durationMs={2300} />
      <ToolCall
        name="events.query"
        title="Query the last 30 days of Cirrus Weather events"
        icon={Database}
        status="done"
        durationMs={1400}
        output="30 rows · 2 columns"
      />
      <ToolCall
        name="events.export"
        title="Export Copperline Bank events"
        icon={Download}
        status="error"
        durationMs={30000}
        error="Timed out after 30s. Try again with a shorter range."
      />
      <ToolCall
        name="email.send"
        title="Email the weekly summary"
        icon={Mail}
        status="denied"
        output="Denied by Tomás Ortega · 14:02"
      />
    </div>
  );
}
