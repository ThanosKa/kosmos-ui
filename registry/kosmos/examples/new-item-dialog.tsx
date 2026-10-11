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
                  name: 'Northwind Traders',
                  domain: 'northwind.example',
                  status: 'active',
                  owner: 'maya',
                  arr: 184000,
                  notes: 'Signed the enterprise plan after a two-week pilot with their logistics team.',
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
                defaultValues={{ domain: 'https://northwind' }}
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
                people={[{ id: 'am', name: 'Alexandria Montgomery-Fitzgerald', initials: 'AM' }]}
                defaultValues={{
                  name: 'International Association of Independent Freight Forwarders and Customs Brokers',
                  domain: 'association-of-independent-freight-forwarders.example',
                  status: 'at-risk',
                  owner: 'am',
                  arr: 1250000,
                  notes:
                    'Their procurement team wants a data processing agreement before the trial ends. Supercalifragilisticexpialidocious-configuration-flag decides which region their data lands in, and nobody remembers why it exists.',
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
