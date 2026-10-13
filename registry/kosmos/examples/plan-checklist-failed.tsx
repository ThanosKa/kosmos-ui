import { Button } from '@/registry/kosmos/ui/button';
import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';

const steps: PlanStep[] = [
  { id: 'events', label: 'Pull Q3 usage events', status: 'done', detail: '48,210 events' },
  { id: 'seats', label: 'Compare seats with the contract', status: 'error', detail: 'Contract not found' },
  { id: 'quota', label: 'Flag projects over quota', status: 'skipped' },
  { id: 'summary', label: 'Draft a summary for the Admin', status: 'pending' },
];

export default function PlanChecklistFailed() {
  return (
    <PlanChecklist
      title="Prepare the Q3 usage review for Acme Inc."
      steps={steps}
      className="max-w-md"
      actions={
        <>
          <Button variant="secondary">Retry step</Button>
          <Button variant="ghost">Skip it</Button>
        </>
      }
    />
  );
}
