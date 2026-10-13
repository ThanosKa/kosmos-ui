import { ToolApproval } from '@/registry/kosmos/ui/tool-approval';

export default function ToolApprovalFlat() {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-transparent bg-card p-2 shadow-card">
      <p className="px-2 py-2 text-small text-muted-foreground">
        Found 3 projects owned by Admin with no activity in 30 days.
      </p>
      <div className="border-t border-border">
        <ToolApproval
          surface="none"
          tool="projects.update_owner"
          title="Reassign 3 projects to the Growth team?"
          description="Owners receive alerts and can edit dashboards."
          allowAlways={false}
        />
      </div>
    </div>
  );
}
