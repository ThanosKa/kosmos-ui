import { Announcement } from '@/registry/kosmos/ui/announcement';

export default function AnnouncementDemo() {
  return (
    <Announcement href="#changelog" badge="New">
      EU data region: keep your events in Europe
    </Announcement>
  );
}
