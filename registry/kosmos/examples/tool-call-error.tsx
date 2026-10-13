'use client';

import { Receipt } from 'lucide-react';
import { ToolCall } from '@/registry/kosmos/ui/tool-call';

export default function ToolCallError() {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-transparent bg-card p-2 shadow-card">
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
    </div>
  );
}
