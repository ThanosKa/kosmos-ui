'use client';

import { Download } from 'lucide-react';
import { ToolCall } from '@/registry/kosmos/ui/tool-call';

export default function ToolCallError() {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-transparent bg-card p-2 shadow-card">
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
    </div>
  );
}
