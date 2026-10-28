'use client';

import { Archive, AtSign, BellOff, Check, Gauge, MessageSquare, UserPlus } from 'lucide-react';
import type * as React from 'react';
import { OverlayStage, OverlayStageGrid } from '@/components/preview/overlay-stage';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';
import { EmptyState } from '@/registry/kosmos/ui/empty';
import {
  NotificationBell,
  NotificationInbox,
  NotificationInboxActions,
  NotificationInboxBody,
  NotificationInboxContent,
  NotificationInboxFooter,
  NotificationInboxGroup,
  NotificationInboxHeader,
  NotificationInboxNewItems,
  NotificationInboxTab,
  NotificationInboxTabs,
  NotificationInboxTabsList,
  NotificationInboxTitle,
  NotificationInboxTrigger,
  NotificationItem,
  NotificationItemActions,
  NotificationItemAside,
  NotificationItemContent,
  NotificationItemDescription,
  NotificationItemMedia,
  NotificationItemMeta,
  NotificationItemQuickAction,
  NotificationItemQuickActions,
  NotificationItemTime,
  NotificationItemTitle,
} from '@/registry/kosmos/ui/notification-inbox';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';

const stageClass = 'h-[42rem]';

type Row = {
  id: string;
  time: string;
  avatar: string;
  fallback: string;
  square?: boolean;
  icon: React.ReactNode;
  title: React.ReactNode;
  quote?: string;
  meta?: string;
  request?: boolean;
  unread?: boolean;
};

const rows: Row[] = [
  {
    id: 'mention',
    time: '4m',
    avatar: '/avatars/tomas.jpg',
    fallback: 'TO',
    icon: <AtSign />,
    title: (
      <>
        <strong>Tomás Ortega</strong> mentioned you in <strong>Q4 roadmap</strong>
      </>
    ),
    quote: '@Lena can you check the activation funnel numbers before the Friday review?',
    unread: true,
  },
  {
    id: 'request',
    time: '18m',
    avatar: '/avatars/kai.jpg',
    fallback: 'KN',
    icon: <UserPlus />,
    title: (
      <>
        <strong>Kai Nakamura</strong> asked for access to <strong>Copperline Bank</strong>
      </>
    ),
    request: true,
    unread: true,
  },
  {
    id: 'quota',
    time: '1h',
    avatar: '/logos/cirrus.svg',
    fallback: 'C',
    square: true,
    icon: <Gauge />,
    title: (
      <>
        <strong>Cirrus Weather</strong> has used 80% of its October event allowance
      </>
    ),
    meta: 'Cirrus Weather',
    unread: true,
  },
  {
    id: 'comment',
    time: '2h',
    avatar: '/avatars/ama.jpg',
    fallback: 'AM',
    icon: <MessageSquare />,
    title: (
      <>
        <strong>Ama Mensah</strong> and <strong>3 others</strong> commented on <strong>Onboarding checklist</strong>
      </>
    ),
    quote: 'Moved the invite step after the first event, so new teams see data sooner.',
  },
];

const longRow: Row = {
  id: 'long',
  time: 'Yesterday',
  avatar: '/logos/fernhill.svg',
  fallback: 'F',
  square: true,
  icon: <Archive />,
  title: (
    <>
      <strong>Events export for Fernhill Books, every event from 1 January to 30 September 2026</strong> is ready to
      download
    </>
  ),
  quote:
    'The export holds 3,912,400 events in 41 files. Links stay valid for 7 days, then the files are deleted and the export has to be run again.',
  meta: 'Fernhill Books · fernhill.example',
  unread: true,
};

function NotificationRow({ row, hovered }: { row: Row; hovered?: boolean }) {
  return (
    <NotificationItem unread={row.unread} className={hovered ? 'bg-accent' : undefined}>
      <NotificationItemMedia icon={row.icon}>
        <Avatar className={row.square ? 'rounded-md' : undefined}>
          <AvatarImage src={row.avatar} alt="" />
          <AvatarFallback className={row.square ? 'rounded-md' : undefined}>{row.fallback}</AvatarFallback>
        </Avatar>
      </NotificationItemMedia>
      <NotificationItemContent>
        <NotificationItemTitle href="#notifications">{row.title}</NotificationItemTitle>
        {row.quote ? <NotificationItemDescription>{row.quote}</NotificationItemDescription> : null}
        {row.request ? (
          <NotificationItemActions>
            <Button variant="primary" size="sm">
              Approve
            </Button>
            <Button variant="secondary" size="sm">
              Decline
            </Button>
          </NotificationItemActions>
        ) : null}
        {row.meta ? <NotificationItemMeta>{row.meta}</NotificationItemMeta> : null}
      </NotificationItemContent>
      <NotificationItemAside>
        <NotificationItemTime dateTime="2026-10-11" className={hovered ? '[@media(hover:hover)]:opacity-0' : undefined}>
          {row.time}
        </NotificationItemTime>
        <NotificationItemQuickActions className={hovered ? '[@media(hover:hover)]:pointer-events-auto [@media(hover:hover)]:opacity-100' : undefined}>
          <NotificationItemQuickAction label="Mark as read">
            <Check />
          </NotificationItemQuickAction>
          <NotificationItemQuickAction label="Archive">
            <Archive />
          </NotificationItemQuickAction>
        </NotificationItemQuickActions>
      </NotificationItemAside>
    </NotificationItem>
  );
}

