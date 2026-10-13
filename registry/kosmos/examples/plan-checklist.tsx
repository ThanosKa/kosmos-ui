import type * as React from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Button } from '@/registry/kosmos/ui/button';
import { PlanChecklist, type PlanStep } from '@/registry/kosmos/ui/plan-checklist';

const title = 'Prepare the weekly summary for Acme';

const proposed: PlanStep[] = [
  { id: 'events', label: 'Pull the last 7 days of events', status: 'pending' },
  { id: 'seats', label: 'Compare each project with its plan', status: 'pending' },
  { id: 'quota', label: 'Flag projects near their quota', status: 'pending' },
  { id: 'summary', label: 'Draft the summary for Lena Park', status: 'pending' },
  { id: 'review', label: 'Share it with the Acme team', status: 'pending' },
];

const midRun: PlanStep[] = [
  { id: 'events', label: 'Pull the last 7 days of events', status: 'done', detail: '6,838,800 events' },
  { id: 'seats', label: 'Compare each project with its plan', status: 'done' },
  { id: 'quota', label: 'Flag projects near their quota', status: 'running', detail: '40%' },
  { id: 'summary', label: 'Draft the summary for Lena Park', status: 'pending' },
  { id: 'review', label: 'Share it with the Acme team', status: 'pending' },
];

const failed: PlanStep[] = [
  { id: 'events', label: 'Pull the last 7 days of events', status: 'done', detail: '6,838,800 events' },
  { id: 'seats', label: 'Compare each project with its plan', status: 'error', detail: 'Plan not found' },
  { id: 'quota', label: 'Flag projects near their quota', status: 'skipped' },
  { id: 'summary', label: 'Draft the summary for Lena Park', status: 'pending' },
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
    label: 'Pull every page_viewed, screen_viewed and button_clicked event recorded for the twelve Acme projects in the last 7 days',
    status: 'done',
    detail: '6,838,800 events',
  },
  {
    id: 'seats',
    label: 'Compare the events of each project with the allowance written into its plan',
    status: 'error',
    detail: 'Plan for Kiln Studio not found',
  },
  {
    id: 'summary',
    label: 'Draft a summary for kai@acme.example with the three largest overages',
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
            <p className="px-2 text-body">I will check the last 7 days of events against each plan, then share a summary.</p>
            <PlanChecklist title={title} steps={midRun} surface="none" />
          </div>
        </PreviewSection>

        <PreviewSection title="Long labels and details at 320px">
          <div className="w-full max-w-80">
            <PlanChecklist
              title="Prepare the weekly summary for every Acme project on the Scale and Pro plans, with the quota of each"
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
