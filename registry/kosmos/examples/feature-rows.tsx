import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { FeatureRows, type FeatureRowItem } from '@/registry/kosmos/blocks/feature-rows/feature-rows';
import { Asset, AssetImage } from '@/registry/kosmos/ui/asset';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background p-4 shadow-card sm:p-6';

const imageItems: FeatureRowItem[] = [
  {
    id: 'one',
    title: 'See it before you install it',
    description: 'Every part has a live preview you can click.',
    media: (
      <Asset ratio={4 / 3}>
        <AssetImage src="/media/landscape.webp" alt="Abstract violet and teal gradient" />
      </Asset>
    ),
  },
  {
    id: 'two',
    title: 'Own every line',
    description: 'Parts are added as code, not as a dependency.',
    media: (
      <Asset ratio={4 / 3}>
        <AssetImage src="/media/landscape.webp" alt="Abstract violet and teal gradient" />
      </Asset>
    ),
    href: '/docs/installation',
  },
];

const longItems: FeatureRowItem[] = [
  {
    id: 'long',
    title: 'Every number your team asks about, pinned, current and shared before anyone thinks to ask for it',
    description:
      'Acme keeps every dashboard a minute behind your events, sends the pinned numbers to the team each Monday and lets anyone take the rows behind a chart into a spreadsheet.',
    media: <p className="rounded-xl bg-card p-4 text-body shadow-card">Κοινοποίηση με σύνδεσμο: όλη η ομάδα βλέπει τους ίδιους αριθμούς.</p>,
    href: '/docs/dashboards',
    linkLabel: 'Read the dashboards guide and every example in it',
  },
  {
    id: 'unbroken',
    title: 'signup_completed_with_a_very_long_event_name_from_the_web_sdk',
    description: 'https://acme.example/docs/events/signup_completed_with_a_very_long_event_name',
    media: <p className="rounded-xl bg-card p-4 text-body shadow-card">One short line</p>,
  },
];

export default function FeatureRowsPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default, side by side from 768px">
        <div className={frame}>
          <FeatureRows />
        </div>
      </PreviewSection>

      <PreviewSection title="Images, no header, one link">
        <div className={frame}>
          <FeatureRows title={null} description={null} items={imageItems} />
        </div>
      </PreviewSection>

      <PreviewSection title="Stacked, 640px">
        <div className={`${frame} max-w-160`}>
          <FeatureRows />
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container, 320px">
        <div className={`${frame} max-w-80`}>
          <FeatureRows />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text">
        <div className={frame}>
          <FeatureRows
            title="Every number your team asks about, pinned, current and shared before anyone thinks to ask for it"
            description="Acme keeps every dashboard a minute behind your events and sends the pinned numbers to the team each Monday."
            items={longItems}
          />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
