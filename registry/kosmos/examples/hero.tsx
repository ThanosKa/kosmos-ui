import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Hero } from '@/registry/kosmos/blocks/hero/hero';
import { Button } from '@/registry/kosmos/ui/button';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card';

export default function HeroPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default">
        <div className={frame}>
          <Hero />
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container, 320px">
        <div className={`${frame} max-w-80`}>
          <Hero headingLevel={2} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text and a long command">
        <div className={frame}>
          <Hero
            headingLevel={2}
            title="Know what every user of every web, iOS, Android and server app does next, as it happens"
            description="Parallax collects events from your web, iOS, Android and server apps, keeps them for as long as your plan allows, and turns them into funnels, retention cohorts and answers your whole team can read without writing a query."
            command="curl -fsSL https://parallax.example/install.sh | sh -s -- --project cirrus --batch-size 500"
          />
        </div>
      </PreviewSection>

      <PreviewSection title="One action, no command">
        <div className={frame}>
          <Hero
            headingLevel={2}
            command={null}
            actions={
              <Button variant="primary" size="lg" href="/signup">
                Start for free
              </Button>
            }
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Title only">
        <div className={frame}>
          <Hero headingLevel={2} description={null} actions={null} command={null} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
