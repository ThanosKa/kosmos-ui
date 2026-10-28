'use client';

import { toast } from 'sonner';
import { Button } from '@/registry/kosmos/ui/button';
import { Toaster } from '@/registry/kosmos/ui/sonner';

export default function SonnerDemo() {
  return (
    <>
      <Button
        variant="secondary"
        onClick={() =>
          toast('Roadmap item archived', {
            description: 'Fix the retention chart tooltip moved to the archive.',
            action: { label: 'Undo', onClick: () => toast.success('Roadmap item restored') },
          })
        }
      >
        Archive item
      </Button>
      {/* In an app, render one Toaster in the root layout instead. */}
      <Toaster />
    </>
  );
}
