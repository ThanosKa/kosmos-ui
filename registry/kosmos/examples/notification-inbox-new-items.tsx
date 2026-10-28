'use client';

import { ArrowUp, AtSign } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import {
  NotificationInbox,
  NotificationInboxBody,
  NotificationInboxContent,
  NotificationInboxGroup,
  NotificationInboxHeader,
  NotificationInboxNewItems,
  NotificationInboxTitle,
  NotificationInboxTrigger,
  NotificationItem,
  NotificationItemAside,
  NotificationItemContent,
  NotificationItemDescription,
  NotificationItemMedia,
  NotificationItemTime,
  NotificationItemTitle,
} from '@/registry/kosmos/ui/notification-inbox';

type Mention = { id: number; name: string; initials: string; avatar: string; page: string; quote: string; time: string };

const arriving: Mention = {
  id: 0,
  name: 'Kai Nakamura',
  initials: 'KN',
  avatar: '/avatars/kai.jpg',
  page: 'Pricing page test',
  quote: '@Lena the yearly toggle lifted upgrades by 6%. Ship it?',
  time: 'Now',
};

const initial: Mention[] = [
  {
    id: 1,
    name: 'Tomás Ortega',
    initials: 'TO',
    avatar: '/avatars/tomas.jpg',
    page: 'Q4 roadmap',
    quote: '@Lena can you check the activation funnel numbers before the Friday review?',
    time: '4m',
  },
  {
    id: 2,
    name: 'Ama Mensah',
    initials: 'AM',
    avatar: '/avatars/ama.jpg',
    page: 'Onboarding checklist',
    quote: 'Moved the invite step after the first event, so new teams see data sooner.',
    time: '2h',
  },
];

/** A mention arrives 2 seconds after the inbox opens. It waits behind the pill until it is clicked. */
export default function NotificationInboxNewItemsExample() {
  const [items, setItems] = React.useState(initial);
  const [listed, setListed] = React.useState(() => new Set(initial.map((item) => item.id)));
  const [open, setOpen] = React.useState(false);
  const viewport = React.useRef<HTMLDivElement>(null);
  const fresh = items.filter((item) => !listed.has(item.id));

  React.useEffect(() => {
    if (!open || items.some((item) => item.id === arriving.id)) return;
    const timer = window.setTimeout(() => setItems((all) => [arriving, ...all]), 2000);
    return () => window.clearTimeout(timer);
  }, [open, items]);

  return (
    <NotificationInbox open={open} onOpenChange={setOpen}>
      <NotificationInboxTrigger count={fresh.length + 1} />
      <NotificationInboxContent>
        <NotificationInboxHeader>
          <NotificationInboxTitle>Mentions</NotificationInboxTitle>
        </NotificationInboxHeader>
        <NotificationInboxBody
          viewportRef={viewport}
          overlay={
            <NotificationInboxNewItems
              count={fresh.length}
              onClick={() => {
                setListed(new Set(items.map((item) => item.id)));
                viewport.current?.scrollTo({ top: 0 });
              }}
            >
              <ArrowUp data-icon="inline-start" />
              {fresh.length} new
            </NotificationInboxNewItems>
          }
        >
          <NotificationInboxGroup label="Today">
            {items
              .filter((item) => listed.has(item.id))
              .map((item) => (
                <NotificationItem key={item.id} unread={item.time === 'Now'}>
                  <NotificationItemMedia icon={<AtSign />}>
                    <Avatar>
                      <AvatarImage src={item.avatar} alt="" />
                      <AvatarFallback>{item.initials}</AvatarFallback>
                    </Avatar>
                  </NotificationItemMedia>
                  <NotificationItemContent>
                    <NotificationItemTitle href="#notifications">
                      <strong>{item.name}</strong> mentioned you in <strong>{item.page}</strong>
                    </NotificationItemTitle>
                    <NotificationItemDescription>{item.quote}</NotificationItemDescription>
                  </NotificationItemContent>
                  <NotificationItemAside>
                    <NotificationItemTime dateTime="2026-10-11">{item.time}</NotificationItemTime>
                  </NotificationItemAside>
                </NotificationItem>
              ))}
          </NotificationInboxGroup>
        </NotificationInboxBody>
      </NotificationInboxContent>
    </NotificationInbox>
  );
}
