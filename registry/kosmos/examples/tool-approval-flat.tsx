import { ToolApproval } from '@/registry/kosmos/ui/tool-approval';

export default function ToolApprovalFlat() {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-transparent bg-card p-2 shadow-card">
      <p className="px-2 py-2 text-small text-muted-foreground">
        Cirrus Weather has used 80% of its Pro event allowance this month.
      </p>
      <div className="border-t border-border">
        <ToolApproval
          surface="none"
          tool="projects.update_plan"
          title="Raise Cirrus Weather to the Scale plan?"
          description="Scale includes 8,000,000 events a month."
          allowAlways={false}
        />
      </div>
    </div>
  );
}
