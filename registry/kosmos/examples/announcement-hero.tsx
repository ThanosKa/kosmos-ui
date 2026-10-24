import { Announcement } from '@/registry/kosmos/ui/announcement';
import { Button } from '@/registry/kosmos/ui/button';

export default function AnnouncementHero() {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <Announcement href="#changelog" badge="New">
        Annual billing is here
      </Announcement>
      <h2 className="max-w-[14em] text-display font-semibold text-balance text-foreground">Know what every user does next</h2>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="lg" href="#signup">
          Start for free
        </Button>
        <Button variant="secondary" size="lg" href="#demo">
          Book a demo
        </Button>
      </div>
    </div>
  );
}
