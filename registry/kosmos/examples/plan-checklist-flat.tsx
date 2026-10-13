import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';

const steps: PlanStep[] = [
  { id: 'events', label: 'Pull Q3 usage events', status: 'done', detail: '48,210 events' },
  { id: 'seats', label: 'Compare seats with the contract', status: 'done' },
  { id: 'quota', label: 'Flag projects over quota', status: 'running', detail: '40%' },
  { id: 'summary', label: 'Draft a summary for the Admin', status: 'pending' },
];

export default function PlanChecklistFlat() {
  return (
    <div className="flex max-w-md flex-col gap-3 rounded-2xl border border-transparent bg-card p-3 shadow-card">
      <p className="px-2 text-body">I’ll check Q3 usage against the contract, then draft a summary.</p>
      <PlanChecklist title="Plan" steps={steps} surface="none" />
    </div>
  );
}