function Inbox({
  container,
  variant = 'popover',
  children,
  overlay,
  unread = 3,
}: {
  container: HTMLElement;
  variant?: 'popover' | 'sheet';
  children: React.ReactNode;
  overlay?: React.ReactNode;
  unread?: number;
}) {
  return (
    <div className="flex justify-end">
      <NotificationInbox variant={variant} open modal={false}>
        <NotificationInboxTrigger count={unread} />
        <NotificationInboxContent container={container} initialFocus={false}>
          <NotificationInboxHeader>
            <NotificationInboxTitle>Notifications</NotificationInboxTitle>
            <NotificationInboxActions>
              {unread > 0 ? (
                <Button variant="ghost" size="sm">
                  Mark all as read
                </Button>
              ) : null}
            </NotificationInboxActions>
          </NotificationInboxHeader>
          <NotificationInboxTabs defaultValue="all">
            <NotificationInboxTabsList>
              <NotificationInboxTab value="all">All</NotificationInboxTab>
              <NotificationInboxTab value="unread">Unread</NotificationInboxTab>
              <NotificationInboxTab value="archive">Archive</NotificationInboxTab>
            </NotificationInboxTabsList>
            <NotificationInboxBody overlay={overlay}>{children}</NotificationInboxBody>
          </NotificationInboxTabs>
          <NotificationInboxFooter>
            <Button variant="item">View all notifications</Button>
          </NotificationInboxFooter>
        </NotificationInboxContent>
      </NotificationInbox>
    </div>
  );
}

export default function NotificationInboxPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Bell">
        <div className="flex flex-wrap items-center gap-8">
          {[0, 3, 9, 12].map((count) => (
            <figure key={count} className="flex flex-col items-center gap-2">
              <NotificationBell count={count} />
              <figcaption className="font-mono text-caption text-muted-foreground">count {count}</figcaption>
            </figure>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Popover">
        <OverlayStageGrid>
          <OverlayStage label="open, second row hovered" className={stageClass}>
            {(container) => (
              <Inbox container={container}>
                <NotificationInboxGroup label="Today">
                  {rows.map((row, index) => (
                    <NotificationRow key={row.id} row={row} hovered={index === 1} />
                  ))}
                </NotificationInboxGroup>
              </Inbox>
            )}
          </OverlayStage>
          <OverlayStage label="new items while open, long text" className={stageClass}>
            {(container) => (
              <Inbox
                container={container}
                overlay={<NotificationInboxNewItems count={2}>2 new</NotificationInboxNewItems>}
              >
                <NotificationInboxGroup label="Yesterday">
                  <NotificationRow row={longRow} />
                  <NotificationRow row={rows[3]} />
                </NotificationInboxGroup>
              </Inbox>
            )}
          </OverlayStage>
          <OverlayStage label="empty" className={stageClass}>
            {(container) => (
              <Inbox container={container} unread={0}>
                <EmptyState
                  variant="first-use"
                  icon={<BellOff />}
                  title="You’re all caught up"
                  description="New mentions, requests and alerts show up here."
                  className="py-10"
                />
              </Inbox>
            )}
          </OverlayStage>
          <OverlayStage label="loading" className={stageClass}>
            {(container) => (
              <Inbox container={container} unread={0}>
                <div aria-busy className="flex flex-col divide-y divide-border">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex gap-3 px-4 py-3">
                      <Skeleton className="size-8 shrink-0 rounded-full" />
                      <div className="flex flex-1 flex-col gap-2 pt-1">
                        <Skeleton className="h-3 w-4/5" />
                        <Skeleton className="h-3 w-2/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </Inbox>
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>

      <PreviewSection title="Sheet">
        <OverlayStageGrid>
          <OverlayStage label="variant sheet" className={stageClass}>
            {(container) => (
              <Inbox container={container} variant="sheet">
                <NotificationInboxGroup label="Today">
                  {rows.map((row) => (
                    <NotificationRow key={row.id} row={row} />
                  ))}
                </NotificationInboxGroup>
              </Inbox>
            )}
          </OverlayStage>
        </OverlayStageGrid>
      </PreviewSection>
    </PreviewStack>
  );
}
