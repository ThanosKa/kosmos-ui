'use client';

import { ThumbStage } from '@/components/preview/overlay-stage';
import { NewItemDialog } from '@/registry/kosmos/blocks/new-item-dialog/new-item-dialog';

/** The blocks index thumbnail: the dialog open and filled in. */
export default function NewItemDialogThumb() {
  return (
    <ThumbStage className="h-[34rem] max-w-3xl">
      {(container) => (
        <NewItemDialog
          open
          modal={false}
          container={container}
          initialFocus={false}
          trigger={null}
          defaultValues={{ title: 'Retention cohorts by plan', stage: 'planned', area: 'insights', assignee: 'kai', target: 'Q1 2027' }}
        />
      )}
    </ThumbStage>
  );
}
