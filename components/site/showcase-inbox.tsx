'use client';

import { Archive, ArchiveRestore, AtSign, Check, CheckCheck, Clock, CreditCard, Gauge, Mail, MessageSquare } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import {
  NotificationInbox,
  NotificationInboxActions,
  NotificationInboxBody,
  NotificationInboxContent,
  NotificationInboxFooter,
  NotificationInboxGroup,
  NotificationInboxHeader,
  NotificationInboxTab,
  NotificationInboxTabs,
  NotificationInboxTabsList,
  NotificationInboxTitle,
  NotificationInboxTrigger,
  NotificationItem,
  NotificationItemAside,
  NotificationItemContent,
  NotificationItemDescription,
  NotificationItemMedia,
  NotificationItemQuickAction,
  NotificationItemQuickActions,
  NotificationItemTime,
  NotificationItemTitle,
} from '@/registry/kosmos/ui/notification-inbox';

type ShowcaseNotification = {
  id: string;
  day: string;
  title: React.ReactNode;
  description?: string;
  time: string;
  dateTime: string;
  avatar: { src: string; fallback: string; square?: boolean };
  icon: React.ReactNode;
  unread?: boolean;
};

/** Lena Park's notifications at noon on 11 October, the same as the Analytics dashboard's. */
const notifications: ShowcaseNotification[] = [
  {
    id: 'mention',
    day: 'Today',
    title: (
      <>
        <strong>Tomás Ortega</strong> mentioned you in <strong>Q4 roadmap</strong>
      </>
    ),
    description: '@Lena can you check the activation funnel numbers before the Friday review?',
    time: '4m',
    dateTime: '2026-10-11T11:56:00Z',
    avatar: { src: '/avatars/tomas.jpg', fallback: 'TO' },
    icon: <AtSign />,
    unread: true,
  },
  {
    id: 'quota',
    day: 'Today',
    title: (
      <>
        <strong>Cirrus Weather</strong> has used 80% of its October event allowance
      </>
    ),
    time: '1h',
    dateTime: '2026-10-11T10:58:00Z',
    avatar: { src: '/logos/cirrus.svg', fallback: 'C', square: true },
    icon: <Gauge />,
    unread: true,
  },
  {
    id: 'comment',
    day: 'Today',
    title: (
      <>
        <strong>Ama Mensah</strong> and <strong>3 others</strong> commented on <strong>Onboarding checklist</strong>
      </>
    ),
    description: 'Moved the invite step after the first event, so new teams see data sooner.',
    time: '2h',
    dateTime: '2026-10-11T09:40:00Z',
    avatar: { src: '/avatars/ama.jpg', fallback: 'AM' },
    icon: <MessageSquare />,
  },
  {
    id: 'billing',
    day: 'Today',
    title: (
      <>
        <strong>Ironbark Logistics</strong> moved to the Scale plan
      </>
    ),
    time: '3h',
    dateTime: '2026-10-11T09:02:00Z',
    avatar: { src: '/logos/ironbark.svg', fallback: 'I', square: true },
    icon: <CreditCard />,
  },
  {
    id: 'trial',
    day: 'Yesterday',
    title: (
      <>
        <strong>Marigold Recipes</strong> ends its trial in 11 days
      </>
    ),
    time: 'Yesterday',
    dateTime: '2026-10-10T15:10:00Z',
    avatar: { src: '/logos/marigold.svg', fallback: 'M', square: true },
    icon: <Clock />,
  },
];

type InboxTab = 'all' | 'unread' | 'archive';

/** What the visitor has read and archived. The dashboard keeps it, so it survives a page change. */
export type ShowcaseInboxState = { read: Set<string>; archived: Set<string> };

export const initialInboxState: ShowcaseInboxState = {
  read: new Set(notifications.filter((item) => !item.unread).map((item) => item.id)),
  archived: new Set(),
};

const emptyInbox: Record<InboxTab, string> = {
  all: 'You’re all caught up',
  unread: 'You’re all caught up',
  archive: 'Notifications you archive show up here',
};

