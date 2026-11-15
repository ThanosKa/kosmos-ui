import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Showcase } from '@/registry/kosmos/blocks/showcase/showcase';
import { Button } from '@/registry/kosmos/ui/button';

export default function ShowcasePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default">
        <Showcase className="w-full" />
      </PreviewSection>
      <PreviewSection title="Starts on the settings">
        <Showcase className="w-full" defaultScreen="settings" />
      </PreviewSection>
      <PreviewSection title="Your own screens, with a long tab and a long address">
        <Showcase
          className="w-full"
          label="Pages"
          screens={[
            {
              id: 'one',
              label: 'A page with a very long tab name',
              address: 'example.test/a-very-long-address/that-keeps-going/and-going',
              content: <p className="p-6 text-body">First</p>,
            },
            {
              id: 'two',
              label: 'Second',
              address: 'example.test/two',
              content: (
                <div className="p-6">
                  <Button variant="secondary">Second</Button>
                </div>
              ),
            },
          ]}
        />
      </PreviewSection>
    </PreviewStack>
  );
}
