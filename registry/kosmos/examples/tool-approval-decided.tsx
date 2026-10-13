import { ToolApproval } from '@/registry/kosmos/ui/tool-approval';

export default function ToolApprovalDecided() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <ToolApproval
        tool="projects.update_plan"
        title="Raise Cirrus Weather to the Scale plan?"
        status="decided"
        decision="allow-once"
        decidedBy="Lena Park"
        decidedAt="14:02"
      />
      <ToolApproval
        tool="email.send"
        title="Email the weekly summary to kai@acme.example?"
        status="decided"
        decision="deny"
        decidedBy="Tomás Ortega"
        decidedAt="14:05"
      />
    </div>
  );
}
