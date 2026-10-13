'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { ScrollToMiddle } from '@/components/preview/scroll-to-middle';
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
  DialogTrigger,
} from '@/registry/kosmos/ui/dialog';

const projects = [
  'Fernhill Books',
  'Brightloop Fitness',
  'Copperline Bank',
  'Saltmarsh Coffee',
  'Driftwood Travel',
  'Hollow Oak Games',
  'Cirrus Weather',
  'Pebble & Pine',
  'Marigold Recipes',
  'Kiln Studio',
  'Tidepool Notes',
  'Ironbark Logistics',
];

export default function DialogPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Open">
        <OverlayStageGrid>
          <OverlayStage label="header, body, footer">
            {(container) => (
              <Dialog open modal={false}>
                <DialogContent container={container} initialFocus={false}>
                  <DialogHeader>
                    <DialogTitle>Invite to workspace</DialogTitle>
                    <DialogDescription>New members can see every project in Acme.</DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <p>We will email an invite to kai@acme.example. It expires in 7 days.</p>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
                    <Button variant="primary">Send invite</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </OverlayStage>

          <OverlayStage label="confirm, no close button">
            {(container) => (
              <Dialog open modal={false}>
                <DialogContent container={container} initialFocus={false} showCloseButton={false}>
                  <DialogHeader>
                    <DialogTitle>Delete project?</DialogTitle>
                    <DialogDescription>
                      Kiln Studio and its 2,400 events will be deleted. You can&apos;t undo this.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
                    <Button variant="destructive">Delete project</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </OverlayStage>

          <OverlayStage label="body taller than the screen">
            {(container) => (
              <Dialog open modal={false}>
                <DialogContent container={container} initialFocus={false}>
                  <DialogHeader>
                    <DialogTitle>Projects</DialogTitle>
                    <DialogDescription>12 projects send events to Acme.</DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <ul className="flex flex-col divide-y divide-border">
                      {projects.map((name) => (
                        <li key={name} className="py-2">
                          {name}
                        </li>
                      ))}
                    </ul>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose render={<Button variant="primary" />}>Done</DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </OverlayStage>

          <OverlayStage label="body scrolled halfway">
            {(container) => (
              <Dialog open modal={false}>
                <DialogContent container={container} initialFocus={false}>
                  <DialogHeader>
                    <DialogTitle>Projects</DialogTitle>
                    <DialogDescription>12 projects send events to Acme.</DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <ScrollToMiddle />
                    <ul className="flex flex-col divide-y divide-border">
                      {projects.map((name) => (
                        <li key={name} className="py-2">
                          {name}
                        </li>
                      ))}
                    </ul>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose render={<Button variant="primary" />}>Done</DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </OverlayStage>

          <OverlayStage label="long title and text">
            {(container) => (
              <Dialog open modal={false}>
                <DialogContent container={container} initialFocus={false}>
                  <DialogHeader>
                    <DialogTitle>Move the quarterly planning documents to the shared archive folder?</DialogTitle>
                    <DialogDescription>
                      Everyone with access to the archive will see the 18 documents, including their comments and
                      version history. Admins keep edit rights.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose render={<Button variant="secondary" />}>Keep them here</DialogClose>
                    <Button variant="primary">Move 18 documents</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Live (modal, with trigger)">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger render={<Button variant="secondary" />}>Invite member</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite to workspace</DialogTitle>
                <DialogDescription>New members can see every project in Acme.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <p>We will email an invite to kai@acme.example. It expires in 7 days.</p>
              </DialogBody>
              <DialogFooter>
                <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
                <DialogClose render={<Button variant="primary" />}>Send invite</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
