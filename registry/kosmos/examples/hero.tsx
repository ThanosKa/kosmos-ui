import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Hero } from '@/registry/kosmos/blocks/hero/hero';
import { Announcement } from '@/registry/kosmos/ui/announcement';
import { Button } from '@/registry/kosmos/ui/button';
import { CodeTabs } from '@/registry/kosmos/ui/code-tabs';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background px-4 py-12 shadow-card';

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

      <PreviewSection title="Long text, a long announcement and a long command">
        <div className={frame}>
          <Hero
            headingLevel={2}
            announcement={
              <Announcement badge="Version 4.12" href="/changelog">
                Funnels now break down by country, device, plan and every custom property you send with an event
              </Announcement>
            }
            title="Know what every user of every web, iOS, Android and server app does next, as it happens"
            description="Acme collects events from your web, iOS, Android and server apps, keeps them for as long as your plan allows, and turns them into funnels, retention cohorts and answers your whole team can read without writing a query."
            install={
              <CodeTabs
                label="Platform"
                commands={{ Linux: 'curl -fsSL https://acme.example/install.sh | sh -s -- --project cirrus --batch-size 500 --region eu-central-1' }}
              />
            }
          />
        </div>
      </PreviewSection>

      <PreviewSection title="One action, no announcement, no install command">
        <div className={frame}>
          <Hero
            headingLevel={2}
            announcement={null}
            install={null}
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
          <Hero headingLevel={2} announcement={null} description={null} actions={null} install={null} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
