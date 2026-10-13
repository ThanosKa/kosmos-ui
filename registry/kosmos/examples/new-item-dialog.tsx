'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { NewItemDialog } from '@/registry/kosmos/blocks/new-item-dialog/new-item-dialog';

const stage = 'h-[44rem]';

export default function NewItemDialogPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Open">
        <OverlayStageGrid>
          <OverlayStage label="empty" className={stage}>
            {(container) => <NewItemDialog open modal={false} container={container} initialFocus={false} trigger={null} />}
          </OverlayStage>
          <OverlayStage label="filled" className={stage}>
            {(container) => (
              <NewItemDialog
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                defaultValues={{
                  title: 'Retention cohorts by plan',
                  description: 'Scale customers want to see whether users on each plan come back in their second month.',
                  stage: 'planned',
                  area: 'insights',
                  assignee: 'kai',
                  target: 'Q1 2027',
                }}
              />
            )}
          </OverlayStage>
          <OverlayStage label="submitted with errors" className={stage}>
            {(container) => (
              <NewItemDialog
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                defaultSubmitted
                defaultValues={{ description: 'Alert the project team in chat when page views drop by a third in an hour.' }}
              />
            )}
          </OverlayStage>
          <OverlayStage label="long text" className={stage}>
            {(container) => (
              <NewItemDialog
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                people={[{ id: 'tomas', name: 'Tomás Ortega Villanueva de la Fuente', initials: 'TO' }]}
                areas={[{ value: 'ingestion', label: 'Ingestion and event collection', hue: 'green' }]}
                defaultValues={{
                  title: 'Server-side batching for every ingestion endpoint, with retries and a dead letter queue per region',
                  description:
                    'Copperline Bank and Ironbark Logistics send millions of events a day from their servers. Supercalifragilisticexpialidocious-batch-size decides how many events go in one request, and nobody remembers why it is 37.',
                  stage: 'in-progress',
                  area: 'ingestion',
                  assignee: 'tomas',
                  target: 'Q4 2026',
                }}
              />
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Live (opens from its trigger)">
        <div>
          <NewItemDialog />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
