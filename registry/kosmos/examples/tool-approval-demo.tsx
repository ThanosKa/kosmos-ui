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
        tool="projects.update_owner"
        title="Reassign 3 projects to the Growth team?"
        description="The agent wants to change the owner of three projects. Owners receive alerts and can edit dashboards."
        details={[
          { label: 'Projects', value: 'Checkout, Mobile, Partner API' },
          { label: 'Current owner', value: 'Admin' },
          { label: 'New owner', value: 'Growth team' },
          { label: 'Requested by', value: 'Acme agent · Run #482' },
        ]}
        status={status}
        decision={decision}
        decidedBy="you"
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
