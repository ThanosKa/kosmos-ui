'use client';

import {
  Archive,
  ArchiveRestore,
  AtSign,
  BellOff,
  Check,
  CheckCheck,
  Download,
  Gauge,
  Mail,
  MessageSquare,
  Settings,
  UserPlus,
} from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { EmptyState } from '@/registry/kosmos/ui/empty';
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
import { Toaster, toast } from '@/registry/kosmos/ui/toast';

type Notification = {
  id: string;
  day: 'Today' | 'Yesterday';
  time: string;
  dateTime: string;
  avatar: { src: string; fallback: string; square?: boolean };
  icon: React.ReactNode;
  title: React.ReactNode;
  quote?: string;
  meta?: string;
  request?: boolean;
  download?: boolean;
  read: boolean;
  archived: boolean;
};

const initial: Notification[] = [
  {
    id: 'mention',
    day: 'Today',
    time: '4m',
    dateTime: '2026-10-11T11:56:00Z',
    avatar: { src: '/avatars/tomas.jpg', fallback: 'TO' },
    icon: <AtSign />,
    title: (
      <>
        <strong>Tomás Ortega</strong> mentioned you in <strong>Q4 roadmap</strong>
      </>
    ),
    quote: '@Lena can you check the activation funnel numbers before the Friday review?',
    read: false,
    archived: false,
  },
  {
    id: 'request',
    day: 'Today',
    time: '18m',
    dateTime: '2026-10-11T11:42:00Z',
    avatar: { src: '/avatars/kai.jpg', fallback: 'KN' },
    icon: <UserPlus />,
    title: (
      <>
        <strong>Kai Nakamura</strong> asked for access to <strong>Copperline Bank</strong>
      </>
    ),
    request: true,
    read: false,
    archived: false,
  },
  {
    id: 'quota',
    day: 'Today',
    time: '1h',
    dateTime: '2026-10-11T10:58:00Z',
    avatar: { src: '/logos/cirrus.svg', fallback: 'C', square: true },
    icon: <Gauge />,
    title: (
      <>
        <strong>Cirrus Weather</strong> has used 80% of its October event allowance
      </>
    ),
    meta: 'Cirrus Weather',
    read: false,
    archived: false,
  },
  {
    id: 'comment',
    day: 'Today',
    time: '2h',
    dateTime: '2026-10-11T09:40:00Z',
    avatar: { src: '/avatars/ama.jpg', fallback: 'AM' },
    icon: <MessageSquare />,
    title: (
      <>
        <strong>Ama Mensah</strong> and <strong>3 others</strong> commented on <strong>Onboarding checklist</strong>
      </>
    ),
    quote: 'Moved the invite step after the first event, so new teams see data sooner.',
    read: true,
    archived: false,
  },
  {
    id: 'export',
    day: 'Yesterday',
    time: 'Yesterday',
    dateTime: '2026-10-10T16:20:00Z',
    avatar: { src: '/logos/fernhill.svg', fallback: 'F', square: true },
    icon: <Download />,
    title: (
      <>
        <strong>Events export for Fernhill Books</strong> is ready to download
      </>
    ),
    download: true,
    read: true,
    archived: false,
  },
];

/** What "Send notification" delivers next, in turn. */
const incoming: Omit<Notification, 'id'>[] = [
  {
    day: 'Today',
    time: 'Now',
    dateTime: '2026-10-11T12:00:00Z',
    avatar: { src: '/avatars/kai.jpg', fallback: 'KN' },
    icon: <AtSign />,
    title: (
      <>
        <strong>Kai Nakamura</strong> mentioned you in <strong>Pricing page test</strong>
      </>
    ),
    quote: '@Lena the yearly toggle lifted upgrades by 6%. Ship it?',
    read: false,
    archived: false,
  },
  {
    day: 'Today',
    time: 'Now',
    dateTime: '2026-10-11T12:00:00Z',
    avatar: { src: '/avatars/ama.jpg', fallback: 'AM' },
    icon: <MessageSquare />,
    title: (
      <>
        <strong>Ama Mensah</strong> replied to your comment on <strong>Empty states</strong>
      </>
    ),
    quote: 'Agreed, the first-run copy should explain what shows up here.',
    read: false,
    archived: false,
  },
];

type Tab = 'all' | 'unread' | 'archive';

