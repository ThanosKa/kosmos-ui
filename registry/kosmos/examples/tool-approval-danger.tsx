import { ToolApproval } from '@/registry/kosmos/ui/tool-approval';

export default function ToolApprovalDanger() {
  return (
    <ToolApproval
      className="max-w-xl"
      tool="events.delete"
      title="Delete 12,480 test events from Tidepool Notes?"
      description="These events are removed from every dashboard that reads them."
      details={[
        { label: 'Project', value: 'Tidepool Notes' },
        { label: 'Filter', value: 'event = "debug_ping"', mono: true },
        { label: 'Requested by', value: 'Acme agent · Run #482' },
      ]}
      danger
      consequence="This can’t be undone. Deleted events can’t be restored."
      defaultDetailsOpen
    />
  );
}
