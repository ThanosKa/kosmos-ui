'use client';

import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { ScrollToMiddle } from '@/components/preview/scroll-to-middle';
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
  ['Assignee', 'Tomás Ortega'],
  ['Target', 'Q4 2026'],
  ['Votes', '45'],
  ['Area', 'Ingestion'],
] as const;

const activity = [
  'Tomás Ortega moved the item to In progress',
  'Ama Mensah added a comment',
  'Tomás Ortega attached batching-spec.pdf',
  'Lena Park changed the target to Q4 2026',
  'Kai Nakamura assigned the item to Tomás Ortega',
  'Lena Park created the item',
  'Ama Mensah linked the item to Mobile SDK 3.0',
  'Kai Nakamura set the area to Ingestion',
];

function ItemDetails() {
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
                    <DrawerTitle>Server-side batching</DrawerTitle>
                    <DrawerDescription>Ingestion · added by Lena Park</DrawerDescription>
                  </DrawerHeader>
                  <DrawerBody>
                    <ItemDetails />
                  </DrawerBody>
                  <DrawerFooter>
                    <Button variant="primary">Mark as shipped</Button>
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
                    <DrawerTitle>Share the roadmap</DrawerTitle>
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

          <OverlayStage label="left, body scrolls" className="h-[22rem]">
            {(container) => (
              <Drawer open modal={false} swipeDirection="left">
                <DrawerBackdrop />
                <DrawerContent container={container} initialFocus={false}>
                  <DrawerHeader>
                    <DrawerTitle>Activity</DrawerTitle>
                    <DrawerDescription>Everything that happened on this item.</DrawerDescription>
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

          <OverlayStage label="left, body scrolled halfway" className="h-[22rem]">
            {(container) => (
              <Drawer open modal={false} swipeDirection="left">
                <DrawerBackdrop />
                <DrawerContent container={container} initialFocus={false}>
                  <DrawerHeader>
                    <DrawerTitle>Activity</DrawerTitle>
                    <DrawerDescription>Everything that happened on this item.</DrawerDescription>
                  </DrawerHeader>
                  <DrawerBody>
                    <ScrollToMiddle />
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
                    <DrawerTitle>Backfill the September events Copperline Bank sent before the rate limit was raised</DrawerTitle>
                    <DrawerDescription>
                      The page behind stays usable: scroll it, click it, or keep typing while this panel is open.
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerBody>
                    <ItemDetails />
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
            <DrawerTrigger render={<Button variant="secondary" />}>Open roadmap item</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Server-side batching</DrawerTitle>
                <DrawerDescription>Ingestion · added by Lena Park</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <ItemDetails />
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose render={<Button variant="primary" />}>Mark as shipped</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Drawer swipeDirection="down">
            <DrawerTrigger render={<Button variant="secondary" />}>Share</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Share the roadmap</DrawerTitle>
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
