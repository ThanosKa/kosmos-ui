'use client';

import { Receipt } from 'lucide-react';
import { ToolCall } from '@/registry/kosmos/ui/tool-call';

const plans = [
  { plan: 'Enterprise', revenue: '$412,800' },
  { plan: 'Team', revenue: '$186,250' },
  { plan: 'Starter', revenue: '$42,900' },
];

export default function ToolCallCustomOutput() {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-transparent bg-card p-2 shadow-card">
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
