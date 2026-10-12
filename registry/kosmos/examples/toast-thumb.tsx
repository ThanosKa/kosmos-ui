'use client';

import { useEffect, useState } from 'react';
import { ThumbStage } from '@/components/preview/overlay-stage';
import { Toaster, createToastManager } from '@/registry/kosmos/ui/toast';

function PinnedToasts({ container }: { container: HTMLElement }) {
  const [manager] = useState(() => createToastManager());
  useEffect(() => {
    // Ids keep a second run (React strict mode) from adding the toasts twice.
    manager.add({ id: 'invite', timeout: 0, title: 'Invite sent', description: 'Ana Lopez will get an email in a minute.' });
    manager.add({ id: 'saved', timeout: 0, type: 'success', title: 'Changes saved', description: 'Q3 Roadmap is up to date.' });
  }, [manager]);
  return <Toaster toastManager={manager} container={container} />;
}

/** The components index thumbnail: a stack of toasts, held open. */
export default function ToastThumb() {
  return <ThumbStage className="h-48 max-w-md">{(container) => <PinnedToasts container={container} />}</ThumbStage>;
}
