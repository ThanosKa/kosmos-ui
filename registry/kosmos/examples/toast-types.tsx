'use client';

import { Button } from '@/registry/kosmos/ui/button';
import { Toaster, toast } from '@/registry/kosmos/ui/toast';

export default function ToastTypes() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="secondary" onClick={() => toast.add({ type: 'success', title: 'Changes saved' })}>
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            type: 'error',
            title: 'Unable to save',
            description: 'Check your connection and try again.',
            priority: 'high',
          })
        }
      >
        Error
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.add({ type: 'warning', title: 'Storage almost full', description: '92% of 50 GB used.' })}
      >
        Warning
      </Button>
      <Button variant="secondary" onClick={() => toast.add({ type: 'info', title: 'New version available' })}>
        Info
      </Button>
      <Toaster />
    </div>
  );
}
