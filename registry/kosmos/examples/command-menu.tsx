'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { CommandMenu } from '@/registry/kosmos/blocks/command-menu/command-menu';

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
              <CommandMenu open modal={false} container={container} initialFocus={false} trigger={null} hotkey={false} />
            )}
          </OverlayStage>
          <OverlayStage label="second list: assigned to" className={stage}>
            {(container) => (
              <CommandMenu
                open
                modal={false}
                container={container}
                initialFocus={false}
                trigger={null}
                hotkey={false}
                defaultPage="assignee"
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
                hotkey={false}
                defaultQuery="roadmap"
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
                hotkey={false}
                defaultQuery="Weekly retention cohorts for every Scale plan project"
              />
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>
    </PreviewStack>
  );
}
