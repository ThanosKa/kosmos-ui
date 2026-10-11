'use client';

import { useEffect, useRef } from 'react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { ScrollArea, ScrollBar, type ScrollAreaProps } from '@/registry/kosmos/ui/scroll-area';

const events = [
  'Deployed web to production',
  'Opened pull request #482',
  'Invited Dana to Billing',
  'Rotated the API key for staging',
  'Merged release 2.14.0',
  'Archived 12 stale branches',
  'Updated the billing address',
  'Exported invoices for September',
  'Paused the nightly backup',
  'Resolved incident INC-207',
  'Added a custom domain',
  'Removed Sam from Support',
  'Raised the request limit to 600/min',
  'Enabled two-factor sign-in',
  'Created the Analytics project',
  'Renamed Ops to Platform',
];

function EventList({ count = events.length }: { count?: number }) {
  return (
    <ul className="divide-y divide-border">
      {events.slice(0, count).map((event, index) => (
        <li key={event} className="flex items-baseline justify-between gap-3 px-3 py-2.5">
          <span className="truncate text-body">{event}</span>
          <span className="shrink-0 text-caption text-muted-foreground tabular-nums">{index + 2}m ago</span>
        </li>
      ))}
    </ul>
  );
}

/** Pins the scroll position, so one screenshot shows the top, middle and end fades. */
function PinnedScrollArea({ at, ...props }: ScrollAreaProps & { at: 'start' | 'middle' | 'end' }) {
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const max = element.scrollHeight - element.clientHeight;
    element.scrollTop = at === 'end' ? max : at === 'middle' ? max / 2 : 0;
  }, [at]);
  return <ScrollArea viewportRef={viewport} {...props} />;
}

const card = 'rounded-2xl border border-transparent bg-card p-1 shadow-card';

export default function ScrollAreaPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Vertical: at the top, scrolled, at the end">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(['start', 'middle', 'end'] as const).map((at) => (
            <div key={at} className="flex flex-col gap-2">
              <span className="text-caption text-muted-foreground">{at}</span>
              <div className={card}>
                <PinnedScrollArea at={at} className="h-56 rounded-xl">
                  <EventList />
                </PinnedScrollArea>
              </div>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Horizontal">
        <div className={card}>
          <ScrollArea className="rounded-xl">
            <div className="flex w-max gap-2 p-2">
              {events.slice(0, 10).map((event) => (
                <div
                  key={event}
                  className="flex w-44 shrink-0 flex-col gap-1 rounded-lg bg-muted p-3"
                >
                  <span className="truncate text-body font-medium">{event}</span>
                  <span className="text-caption text-muted-foreground">Today</span>
                </div>
              ))}
            </div>
            {/* shadcn-style child: ScrollArea already renders this scrollbar, so it adds nothing. */}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </PreviewSection>

      <PreviewSection title="Both axes">
        <div className={card}>
          <ScrollArea className="h-48 rounded-xl">
            <div className="grid w-max grid-cols-[repeat(12,6rem)] gap-px bg-border">
              {Array.from({ length: 12 * 10 }, (_, cell) => (
                <div key={cell} className="bg-card px-3 py-2 text-caption text-muted-foreground tabular-nums">
                  R{Math.floor(cell / 12) + 1} · C{(cell % 12) + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PreviewSection>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <PreviewSection title="Content that fits: no scrollbar, no fade">
          <div className={card}>
            <ScrollArea className="max-h-56 rounded-xl">
              <EventList count={3} />
            </ScrollArea>
          </div>
        </PreviewSection>

        <PreviewSection title="fade={false}">
          <div className={card}>
            <ScrollArea className="h-56 rounded-xl" fade={false}>
              <EventList />
            </ScrollArea>
          </div>
        </PreviewSection>
      </div>

      <PreviewSection title="Long text in a narrow slot">
        <div className={`${card} w-full max-w-72`}>
          <ScrollArea className="max-h-40 rounded-xl">
            <div className="flex flex-col gap-3 p-3 text-small text-muted-foreground">
              <p>
                Every request to the API counts toward the limit of the workspace it belongs to. When a workspace goes over
                its limit, further requests get a 429 response until the window resets.
              </p>
              <p>
                Limits reset every minute. Raise the limit from the billing page, or spread requests out with a queue so a
                burst never reaches the limit at all.
              </p>
            </div>
          </ScrollArea>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
