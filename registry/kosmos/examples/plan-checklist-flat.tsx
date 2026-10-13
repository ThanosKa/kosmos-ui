import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';

const steps: PlanStep[] = [
  { id: 'events', label: 'Pull the last 7 days of events', status: 'done', detail: '6,838,800 events' },
  { id: 'seats', label: 'Compare each project with its plan', status: 'done' },
  { id: 'quota', label: 'Flag projects near their quota', status: 'running', detail: '40%' },
  { id: 'summary', label: 'Draft the summary for Lena Park', status: 'pending' },
];

export default function PlanChecklistFlat() {
  return (
    <div className="flex max-w-md flex-col gap-3 rounded-2xl border border-transparent bg-card p-3 shadow-card">
      <p className="px-2 text-body">I’ll check the last 7 days of events against each plan, then draft a summary.</p>
      <PlanChecklist title="Plan" steps={steps} surface="none" />
    </div>
  );
}
