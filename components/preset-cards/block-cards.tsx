'use client';

import { PresetStage, StageBackdropRows } from '@/components/preset-cards/preset-card';
import { CommandMenu } from '@/registry/kosmos/blocks/command-menu/command-menu';
import { DetailDrawer } from '@/registry/kosmos/blocks/detail-drawer/detail-drawer';
import { NewItemDialog } from '@/registry/kosmos/blocks/new-item-dialog/new-item-dialog';

export function NewItemStage() {
  return (
    <PresetStage title="New item dialog" description="A form with validation, in a dialog." stageClassName="h-[40rem]">
      {(container) => (
        <NewItemDialog
          open
          modal={false}
          container={container}
          initialFocus={false}
          trigger={null}
          defaultValues={{ title: 'Shareable dashboard links', stage: 'ideas', area: 'insights' }}
        />
      )}
    </PresetStage>
  );
}

export function CommandMenuStage() {
  return (
    <PresetStage title="Command menu" description="The ⌘K palette with records, actions and pages." stageClassName="h-[32rem] lg:h-[40rem]">
      {(container) => (
        <CommandMenu open modal={false} container={container} initialFocus={false} trigger={null} hotkey={false} />
      )}
    </PresetStage>
  );
}

export function DetailDrawerStage() {
  return (
    <PresetStage title="Detail drawer" description="One record, its activity and a note field." stageClassName="h-[40rem]">
      {(container) => (
        <>
          <StageBackdropRows
            rows={['Fernhill Books · Live', 'Brightloop Fitness · Live', 'Copperline Bank · Live', 'Saltmarsh Coffee · Live', 'Hollow Oak Games · Paused']}
          />
          <DetailDrawer open modal={false} container={container} initialFocus={false} trigger={null} />
        </>
      )}
    </PresetStage>
  );
}
