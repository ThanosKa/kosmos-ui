import { Announcement } from '@/registry/kosmos/ui/announcement';

export default function AnnouncementDemo() {
  return (
    <Announcement href="#funnels" badge="New">
      Funnels are here: see where users drop off
    </Announcement>
  );
}
