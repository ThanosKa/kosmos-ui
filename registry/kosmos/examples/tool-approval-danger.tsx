import { ToolApproval } from '@/registry/kosmos/ui/tool-approval';

export default function ToolApprovalDanger() {
  return (
    <ToolApproval
      className="max-w-xl"
      tool="events.delete"
      title="Delete 12,480 test events from Checkout?"
      description="These events are removed from every dashboard that reads them."
      details={[
        { label: 'Project', value: 'Checkout' },
        { label: 'Filter', value: 'environment = "test"', mono: true },
        { label: 'Requested by', value: 'Acme agent · Run #482' },
      ]}
      danger
      consequence="This can’t be undone. Deleted events can’t be restored."
      defaultDetailsOpen
    />
  );
}
