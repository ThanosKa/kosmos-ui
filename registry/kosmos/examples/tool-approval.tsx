'use client';

import { useState } from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Button } from '@/registry/kosmos/ui/button';
import { ToolApproval, type ApprovalDecision, type ToolApprovalDetail } from '@/registry/kosmos/ui/tool-approval';

const reassignDetails: ToolApprovalDetail[] = [
  { label: 'Projects', value: 'Checkout, Mobile, Partner API' },
  { label: 'Current owner', value: 'Admin' },
  { label: 'New owner', value: 'Growth team' },
  { label: 'Requested by', value: 'Acme agent · Run #482' },
];

const reassign = {
  tool: 'projects.update_owner',
  title: 'Reassign 3 projects to the Growth team?',
  description: 'The agent wants to change the owner of three projects. Owners receive alerts and can edit dashboards.',
  details: reassignDetails,
};

const deleteEvents = {
  tool: 'events.delete',
  title: 'Delete 12,480 test events from Checkout?',
  description: 'These events are removed from every dashboard that reads them.',
  details: [
    { label: 'Project', value: 'Checkout' },
    { label: 'Filter', value: 'environment = "test"', mono: true },
    { label: 'Requested by', value: 'Acme agent · Run #482' },
  ],
  danger: true,
  consequence: 'This can’t be undone. Deleted events can’t be restored.',
};

const longText = {
  tool: 'dashboards.share_with_external_domain_and_grant_edit_access',
  title:
    'Share the “Quarterly revenue by region, plan and acquisition channel” dashboard with finance@partner.example and every member of the Partner API workspace?',
  description:
    'The agent wants to publish a dashboard outside this workspace. Anyone with the link, including people who join the partner workspace later, will be able to open it and see revenue figures for the last four quarters.',
  details: [
    { label: 'Dashboard', value: 'Quarterly revenue by region, plan and acquisition channel (copy 3)' },
    { label: 'Recipient', value: 'finance@partner.example', mono: true },
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
      <ToolApproval {...reassign} status={status} decision={decision} decidedBy="you" decidedAt="14:02" onDecide={decide} />
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
          <ToolApproval {...reassign} status="decided" decision="allow-once" decidedBy="you" decidedAt="14:02" />
        </PreviewSection>
        <PreviewSection title="Decided: always-allow">
          <ToolApproval {...reassign} status="decided" decision="always-allow" decidedBy="you" decidedAt="14:02" />
        </PreviewSection>
        <PreviewSection title="Decided: deny">
          <ToolApproval {...reassign} status="decided" decision="deny" decidedBy="Admin" decidedAt="14:05" />
        </PreviewSection>
        <PreviewSection title="No description or details">
          <ToolApproval tool="alerts.mute" title="Mute checkout alerts for 1 hour?" />
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
            <ToolApproval {...reassign} surface="none" status="decided" decision="deny" decidedBy="Admin" decidedAt="14:05" />
          </div>
        </PreviewSection>
      </div>
    </PreviewStack>
  );
}
