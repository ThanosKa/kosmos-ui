'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { CommandMenu } from '@/registry/kosmos/blocks/command-menu/components/command-menu';

const stage = 'h-[34rem]';

export default function CommandMenuPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Live (⌘K or the trigger)">
        <CommandMenu />
      </PreviewSection>

      <PreviewSection title="Open">
        <OverlayStageGrid>
          <OverlayStage label="main list" className={stage}>
            {(container) => (
              <CommandMenu open modal={false} container={container} initialFocus={false} trigger={null} shortcut={false} />
            )}
          </OverlayStage>
          <OverlayStage label="second list: assign to" className={stage}>
            {(container) => (
              <CommandMenu
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                shortcut={false}
                defaultPage="assign"
              />
            )}
          </OverlayStage>
          <OverlayStage label="query narrows the list" className={stage}>
            {(container) => (
              <CommandMenu
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                shortcut={false}
                defaultQuery="task"
              />
            )}
          </OverlayStage>
          <OverlayStage label="no match" className={stage}>
            {(container) => (
              <CommandMenu
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                shortcut={false}
                defaultQuery="Quarterly revenue forecast for the board meeting"
              />
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>
    </PreviewStack>
  );
}
