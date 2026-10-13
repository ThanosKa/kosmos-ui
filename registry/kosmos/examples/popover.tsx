'use client';

import { Bell, Calendar, Info } from 'lucide-react';
import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { ScrollToMiddle } from '@/components/preview/scroll-to-middle';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/registry/kosmos/ui/popover';

const stageClass = 'h-[22rem]';

const changes = [
  'Four seats added on August 4.',
  'Data retention add-on moved to the yearly rate.',
  'Two seats removed on August 19.',
  'Priority support added for the rest of the quarter.',
  'A credit of $120 from the July outage.',
  'Sales tax updated for the new billing address.',
];

function ChangesPopover({ container, scrolled }: { container: HTMLElement; scrolled?: boolean }) {
  return (
    <Popover open>
      <PopoverTrigger render={<Button variant="secondary" />}>What changed</PopoverTrigger>
      <PopoverContent container={container} initialFocus={false} align="start" className="max-h-56 w-56">
        {scrolled ? <ScrollToMiddle /> : null}
        <PopoverHeader>
          <PopoverTitle>Changes this quarter</PopoverTitle>
          <PopoverDescription>Everything that moved the total since the last invoice.</PopoverDescription>
        </PopoverHeader>
        <ul className="flex flex-col divide-y divide-border">
          {changes.map((change) => (
            <li key={change} className="py-2">
              {change}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export default function PopoverPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Open">
        <OverlayStageGrid>
          <OverlayStage label="bottom, center (default)" className={stageClass}>
            {(container) => (
              <div className="flex justify-center pt-4">
                <Popover open>
                  <PopoverTrigger render={<Button variant="secondary" />}>
                    <Bell data-icon="inline-start" />
                    Notifications
                  </PopoverTrigger>
                  <PopoverContent container={container} initialFocus={false}>
                    <PopoverHeader>
                      <PopoverTitle>Turn on notifications?</PopoverTitle>
                      <PopoverDescription>Get an email when someone assigns you a task or mentions you.</PopoverDescription>
                    </PopoverHeader>
                    <div className="flex justify-end gap-2">
                      <PopoverClose render={<Button variant="secondary" size="sm" />}>Not now</PopoverClose>
                      <Button variant="primary" size="sm">
                        Turn on
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </OverlayStage>

          <OverlayStage label="top, end" className={stageClass}>
            {(container) => (
              <div className="flex h-full items-end justify-end pb-4">
                <Popover open>
                  <PopoverTrigger render={<Button variant="secondary" />}>
                    <Calendar data-icon="inline-start" />
                    Oct 24
                  </PopoverTrigger>
                  <PopoverContent container={container} initialFocus={false} side="top" align="end">
                    <PopoverHeader>
                      <PopoverTitle>Due date</PopoverTitle>
                      <PopoverDescription>3 days left. Tomás Ortega gets a reminder the day before.</PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </OverlayStage>

          <OverlayStage label="right, start" className={stageClass}>
            {(container) => (
              <div className="flex items-start pt-4">
                <Popover open>
                  <PopoverTrigger render={<Button variant="ghost" size="icon" aria-label="About this metric" />}>
                    <Info />
                  </PopoverTrigger>
                  <PopoverContent
                    container={container}
                    initialFocus={false}
                    side="right"
                    align="start"
                    className="w-56"
                  >
                    <PopoverDescription>
                      Active users counts everyone who opened the app at least once in the last 28 days.
                    </PopoverDescription>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </OverlayStage>

          <OverlayStage label="long text, no room below (flips up)" className={stageClass}>
            {(container) => (
              <div className="flex h-full items-end justify-center pb-4">
                <Popover open>
                  <PopoverTrigger render={<Button variant="secondary" />}>Billing details</PopoverTrigger>
                  <PopoverContent container={container} initialFocus={false}>
                    <PopoverHeader>
                      <PopoverTitle>Why is this invoice higher than the previous quarterly invoice?</PopoverTitle>
                      <PopoverDescription>
                        Four seats were added in August and the data retention add-on moved to the new yearly rate. Both
                        changes are prorated from the day they started.
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </OverlayStage>

          <OverlayStage label="more content than fits, at the top" className={stageClass}>
            {(container) => (
              <div className="pt-4">
                <ChangesPopover container={container} />
              </div>
            )}
          </OverlayStage>

          <OverlayStage label="more content than fits, scrolled halfway" className={stageClass}>
            {(container) => (
              <div className="pt-4">
                <ChangesPopover container={container} scrolled />
              </div>
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Live (with trigger)">
        <div className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger render={<Button variant="secondary" />}>
              <Bell data-icon="inline-start" />
              Notifications
            </PopoverTrigger>
            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle>Turn on notifications?</PopoverTitle>
                <PopoverDescription>Get an email when someone assigns you a task or mentions you.</PopoverDescription>
              </PopoverHeader>
              <div className="flex justify-end gap-2">
                <PopoverClose render={<Button variant="secondary" size="sm" />}>Not now</PopoverClose>
                <PopoverClose render={<Button variant="primary" size="sm" />}>Turn on</PopoverClose>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
