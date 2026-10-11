'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { NewItemDialog } from '@/registry/kosmos/blocks/new-item-dialog/components/new-item-dialog';

const stage = 'h-[40rem]';

export default function NewItemDialogPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Live (opens from its trigger)">
        <div>
          <NewItemDialog />
        </div>
      </PreviewSection>

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
                  title: 'Add CSV export to the reports table',
                  description: 'Export the filtered rows with the visible columns, in the order shown.',
                  status: 'in-progress',
                  priority: 'high',
                  assignee: 'maya',
                  due: '2026-10-28',
                }}
              />
            )}
          </OverlayStage>
          <OverlayStage label="submitted without a title" className={stage}>
            {(container) => (
              <NewItemDialog open modal={false} container={container} initialFocus={false} trigger={null} defaultSubmitted />
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
                  title:
                    'Investigate why the weekly digest email is sent twice to workspace owners who belong to more than one organization',
                  description:
                    'Owners of two or more organizations get one digest per organization, and a second copy when they also manage billing. Supercalifragilisticexpialidocious-configuration-flag decides which list they land on, and nobody remembers why it exists.',
                  status: 'backlog',
                  priority: 'urgent',
                  assignee: 'am',
                }}
              />
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>
    </PreviewStack>
  );
}