export default function NotificationInboxDemo() {
  const [items, setItems] = React.useState(initial);
  const [tab, setTab] = React.useState<Tab>('all');
  const [decided, setDecided] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(0);
  const unread = items.filter((item) => !item.read && !item.archived).length;
  const shown = items.filter((item) =>
    tab === 'archive' ? item.archived : !item.archived && (tab === 'all' || !item.read),
  );

  const update = (id: string, patch: Partial<Notification>) =>
    setItems((all) => all.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  function send() {
    setItems((all) => [{ ...incoming[sent % incoming.length], id: `sent-${sent}` }, ...all]);
    setSent((value) => value + 1);
  }

  function markAllRead() {
    const ids = items.filter((item) => !item.read && !item.archived).map((item) => item.id);
    setItems((all) => all.map((item) => ({ ...item, read: true })));
    toast.add({
      title: `Marked ${ids.length} as read`,
      actionProps: {
        children: 'Undo',
        onClick: () => setItems((all) => all.map((item) => (ids.includes(item.id) ? { ...item, read: false } : item))),
      },
    });
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <NotificationInbox>
        <NotificationInboxTrigger count={unread} />
        <NotificationInboxContent>
          <NotificationInboxHeader>
            <NotificationInboxTitle>Notifications</NotificationInboxTitle>
            <NotificationInboxActions>
              {unread > 0 ? (
                <Button variant="ghost" size="sm" onClick={markAllRead}>
                  <CheckCheck data-icon="inline-start" />
                  Mark all as read
                </Button>
              ) : null}
              <Button variant="ghost" size="icon-sm" aria-label="Notification settings" className="text-muted-foreground">
                <Settings />
              </Button>
            </NotificationInboxActions>
          </NotificationInboxHeader>

          <NotificationInboxTabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
            <NotificationInboxTabsList>
              <NotificationInboxTab value="all">All</NotificationInboxTab>
              <NotificationInboxTab value="unread">
                Unread {unread > 0 ? <Badge>{unread}</Badge> : null}
              </NotificationInboxTab>
              <NotificationInboxTab value="archive">Archive</NotificationInboxTab>
            </NotificationInboxTabsList>

            <NotificationInboxBody>
              {shown.length === 0 ? (
                <EmptyState
                  variant="first-use"
                  icon={<BellOff />}
                  title={tab === 'archive' ? 'Nothing archived' : 'You’re all caught up'}
                  description={
                    tab === 'archive' ? 'Notifications you archive show up here.' : 'New mentions, requests and alerts show up here.'
                  }
                  className="py-10"
                />
              ) : (
                (['Today', 'Yesterday'] as const).map((day) => {
                  const rows = shown.filter((item) => item.day === day);
                  if (rows.length === 0) return null;
                  return (
                    <NotificationInboxGroup key={day} label={day}>
                      {rows.map((item) => (
                        <NotificationItem key={item.id} unread={!item.read && !item.archived}>
                          <NotificationItemMedia icon={item.icon}>
                            <Avatar className={item.avatar.square ? 'rounded-md' : undefined}>
                              <AvatarImage src={item.avatar.src} alt="" />
                              <AvatarFallback className={item.avatar.square ? 'rounded-md' : undefined}>
                                {item.avatar.fallback}
                              </AvatarFallback>
                            </Avatar>
                          </NotificationItemMedia>
                          <NotificationItemContent>
                            <NotificationItemTitle
                              href="#notifications"
                              onClick={(event) => {
                                event.preventDefault();
                                update(item.id, { read: true });
                              }}
                            >
                              {item.title}
                            </NotificationItemTitle>
                            {item.quote ? <NotificationItemDescription>{item.quote}</NotificationItemDescription> : null}
                            {item.request ? (
                              decided ? (
                                <NotificationItemMeta>
                                  {decided === 'approved' ? 'You approved this request.' : 'You declined this request.'}
                                </NotificationItemMeta>
                              ) : (
                                <NotificationItemActions>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                      setDecided('approved');
                                      update(item.id, { read: true });
                                    }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setDecided('declined');
                                      update(item.id, { read: true });
                                    }}
                                  >
                                    Decline
                                  </Button>
                                </NotificationItemActions>
                              )
                            ) : null}
                            {item.download ? (
                              <NotificationItemActions>
                                <Button variant="secondary" size="sm">
                                  Download CSV
                                </Button>
                              </NotificationItemActions>
                            ) : null}
                            {item.meta ? <NotificationItemMeta>{item.meta}</NotificationItemMeta> : null}
                          </NotificationItemContent>
                          <NotificationItemAside>
                            <NotificationItemTime dateTime={item.dateTime}>{item.time}</NotificationItemTime>
                            <NotificationItemQuickActions>
                              {item.archived ? null : (
                                <NotificationItemQuickAction
                                  label={item.read ? 'Mark as unread' : 'Mark as read'}
                                  onClick={() => update(item.id, { read: !item.read })}
                                >
                                  {item.read ? <Mail /> : <Check />}
                                </NotificationItemQuickAction>
                              )}
                              <NotificationItemQuickAction
                                label={item.archived ? 'Move to inbox' : 'Archive'}
                                onClick={() => update(item.id, { archived: !item.archived, read: true })}
                              >
                                {item.archived ? <ArchiveRestore /> : <Archive />}
                              </NotificationItemQuickAction>
                            </NotificationItemQuickActions>
                          </NotificationItemAside>
                        </NotificationItem>
                      ))}
                    </NotificationInboxGroup>
                  );
                })
              )}
            </NotificationInboxBody>
          </NotificationInboxTabs>

          <NotificationInboxFooter>
            <Button variant="item">View all notifications</Button>
          </NotificationInboxFooter>
        </NotificationInboxContent>
      </NotificationInbox>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" size="sm" onClick={send}>
          Send notification
        </Button>
        <Button variant="ghost" size="sm" disabled={unread === 0} onClick={markAllRead}>
          Mark all read
        </Button>
      </div>
      <p className="text-small text-muted-foreground">Send one: the bell swings and the count rolls. Open it to read.</p>
      {/* In an app, render one Toaster in the root layout instead. */}
      <Toaster />
    </div>
  );
}
