'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { ThumbStage } from '@/components/preview/overlay-stage';
import { Toaster } from '@/registry/kosmos/ui/sonner';

function PinnedToasts() {
  useEffect(() => {
    // Ids keep a second run (React strict mode) from adding the toasts twice.
    toast('Roadmap item archived', {
      id: 'thumb-archived',
      toasterId: 'sonner-thumb',
      duration: Infinity,
      description: 'Fix the retention chart tooltip moved to the archive.',
      action: { label: 'Undo', onClick: () => {} },
    });
    toast.success('Changes saved', {
      id: 'thumb-saved',
      toasterId: 'sonner-thumb',
      duration: Infinity,
      description: 'Q4 roadmap is up to date.',
    });
  }, []);
  return <Toaster id="sonner-thumb" position="bottom-center" />;
}

/** The components index thumbnail: a stack of toasts, held open. */
export default function SonnerThumb() {
  return (
    <ThumbStage className="h-48 max-w-md">
      {() => <PinnedToasts />}
    </ThumbStage>
  );
}
