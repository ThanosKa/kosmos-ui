'use client';

import { Database, FileText, Mail, Receipt, UserCog } from 'lucide-react';
import { ToolCall } from '@/registry/kosmos/ui/tool-call';

export default function ToolCallStatuses() {
  return (
    <div className="w-full max-w-xl divide-y divide-border rounded-2xl border border-transparent bg-card p-2 shadow-card">
      <ToolCall name="dashboards.export" title="Export the revenue dashboard" icon={FileText} status="queued" />
      <ToolCall
        name="projects.update_owner"
        title="Move Mobile to the Growth team"
        icon={UserCog}
        status="awaiting-approval"
        input={{ project: 'Mobile', owner: 'growth@acme.example' }}
      />
      <ToolCall name="events.scan" title="Scan the event stream" icon={Database} status="running" durationMs={2300} />
      <ToolCall
        name="warehouse.query"
        title="Query Q3 events for Checkout"
        icon={Database}
        status="done"
        durationMs={1400}
        output="48,210 rows · 4 columns"
      />
      <ToolCall
        name="billing.fetch_invoices"
        title="Fetch invoices"
        icon={Receipt}
        status="error"
        durationMs={30000}
        error="Timed out after 30s. Try again with a limit under 50."
      />
      <ToolCall
        name="email.send"
        title="Email the weekly summary"
        icon={Mail}
        status="denied"
        output="Denied by Admin · 14:02"
      />
    </div>
  );
}