const toggle = (set: Set<string>, id: string) => {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

/** The bell in each page header of the dashboard showcase, as the dashboard blocks have it. */
export function ShowcaseInbox({
  state,
  onStateChange,
  onViewAll,
}: {
  state: ShowcaseInboxState;
  onStateChange: (state: ShowcaseInboxState) => void;
  onViewAll: () => void;
}) {
  const { read, archived } = state;
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<InboxTab>('all');
  const inbox = notifications.filter((item) => !archived.has(item.id));
  const unread = inbox.filter((item) => !read.has(item.id)).length;
  const shown = tab === 'archive' ? notifications.filter((item) => archived.has(item.id)) : tab === 'unread' ? inbox.filter((item) => !read.has(item.id)) : inbox;
  const days = [...new Set(shown.map((item) => item.day))];

  return (
    <NotificationInbox open={open} onOpenChange={setOpen}>
      <NotificationInboxTrigger count={unread} />
      <NotificationInboxContent>
        <NotificationInboxHeader>
          <NotificationInboxTitle>Notifications</NotificationInboxTitle>
          {unread > 0 ? (
            <NotificationInboxActions>
              <Button variant="ghost" size="sm" onClick={() => onStateChange({ ...state, read: new Set(notifications.map((item) => item.id)) })}>
                <CheckCheck data-icon="inline-start" aria-hidden />
                Mark all as read
              </Button>
            </NotificationInboxActions>
          ) : null}
        </NotificationInboxHeader>
        <NotificationInboxTabs value={tab} onValueChange={(value) => setTab(value as InboxTab)}>
          <NotificationInboxTabsList>
            <NotificationInboxTab value="all">All</NotificationInboxTab>
            <NotificationInboxTab value="unread">Unread {unread > 0 ? <Badge>{unread}</Badge> : null}</NotificationInboxTab>
            <NotificationInboxTab value="archive">Archive</NotificationInboxTab>
          </NotificationInboxTabsList>
          <NotificationInboxBody>
            {shown.length === 0 ? (
              <p className="px-4 py-10 text-center text-small text-muted-foreground">{emptyInbox[tab]}</p>
            ) : (
              days.map((day) => (
                <NotificationInboxGroup key={day} label={day}>
                  {shown
                    .filter((item) => item.day === day)
                    .map((item) => (
                      <NotificationItem key={item.id} unread={!read.has(item.id) && !archived.has(item.id)}>
                        <NotificationItemMedia icon={item.icon}>
                          <Avatar className={item.avatar.square ? 'rounded-md' : undefined}>
                            <AvatarImage src={item.avatar.src} alt="" />
                            <AvatarFallback className={item.avatar.square ? 'rounded-md' : undefined}>{item.avatar.fallback}</AvatarFallback>
                          </Avatar>
                        </NotificationItemMedia>
                        <NotificationItemContent>
                          <NotificationItemTitle
                            href={`#${item.id}`}
                            onClick={(event) => {
                              event.preventDefault();
                              if (!read.has(item.id)) onStateChange({ ...state, read: toggle(read, item.id) });
                            }}
                          >
                            {item.title}
                          </NotificationItemTitle>
                          {item.description ? <NotificationItemDescription>{item.description}</NotificationItemDescription> : null}
                        </NotificationItemContent>
                        <NotificationItemAside>
                          <NotificationItemTime dateTime={item.dateTime}>{item.time}</NotificationItemTime>
                          <NotificationItemQuickActions>
                            {archived.has(item.id) ? null : (
                              <NotificationItemQuickAction
                                label={read.has(item.id) ? 'Mark as unread' : 'Mark as read'}
                                onClick={() => onStateChange({ ...state, read: toggle(read, item.id) })}
                              >
                                {read.has(item.id) ? <Mail /> : <Check />}
                              </NotificationItemQuickAction>
                            )}
                            <NotificationItemQuickAction
                              label={archived.has(item.id) ? 'Move to inbox' : 'Archive'}
                              onClick={() => onStateChange({ read: new Set(read).add(item.id), archived: toggle(archived, item.id) })}
                            >
                              {archived.has(item.id) ? <ArchiveRestore /> : <Archive />}
                            </NotificationItemQuickAction>
                          </NotificationItemQuickActions>
                        </NotificationItemAside>
                      </NotificationItem>
                    ))}
                </NotificationInboxGroup>
              ))
            )}
          </NotificationInboxBody>
        </NotificationInboxTabs>
        <NotificationInboxFooter>
          <Button
            variant="item"
            onClick={() => {
              setOpen(false);
              onViewAll();
            }}
          >
            View all notifications
          </Button>
        </NotificationInboxFooter>
      </NotificationInboxContent>
    </NotificationInbox>
  );
}
