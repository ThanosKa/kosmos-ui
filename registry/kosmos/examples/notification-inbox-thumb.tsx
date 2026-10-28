'use client';

import { AtSign, UserPlus } from 'lucide-react';
import { ThumbStage } from '@/components/preview/overlay-stage';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';
import {
  NotificationInbox,
  NotificationInboxBody,
  NotificationInboxContent,
  NotificationInboxGroup,
  NotificationInboxHeader,
  NotificationInboxTitle,
  NotificationInboxTrigger,
  NotificationItem,
  NotificationItemActions,
  NotificationItemAside,
  NotificationItemContent,
  NotificationItemMedia,
  NotificationItemTime,
  NotificationItemTitle,
} from '@/registry/kosmos/ui/notification-inbox';

/** The components index thumbnail: the bell with its inbox open. */
export default function NotificationInboxThumb() {
  return (
    <ThumbStage className="flex h-80 max-w-md justify-end">
      {(container) => (
        <NotificationInbox open modal={false}>
          <NotificationInboxTrigger count={2} />
          <NotificationInboxContent container={container} initialFocus={false} className="h-auto">
            <NotificationInboxHeader className="pb-1">
              <NotificationInboxTitle>Notifications</NotificationInboxTitle>
            </NotificationInboxHeader>
            <NotificationInboxBody>
              <NotificationInboxGroup label="Today">
                <NotificationItem unread>
                  <NotificationItemMedia icon={<AtSign />}>
                    <Avatar>
                      <AvatarImage src="/avatars/tomas.jpg" alt="" />
                      <AvatarFallback>TO</AvatarFallback>
                    </Avatar>
                  </NotificationItemMedia>
                  <NotificationItemContent>
                    <NotificationItemTitle href="#notifications">
                      <strong>Tomás Ortega</strong> mentioned you in <strong>Q4 roadmap</strong>
                    </NotificationItemTitle>
                  </NotificationItemContent>
                  <NotificationItemAside>
                    <NotificationItemTime dateTime="2026-10-11">4m</NotificationItemTime>
                  </NotificationItemAside>
                </NotificationItem>
                <NotificationItem unread>
                  <NotificationItemMedia icon={<UserPlus />}>
                    <Avatar>
                      <AvatarImage src="/avatars/kai.jpg" alt="" />
                      <AvatarFallback>KN</AvatarFallback>
                    </Avatar>
                  </NotificationItemMedia>
                  <NotificationItemContent>
                    <NotificationItemTitle href="#notifications">
                      <strong>Kai Nakamura</strong> asked for access to <strong>Copperline Bank</strong>
                    </NotificationItemTitle>
                    <NotificationItemActions>
                      <Button variant="primary" size="sm">
                        Approve
                      </Button>
                      <Button variant="secondary" size="sm">
                        Decline
                      </Button>
                    </NotificationItemActions>
                  </NotificationItemContent>
                  <NotificationItemAside>
                    <NotificationItemTime dateTime="2026-10-11">18m</NotificationItemTime>
                  </NotificationItemAside>
                </NotificationItem>
              </NotificationInboxGroup>
            </NotificationInboxBody>
          </NotificationInboxContent>
        </NotificationInbox>
      )}
    </ThumbStage>
  );
}
