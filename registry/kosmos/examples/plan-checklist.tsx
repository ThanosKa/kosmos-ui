import type * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Button } from '@/registry/kosmos/ui/button';
import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';

const title = 'Prepare the Q3 usage review for Acme Inc.';

const proposed: PlanStep[] = [
  { id: 'events', label: 'Pull Q3 usage events', status: 'pending' },
  { id: 'seats', label: 'Compare seats with the contract', status: 'pending' },
  { id: 'quota', label: 'Flag projects over quota', status: 'pending' },
  { id: 'summary', label: 'Draft a summary for the Admin', status: 'pending' },
  { id: 'review', label: 'Book a review with the Growth team', status: 'pending' },
];

const midRun: PlanStep[] = [
  { id: 'events', label: 'Pull Q3 usage events', status: 'done', detail: '48,210 events' },
  { id: 'seats', label: 'Compare seats with the contract', status: 'done' },
  { id: 'quota', label: 'Flag projects over quota', status: 'running', detail: '40%' },
  { id: 'summary', label: 'Draft a summary for the Admin', status: 'pending' },
  { id: 'review', label: 'Book a review with the Growth team', status: 'pending' },
];

const failed: PlanStep[] = [
  { id: 'events', label: 'Pull Q3 usage events', status: 'done', detail: '48,210 events' },
  { id: 'seats', label: 'Compare seats with the contract', status: 'error', detail: 'Contract not found' },
  { id: 'quota', label: 'Flag projects over quota', status: 'skipped' },
  { id: 'summary', label: 'Draft a summary for the Admin', status: 'pending' },
];

const allDone: PlanStep[] = midRun.map((step) => ({ ...step, status: 'done', detail: step.id === 'quota' ? '3 projects' : step.detail }));

const everyStatus: PlanStep[] = [
  { id: 'done', label: 'done', status: 'done', detail: 'detail' },
  { id: 'running', label: 'running', status: 'running', detail: '40%' },
  { id: 'error', label: 'error', status: 'error', detail: 'Reason it failed' },
  { id: 'skipped', label: 'skipped', status: 'skipped' },
  { id: 'pending', label: 'pending', status: 'pending' },
];

const wrapping: PlanStep[] = [
  {
    id: 'events',
    label: 'Pull every checkout, mobile and partner API event recorded between July and September',
    status: 'done',
    detail: '48,210 events',
  },
  {
    id: 'seats',
    label: 'Compare the seat counts of each workspace with the limits written in its contract',
    status: 'error',
    detail: 'Contract for the EU workspace not found',
  },
  {
    id: 'summary',
    label: 'Draft a summary for reports@acme.example with the three largest overages',
    status: 'pending',
  },
];

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid items-start gap-10 md:grid-cols-2">{children}</div>;
}

export default function PlanChecklistPreview() {
  return (
    <PreviewStack>
      <Grid>
        <PreviewSection title="Every step status">
          <PlanChecklist title="Step statuses" steps={everyStatus} collapseWhenDone={false} />
        </PreviewSection>

        <PreviewSection title="Proposed, with actions to approve it">
          <PlanChecklist
            title={title}
            steps={proposed}
            actions={
              <>
                <Button variant="primary">Run plan</Button>
                <Button variant="secondary">Edit</Button>
              </>
            }
          />
        </PreviewSection>
      </Grid>

      <Grid>
        <PreviewSection title="Mid-run">
          <PlanChecklist title={title} steps={midRun} />
        </PreviewSection>

        <PreviewSection title="A failed step, with retry">
          <PlanChecklist
            title={title}
            steps={failed}
            actions={
              <>
                <Button variant="secondary">Retry step</Button>
                <Button variant="ghost">Skip it</Button>
              </>
            }
          />
        </PreviewSection>
      </Grid>

      <Grid>
        <PreviewSection title="Done, collapsed">
          <PlanChecklist title={title} steps={allDone} defaultOpen={false} />
        </PreviewSection>

        <PreviewSection title="Done, opened again">
          <PlanChecklist title={title} steps={allDone} />
        </PreviewSection>
      </Grid>

      <Grid>
        <PreviewSection title="surface none, flat in a host card">
          <div className="flex flex-col gap-3 rounded-2xl border border-transparent bg-card p-3 shadow-card">
            <p className="px-2 text-body">I will check Q3 usage against the contract, then book a review.</p>
            <PlanChecklist title={title} steps={midRun} surface="none" />
          </div>
        </PreviewSection>

        <PreviewSection title="Long labels and details at 320px">
          <div className="w-full max-w-80">
            <PlanChecklist
              title="Prepare the Q3 usage review for every Acme Inc. workspace in Europe and North America"
              steps={wrapping}
            />
          </div>
        </PreviewSection>
      </Grid>

      <PreviewSection title="Default title, no steps yet">
        <div className="w-full max-w-80">
          <PlanChecklist steps={[]} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
