'use client';

import { Button } from '@/registry/kosmos/ui/button';
import { Toaster, toast } from '@/registry/kosmos/ui/toast';

export default function ToastAction() {
  function archive() {
    const id = toast.add({
      type: 'success',
      title: 'Task archived',
      // A toast with an action stays until it is closed, so nobody misses the chance to undo.
      timeout: 0,
      actionProps: {
        children: 'Undo',
        onClick: () => {
          toast.close(id);
          toast.add({ title: 'Task restored' });
        },
      },
    });
  }
  return (
    <>
      <Button variant="secondary" onClick={archive}>
        Archive task
      </Button>
      <Toaster />
    </>
  );
}
