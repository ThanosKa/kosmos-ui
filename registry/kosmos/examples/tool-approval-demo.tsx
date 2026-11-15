'use client';

import { useState } from 'react';
import { Button } from '@/registry/kosmos/ui/button';
import { ToolApproval, type ApprovalDecision } from '@/registry/kosmos/ui/tool-approval';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });

export default function ToolApprovalDemo() {
  const [status, setStatus] = useState<'pending' | 'submitting' | 'decided'>('pending');
  const [decision, setDecision] = useState<ApprovalDecision>();
  const [decidedAt, setDecidedAt] = useState<string>();

  async function decide(next: ApprovalDecision) {
    setDecision(next);
    setStatus('submitting');
    await new Promise((resolve) => setTimeout(resolve, 900));
    setDecidedAt(timeFormat.format(new Date()));
    setStatus('decided');
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-2">
      <ToolApproval
        tool="projects.update_plan"
        title="Raise Cirrus Weather to the Scale plan?"
        description="The agent wants to move Cirrus Weather from Pro to Scale. Its events use 80% of the Pro allowance, and Scale starts at $1,200 a month."
        details={[
          { label: 'Project', value: 'Cirrus Weather' },
          { label: 'Current plan', value: 'Pro' },
          { label: 'New plan', value: 'Scale' },
          { label: 'Requested by', value: 'Acme agent · Run #482' },
        ]}
        status={status}
        decision={decision}
        decidedBy="Lena Park"
        decidedAt={decidedAt}
        onDecide={decide}
      />
      {status === 'decided' ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStatus('pending');
            setDecision(undefined);
          }}
        >
          Ask again
        </Button>
      ) : null}
    </div>
  );
}
