'use client';

import { ThumbStage } from '@/components/preview/overlay-stage';
import { CommandMenu } from '@/registry/kosmos/blocks/command-menu/command-menu';

/** The blocks index thumbnail: the menu open on its main list. */
export default function CommandMenuThumb() {
  return (
    <ThumbStage className="h-[34rem] max-w-3xl">
      {(container) => <CommandMenu open modal={false} container={container} initialFocus={false} trigger={null} hotkey={false} />}
    </ThumbStage>
  );
}
