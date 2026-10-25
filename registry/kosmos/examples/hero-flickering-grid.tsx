import { Hero } from '@/registry/kosmos/blocks/hero/hero';
import { Announcement } from '@/registry/kosmos/ui/announcement';
import { Button } from '@/registry/kosmos/ui/button';
import { FlickeringGrid } from '@/registry/kosmos/ui/flickering-grid';

export default function HeroFlickeringGrid() {
  return (
    <div className="relative isolate w-full overflow-hidden bg-background px-4 pt-16 pb-16 md:pt-24 md:pb-20">
      <FlickeringGrid className="mask-[radial-gradient(ellipse_60%_70%_at_50%_45%,black,transparent)]" />
      <Hero
        announcement={
          <Announcement badge="New" href="/presets">
            Presets: pick a look and copy its CSS
          </Announcement>
        }
        title="Dashboard UI with the details already done"
        description="60 components and 20 blocks on Base UI, added with the shadcn CLI as code you own. Free and open source under MIT."
        actions={
          <>
            <Button variant="primary" size="lg" href="/docs/components">
              Browse components
            </Button>
            <Button variant="secondary" size="lg" href="https://github.com">
              GitHub
            </Button>
          </>
        }
        install={null}
      />
    </div>
  );
}
