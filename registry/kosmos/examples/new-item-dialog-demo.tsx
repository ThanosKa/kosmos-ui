'use client';

import * as React from 'react';
import { NewItemDialog } from '@/registry/kosmos/blocks/new-item-dialog/new-item-dialog';

/** Opens inside its own frame, so the preview shows the dialog; close it and the button opens it again. */
export default function NewItemDialogDemo() {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  return (
    <div
      ref={setContainer}
      className="relative flex h-[34rem] w-full items-center justify-center overflow-hidden rounded-xl [transform:translateZ(0)]"
    >
      {container && <NewItemDialog defaultOpen container={container} initialFocus={false} />}
    </div>
  );
}
