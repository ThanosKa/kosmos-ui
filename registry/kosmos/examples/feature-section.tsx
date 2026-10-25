import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { FeatureSection, type FeatureSectionPoint } from '@/registry/kosmos/blocks/feature-section/feature-section';
import { Asset, AssetImage } from '@/registry/kosmos/ui/asset';
import { Button } from '@/registry/kosmos/ui/button';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background p-4 shadow-card sm:p-6';

const image = (
  <Asset ratio={4 / 3}>
    <AssetImage src="/media/landscape.webp" alt="Abstract violet and teal gradient" />
  </Asset>
);

const plainPoints: FeatureSectionPoint[] = [
  { id: 'web', title: 'Web', description: 'A script tag or an npm package.' },
  { id: 'ios', title: 'iOS', description: 'A Swift package.', href: '/docs/sdks/ios' },
  { id: 'server', title: 'Server' },
];

const longPoints: FeatureSectionPoint[] = [
  {
    id: 'long',
    title: 'Share every dashboard with a link that opens the same live view, filters and range for anyone in your workspace',
    description:
      'Teammates on any plan see exactly the numbers you see, a minute behind your events, without exporting a thing or asking you for a screenshot first.',
    href: '/docs/dashboards/share',
  },
  {
    id: 'unbroken',
    title: 'signup_completed_with_a_very_long_event_name_from_the_web_sdk',
    description: 'https://acme.example/docs/events/signup_completed_with_a_very_long_event_name',
    href: '/docs/events',
  },
  { id: 'greek', title: 'Κοινοποίηση με σύνδεσμο', description: 'Όλη η ομάδα βλέπει τους ίδιους αριθμούς.' },
];

export default function FeatureSectionPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default, side by side from 768px">
        <div className={frame}>
          <FeatureSection />
        </div>
      </PreviewSection>

      <PreviewSection title="Visual at the end, with an image">
        <div className={frame}>
          <FeatureSection
            title="See it before you install it"
            description={null}
            visual={image}
            cardTitle="A dashboard in a minute"
            points={plainPoints}
            visualSide="end"
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Stacked, 640px">
        <div className={`${frame} max-w-160`}>
          <FeatureSection />
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container, 320px">
        <div className={`${frame} max-w-80`}>
          <FeatureSection />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text">
        <div className={frame}>
          <FeatureSection
            title="Every number your team asks about, pinned, current and shared before anyone thinks to ask for it"
            description="Acme keeps every dashboard a minute behind your events, sends the pinned numbers to the team each Monday and lets anyone take the rows behind a chart into a spreadsheet."
            cardTitle="One view for everyone on the team, on every plan, in every workspace you run"
            points={longPoints}
            action={
              <Button variant="secondary" href="/docs/dashboards">
                Read the dashboards guide and every example in it
              </Button>
            }
          />
        </div>
      </PreviewSection>

      <PreviewSection title="No header, no card text, no action">
        <div className={frame}>
          <FeatureSection title={null} description={null} cardTitle={null} cardDescription={null} points={plainPoints} action={null} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
