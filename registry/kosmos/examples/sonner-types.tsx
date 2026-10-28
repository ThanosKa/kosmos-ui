'use client';

import { toast } from 'sonner';
import { Button } from '@/registry/kosmos/ui/button';
import { Toaster } from '@/registry/kosmos/ui/sonner';

export default function SonnerTypes() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="secondary" onClick={() => toast('Link copied')}>
        Default
      </Button>
      <Button variant="secondary" onClick={() => toast.success('Changes saved', { description: 'Q4 roadmap is up to date.' })}>
        Success
      </Button>
      <Button variant="secondary" onClick={() => toast.info('New version available', { description: 'Reload to update.' })}>
        Info
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.warning('Event quota at 80%', { description: 'Cirrus Weather has used 80% of its October allowance.' })}
      >
        Warning
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.error('Upload failed', { description: 'events-september.csv is larger than 25 MB.' })}
      >
        Error
      </Button>
      <Toaster />
    </div>
  );
}
