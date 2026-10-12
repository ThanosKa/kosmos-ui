'use client';

import { ThumbStage } from '@/components/preview/overlay-stage';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/registry/kosmos/ui/dialog';

/** The components index thumbnail: the docs demo with its dialog open. */
export default function DialogThumb() {
  return (
    <ThumbStage className="h-72 max-w-lg">
      {(container) => (
        <Dialog open modal={false}>
          <DialogContent container={container} initialFocus={false}>
            <DialogHeader>
              <DialogTitle>Invite to workspace</DialogTitle>
              <DialogDescription>New members can see every project in Acme.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p>We&apos;ll email an invite to ana@acme.com. It expires in 7 days.</p>
            </DialogBody>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
              <DialogClose render={<Button variant="primary" />}>Send invite</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ThumbStage>
  );
}
