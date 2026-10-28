'use client';

import { Check, CheckCheck, Gauge, AtSign, MessageSquare, Settings, Undo2, UserPlus } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
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
  NotificationItemQuickAction,
  NotificationItemQuickActions,
  NotificationItemTime,
  NotificationItemTitle,
} from '@/registry/kosmos/ui/notification-inbox';

const initial = [
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
    actions: ['Reply', 'Open roadmap'],
    read: false,
    done: false,
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
    actions: ['Approve', 'Decline'],
    read: false,
    done: false,
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
    actions: ['Raise limit'],
    read: false,
    done: false,
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
    read: true,
    done: false,
  },
];

export default function NotificationInboxSheet() {
  const [items, setItems] = React.useState(initial);
  const [tab, setTab] = React.useState('inbox');
  const unread = items.filter((item) => !item.read && !item.done).length;
  const shown = items.filter((item) => (tab === 'done' ? item.done : !item.done));

  const update = (id: string, patch: { read?: boolean; done?: boolean }) =>
    setItems((all) => all.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <NotificationInbox variant="sheet">
      <NotificationInboxTrigger count={unread} />
      <NotificationInboxContent>
        <NotificationInboxHeader>
          <NotificationInboxTitle>Notifications</NotificationInboxTitle>
          <NotificationInboxActions>
            {unread > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setItems((all) => all.map((item) => ({ ...item, read: true })))}
              >
                <CheckCheck data-icon="inline-start" />
                Mark all as read
              </Button>
            ) : null}
          </NotificationInboxActions>
        </NotificationInboxHeader>

        <NotificationInboxTabs value={tab} onValueChange={setTab}>
          <NotificationInboxTabsList>
            <NotificationInboxTab value="inbox">Inbox</NotificationInboxTab>
            <NotificationInboxTab value="done">Done</NotificationInboxTab>
          </NotificationInboxTabsList>
          <NotificationInboxBody>
            {shown.length === 0 ? (
              <EmptyState
                variant="first-use"
                title={tab === 'done' ? 'Nothing done yet' : 'Inbox zero'}
                description={
                  tab === 'done' ? 'Notifications you mark done show up here.' : 'You’ve handled everything. Nice.'
                }
                className="py-10"
              />
            ) : (
              <NotificationInboxGroup label="Today">
                {shown.map((item) => (
                  <NotificationItem key={item.id} unread={!item.read && !item.done}>
                    <NotificationItemMedia icon={item.icon}>
                      <Avatar className={item.square ? 'rounded-md' : undefined}>
                        <AvatarImage src={item.avatar} alt="" />
                        <AvatarFallback className={item.square ? 'rounded-md' : undefined}>{item.fallback}</AvatarFallback>
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
                      {item.actions && !item.done ? (
                        <NotificationItemActions>
                          {item.actions.map((label, index) => (
                            <Button
                              key={label}
                              variant={index === 0 ? 'secondary' : 'ghost'}
                              size="sm"
                              onClick={() => update(item.id, { read: true, done: true })}
                            >
                              {label}
                            </Button>
                          ))}
                        </NotificationItemActions>
                      ) : null}
                    </NotificationItemContent>
                    <NotificationItemAside>
                      <NotificationItemTime dateTime="2026-10-11">{item.time}</NotificationItemTime>
                      <NotificationItemQuickActions>
                        <NotificationItemQuickAction
                          label={item.done ? 'Move back to inbox' : 'Done'}
                          onClick={() => update(item.id, { done: !item.done, read: true })}
                        >
                          {item.done ? <Undo2 /> : <Check />}
                        </NotificationItemQuickAction>
                      </NotificationItemQuickActions>
                    </NotificationItemAside>
                  </NotificationItem>
                ))}
              </NotificationInboxGroup>
            )}
          </NotificationInboxBody>
        </NotificationInboxTabs>

        <NotificationInboxFooter>
          <Button variant="item">
            <Settings data-icon="inline-start" />
            Preferences
          </Button>
          <Button variant="item">Open full inbox</Button>
        </NotificationInboxFooter>
      </NotificationInboxContent>
    </NotificationInbox>
  );
}
