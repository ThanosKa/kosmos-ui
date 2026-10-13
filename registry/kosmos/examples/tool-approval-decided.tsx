import { ToolApproval } from '@/registry/kosmos/ui/tool-approval';

export default function ToolApprovalDecided() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <ToolApproval
        tool="projects.update_owner"
        title="Reassign 3 projects to the Growth team?"
        status="decided"
        decision="allow-once"
        decidedBy="you"
        decidedAt="14:02"
      />
      <ToolApproval
        tool="dashboards.share"
        title="Share Revenue by plan with finance@partner.example?"
        status="decided"
        decision="deny"
        decidedBy="Admin"
        decidedAt="14:05"
      />
    </div>
  );
}
