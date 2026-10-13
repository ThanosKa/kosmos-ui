'use client';

import { Receipt } from 'lucide-react';
import { ToolCall } from '@/registry/kosmos/ui/tool-call';

const plans = [
  { plan: 'Scale', revenue: '$13,700' },
  { plan: 'Pro', revenue: '$928' },
  { plan: 'Free', revenue: '$0' },
];

export default function ToolCallCustomOutput() {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-transparent bg-card p-2 shadow-card">
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
          {plans.map(({ plan, revenue }) => (
            <li key={plan} className="flex justify-between gap-4 py-2">
              <span>{plan}</span>
              <span className="tabular-nums">{revenue}</span>
            </li>
          ))}
        </ul>
      </ToolCall>
    </div>
  );
}
