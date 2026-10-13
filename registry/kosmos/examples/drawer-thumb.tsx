'use client';

import { ThumbStage } from '@/components/preview/overlay-stage';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/registry/kosmos/ui/drawer';

const details = [
  ['Status', 'In progress'],
  ['Assignee', 'Tomás Ortega'],
  ['Target', 'Q4 2026'],
  ['Votes', '45'],
] as const;

/** The components index thumbnail: the docs demo with its drawer open beside the trigger. */
export default function DrawerThumb() {
  return (
    <ThumbStage className="h-72 max-w-xl">
      {(container) => (
        <Drawer open modal={false}>
          <DrawerTrigger render={<Button variant="secondary" />}>Open roadmap item</DrawerTrigger>
          <DrawerContent container={container} initialFocus={false} className="data-[swipe-direction=right]:max-w-72">
            <DrawerHeader>
              <DrawerTitle>Server-side batching</DrawerTitle>
              <DrawerDescription>Ingestion · added by Lena Park</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                {details.map(([term, value]) => (
                  <div key={term} className="contents">
                    <dt className="text-muted-foreground">{term}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose render={<Button variant="primary" />}>Mark as shipped</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </ThumbStage>
  );
}
