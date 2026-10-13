import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from '@/registry/kosmos/ui/collapsible';

const rows = ['row, closed', 'row, open', 'small, closed', 'small, open'] as const;

const card = 'rounded-2xl border border-transparent bg-card p-1 shadow-card';

const projectDetails = [
  { label: 'Project', value: 'Cirrus Weather' },
  { label: 'Added', value: 'Mar 3, 2025' },
  { label: 'Platform', value: 'iOS' },
  { label: 'Events', value: '2,391,700' },
];

/** Reads "Show details" while closed and "Hide details" while open, so the label follows the panel. */
function DetailsLabel() {
  return (
    <>
      <span className="group-data-panel-open/collapsible:hidden">Show details</span>
      <span className="hidden group-data-panel-open/collapsible:inline">Hide details</span>
    </>
  );
}

export default function CollapsiblePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Row and small triggers × states">
        <StateMatrix
          rows={rows}
          render={(row, state) => {
            const open = row.endsWith('open');
            return row.startsWith('row') ? (
              <Collapsible defaultOpen={open} disabled={state === 'disabled'} className="w-full">
                <CollapsibleTrigger variant="item" className="h-9 w-full justify-between px-2" {...previewState(state)}>
                  Details
                  <CollapsibleChevron />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pt-1 text-small text-muted-foreground">Sends events from the iOS app only.</CollapsibleContent>
              </Collapsible>
            ) : (
              <Collapsible defaultOpen={open} disabled={state === 'disabled'}>
                <CollapsibleTrigger variant="ghost" size="sm" className="-ms-2" {...previewState(state)}>
                  <DetailsLabel />
                  <CollapsibleChevron size="sm" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1 text-small text-muted-foreground">Sends events from the iOS app only.</CollapsibleContent>
              </Collapsible>
            );
          }}
        />
      </PreviewSection>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Row trigger in a card, open">
          <Collapsible defaultOpen className={card}>
            <CollapsibleTrigger variant="item" className="h-9 w-full justify-between px-2">
              Project details
              <CollapsibleChevron />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <dl className="flex flex-col gap-2 px-2 pt-1 pb-2 text-body">
                {projectDetails.map((item) => (
                  <div key={item.label} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{item.label}</dt>
                    <dd className="text-end tabular-nums">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </CollapsibleContent>
          </Collapsible>
        </PreviewSection>

        <PreviewSection title="Small trigger under content, open">
          <div className="flex flex-col items-start gap-1">
            <p className="text-body text-foreground">The nightly event rollup failed after 3 retries.</p>
            <Collapsible defaultOpen className="w-full">
              <CollapsibleTrigger variant="ghost" size="sm" className="-ms-2">
                <DetailsLabel />
                <CollapsibleChevron size="sm" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className="mt-1 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-caption text-muted-foreground">
                  {'Error: connection reset by peer\n  at sync (jobs/nightly.ts:42)'}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </PreviewSection>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Long label in a narrow slot">
          <div className="w-full max-w-64">
            <Collapsible defaultOpen className={card}>
              <CollapsibleTrigger
                variant="item"
                className="h-auto min-h-9 w-full items-start justify-between gap-2 px-2 py-2 text-start whitespace-normal"
              >
                Event retention and deletion policy for projects that send from outside the European Union
                <CollapsibleChevron />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-2 pb-2 text-small text-muted-foreground">
                Events are kept for 13 months, then deleted.
              </CollapsibleContent>
            </Collapsible>
          </div>
        </PreviewSection>

        <PreviewSection title="Panel with no trigger, controlled open">
          <Collapsible open>
            <CollapsibleContent className="text-small text-muted-foreground">
              A panel another control opens, such as a switch that reveals more fields.
            </CollapsibleContent>
          </Collapsible>
        </PreviewSection>
      </div>
    </PreviewStack>
  );
}
