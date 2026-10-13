'use client';

import { useState } from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Button } from '@/registry/kosmos/ui/button';
import { ToolApproval, type ApprovalDecision, type ToolApprovalDetail } from '@/registry/kosmos/ui/tool-approval';

const reassignDetails: ToolApprovalDetail[] = [
  { label: 'Project', value: 'Cirrus Weather' },
  { label: 'Current plan', value: 'Pro' },
  { label: 'New plan', value: 'Scale' },
  { label: 'Requested by', value: 'Acme agent · Run #482' },
];

const reassign = {
  tool: 'projects.update_plan',
  title: 'Raise Cirrus Weather to the Scale plan?',
  description: 'The agent wants to move Cirrus Weather from Pro to Scale. Its events use 80% of the Pro allowance, and Scale starts at $1,200 a month.',
  details: reassignDetails,
};

const deleteEvents = {
  tool: 'events.delete',
  title: 'Delete 12,480 test events from Tidepool Notes?',
  description: 'These events are removed from every dashboard that reads them.',
  details: [
    { label: 'Project', value: 'Tidepool Notes' },
    { label: 'Filter', value: 'event = "debug_ping"', mono: true },
    { label: 'Requested by', value: 'Acme agent · Run #482' },
  ],
  danger: true,
  consequence: 'This can’t be undone. Deleted events can’t be restored.',
};

const longText = {
  tool: 'dashboards.share_with_external_domain_and_grant_edit_access',
  title:
    'Share the “Weekly events by project, plan and platform” dashboard with team@brightloop.example and everyone who joins Brightloop Fitness later?',
  description:
    'The agent wants to publish a dashboard outside Acme. Anyone with the link, including people who join Brightloop Fitness later, will be able to open it and see event counts for the last 90 days.',
  details: [
    { label: 'Dashboard', value: 'Weekly events by project, plan and platform (copy 3)' },
    { label: 'Recipient', value: 'team@brightloop.example', mono: true },
  ],
};

const host = 'rounded-2xl border border-transparent bg-card p-2 shadow-card';

function Interactive() {
  const [status, setStatus] = useState<'pending' | 'submitting' | 'decided'>('pending');
  const [decision, setDecision] = useState<ApprovalDecision>();

  async function decide(next: ApprovalDecision) {
    setDecision(next);
    setStatus('submitting');
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus('decided');
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <ToolApproval {...reassign} status={status} decision={decision} decidedBy="Lena Park" decidedAt="14:02" onDecide={decide} />
      <Button
        variant="ghost"
        size="sm"
        disabled={status !== 'decided'}
        onClick={() => {
          setStatus('pending');
          setDecision(undefined);
        }}
      >
        Reset
      </Button>
    </div>
  );
}

export default function ToolApprovalPreview() {
  return (
    <PreviewStack>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Interactive: approve or deny">
          <Interactive />
        </PreviewSection>
        <PreviewSection title="Pending, details closed">
          <ToolApproval {...reassign} />
        </PreviewSection>
        <PreviewSection title="Pending, details open">
          <ToolApproval {...reassign} defaultDetailsOpen />
        </PreviewSection>
        <PreviewSection title="danger">
          <ToolApproval {...deleteEvents} defaultDetailsOpen />
        </PreviewSection>
        <PreviewSection title="Submitting allow-once">
          <ToolApproval {...reassign} status="submitting" decision="allow-once" />
        </PreviewSection>
        <PreviewSection title="Submitting deny, allowAlways false">
          <ToolApproval {...reassign} allowAlways={false} status="submitting" decision="deny" />
        </PreviewSection>
        <PreviewSection title="Decided: allow-once">
          <ToolApproval {...reassign} status="decided" decision="allow-once" decidedBy="Lena Park" decidedAt="14:02" />
        </PreviewSection>
        <PreviewSection title="Decided: always-allow">
          <ToolApproval {...reassign} status="decided" decision="always-allow" decidedBy="Lena Park" decidedAt="14:02" />
        </PreviewSection>
        <PreviewSection title="Decided: deny">
          <ToolApproval {...reassign} status="decided" decision="deny" decidedBy="Tomás Ortega" decidedAt="14:05" />
        </PreviewSection>
        <PreviewSection title="No description or details">
          <ToolApproval tool="alerts.mute" title="Mute traffic alerts for Cirrus Weather for 1 hour?" />
        </PreviewSection>
        <PreviewSection title="Long text">
          <ToolApproval {...longText} defaultDetailsOpen />
        </PreviewSection>
        <PreviewSection title="320px wide">
          <div className="w-full max-w-80">
            <ToolApproval {...reassign} defaultDetailsOpen />
          </div>
        </PreviewSection>
        <PreviewSection title='surface="none" in a host card'>
          <div className={host}>
            <ToolApproval {...reassign} surface="none" />
          </div>
        </PreviewSection>
        <PreviewSection title='surface="none", decided'>
          <div className={host}>
            <ToolApproval {...reassign} surface="none" status="decided" decision="deny" decidedBy="Tomás Ortega" decidedAt="14:05" />
          </div>
        </PreviewSection>
      </div>
    </PreviewStack>
  );
}
