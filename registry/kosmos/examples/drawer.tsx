'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerBackdrop,
  DrawerTitle,
  DrawerTrigger,
} from '@/registry/kosmos/ui/drawer';

const details = [
  ['Status', 'In progress'],
  ['Owner', 'Ana Lopez'],
  ['Due', 'Oct 24'],
  ['Estimate', '3 days'],
  ['Project', 'Q3 Roadmap'],
] as const;

const activity = [
  'Ana Lopez moved the task to In progress',
  'Ben Carter added a comment',
  'Chen Wei attached spec-v2.pdf',
  'Dara Okafor changed the due date to Oct 24',
  'Elif Demir assigned the task to Ana Lopez',
  'Farah Haddad created the task',
  'Goran Petrovic linked the task to Billing revamp',
  'Hana Sato added the label Backend',
];

function TaskDetails() {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
      {details.map(([term, value]) => (
        <div key={term} className="contents">
          <dt className="text-muted-foreground">{term}</dt>
          <dd className="tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function DrawerPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Open">
        <OverlayStageGrid>
          <OverlayStage label="right (default)">
            {(container) => (
              <Drawer open modal={false}>
                <DrawerBackdrop />
                <DrawerContent container={container} initialFocus={false}>
                  <DrawerHeader>
                    <DrawerTitle>Sync invoices with the ledger</DrawerTitle>
                    <DrawerDescription>Billing revamp · created by Farah Haddad</DrawerDescription>
                  </DrawerHeader>
                  <DrawerBody>
                    <TaskDetails />
                  </DrawerBody>
                  <DrawerFooter>
                    <Button variant="primary">Mark as done</Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            )}
          </OverlayStage>

          <OverlayStage label="down (bottom sheet)">
            {(container) => (
              <Drawer open modal={false} swipeDirection="down">
                <DrawerBackdrop />
                <DrawerContent container={container} initialFocus={false}>
                  <DrawerHeader>
                    <DrawerTitle>Share Q3 Roadmap</DrawerTitle>
                    <DrawerDescription>Anyone with the link can view.</DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <DrawerClose render={<Button variant="secondary" />}>Cancel</DrawerClose>
                    <Button variant="primary">Copy link</Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            )}
          </OverlayStage>

          <OverlayStage label="left, body scrolls">
            {(container) => (
              <Drawer open modal={false} swipeDirection="left">
                <DrawerBackdrop />
                <DrawerContent container={container} initialFocus={false}>
                  <DrawerHeader>
                    <DrawerTitle>Activity</DrawerTitle>
                    <DrawerDescription>Everything that happened on this task.</DrawerDescription>
                  </DrawerHeader>
                  <DrawerBody>
                    <ul className="flex flex-col divide-y divide-border">
                      {activity.map((item) => (
                        <li key={item} className="py-2.5">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            )}
          </OverlayStage>

          <OverlayStage label="non-modal, long title">
            {(container) => (
              <Drawer open modal={false}>
                <DrawerContent container={container} initialFocus={false}>
                  <DrawerHeader>
                    <DrawerTitle>Reconcile the September payouts with the bank statement export</DrawerTitle>
                    <DrawerDescription>
                      The page behind stays usable: scroll it, click it, or keep typing while this panel is open.
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerBody>
                    <TaskDetails />
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Live (modal, with trigger)">
        <div className="flex flex-wrap items-center gap-3">
          <Drawer>
            <DrawerTrigger render={<Button variant="secondary" />}>Open task</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Sync invoices with the ledger</DrawerTitle>
                <DrawerDescription>Billing revamp · created by Farah Haddad</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <TaskDetails />
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose render={<Button variant="primary" />}>Mark as done</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Drawer swipeDirection="down">
            <DrawerTrigger render={<Button variant="secondary" />}>Share</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Share Q3 Roadmap</DrawerTitle>
                <DrawerDescription>Anyone with the link can view.</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose render={<Button variant="secondary" />}>Cancel</DrawerClose>
                <DrawerClose render={<Button variant="primary" />}>Copy link</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
