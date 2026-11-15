'use client';

import { toast } from 'sonner';
import { Button } from '@/registry/kosmos/ui/button';
import { Toaster } from '@/registry/kosmos/ui/sonner';

export default function SonnerAction() {
  return (
    <>
      <Button
        variant="secondary"
        onClick={() =>
          toast('Delete 12,480 test events?', {
            description: 'The debug_ping events from Tidepool Notes.',
            duration: Infinity,
            cancel: { label: 'Cancel', onClick: () => {} },
            action: { label: 'Delete', onClick: () => toast.success('Deleted 12,480 events') },
          })
        }
      >
        Delete test events
      </Button>
      <Toaster />
    </>
  );
}
