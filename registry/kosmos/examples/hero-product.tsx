import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { HeroProduct } from '@/registry/kosmos/blocks/hero/hero-product';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background px-4 pt-14 shadow-card sm:px-6';

export default function HeroProductPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default">
        <div className={`${frame} sm:pt-20`}>
          <HeroProduct />
        </div>
      </PreviewSection>
      <PreviewSection title="No address">
        <div className={frame}>
          <HeroProduct headingLevel={2} url={null} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
