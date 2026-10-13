import { Button } from '@/registry/kosmos/ui/button';
import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';

const steps: PlanStep[] = [
  { id: 'events', label: 'Pull the last 7 days of events', status: 'done', detail: '6,838,800 events' },
  { id: 'seats', label: 'Compare each project with its plan', status: 'error', detail: 'Plan not found' },
  { id: 'quota', label: 'Flag projects near their quota', status: 'skipped' },
  { id: 'summary', label: 'Draft the summary for Lena Park', status: 'pending' },
];

export default function PlanChecklistFailed() {
  return (
    <PlanChecklist
      title="Prepare the weekly summary for Acme"
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
