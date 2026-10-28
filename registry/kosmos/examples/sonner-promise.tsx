'use client';

import { toast } from 'sonner';
import { Button } from '@/registry/kosmos/ui/button';
import { Toaster } from '@/registry/kosmos/ui/sonner';

function exportEvents() {
  return new Promise<number>((resolve) => setTimeout(() => resolve(3912400), 2000));
}

export default function SonnerPromise() {
  return (
    <>
      <Button
        variant="secondary"
        onClick={() =>
          toast.promise(exportEvents(), {
            loading: 'Exporting Fernhill Books events…',
            success: (events) => `${new Intl.NumberFormat('en-US').format(events)} events ready to download`,
            error: 'Unable to export. Try again in a minute.',
          })
        }
      >
        Export events
      </Button>
      <Toaster />
    </>
  );
}
