'use client';

import * as React from 'react';
import { CommandMenu } from '@/registry/kosmos/blocks/command-menu/command-menu';

/** Opens inside its own frame, so the preview shows the menu; close it and the search button opens it again. */
export default function CommandMenuDemo() {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  return (
    <div
      ref={setContainer}
      className="relative flex h-[30rem] w-full items-center justify-center overflow-hidden rounded-xl [transform:translateZ(0)]"
    >
      {container && <CommandMenu defaultOpen container={container} initialFocus={false} />}
    </div>
  );
}
