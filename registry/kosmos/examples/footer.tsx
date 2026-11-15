import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Footer } from '@/registry/kosmos/blocks/footer/footer';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card';

export default function FooterPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default">
        <div className={frame}>
          <Footer />
        </div>
      </PreviewSection>

      <PreviewSection title="Medium container, 640px">
        <div className={`${frame} max-w-160`}>
          <Footer />
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container, 320px">
        <div className={`${frame} max-w-80`}>
          <Footer />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text">
        <div className={frame}>
          <Footer
            description="Product analytics for the teams that run web, iOS, Android and server apps, from the first event to the quarterly review."
            columns={[
              {
                title: 'Developers and integrations',
                links: [
                  { label: 'Server-side batching guide', href: '/docs/batching' },
                  { label: 'Mobile SDK 3.0 migration notes', href: '/docs/sdk-3' },
                  { label: 'API reference', href: '/docs/api' },
                ],
              },
              {
                title: 'Product',
                links: [
                  { label: 'Retention cohorts by plan', href: '/features/retention' },
                  { label: 'Funnel comparisons', href: '/features/funnels' },
                ],
              },
            ]}
            legal="© 2026 Acme. Your events stay in the EU data region when your project asks for it."
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Name and legal only">
        <div className={frame}>
          <Footer description={null} columns={[]} social={[]} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
