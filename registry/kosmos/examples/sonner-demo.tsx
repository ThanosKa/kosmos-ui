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
          toast('Roadmap item created', {
            description: 'Fix the retention chart tooltip is on the Q4 roadmap.',
            action: { label: 'Undo', onClick: () => toast('Roadmap item removed') },
          })
        }
      >
        New roadmap item
      </Button>
      {/* In an app, render one Toaster in the root layout instead. */}
      <Toaster />
    </>
  );
}
