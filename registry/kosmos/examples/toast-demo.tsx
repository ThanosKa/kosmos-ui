'use client';

import { Button } from '@/registry/kosmos/ui/button';
import { Toaster, toast } from '@/registry/kosmos/ui/toast';

export default function ToastDemo() {
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => toast.add({ title: 'Invite sent', description: 'Ana Lopez will get an email in a minute.' })}
      >
        Send invite
      </Button>
      {/* In an app, render one Toaster in the root layout instead. */}
      <Toaster />
    </>
  );
}
