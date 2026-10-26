import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { LogoMarquee } from '@/registry/kosmos/blocks/logo-marquee/logo-marquee';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background py-10 shadow-card';

const stack = ['Base UI', 'Tailwind CSS', 'React', 'Next.js', 'shadcn CLI'].map((name) => ({ name }));

export default function LogoMarqueePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Marquee">
        <div className={frame}>
          <LogoMarquee />
        </div>
      </PreviewSection>

      <PreviewSection title="Links, a brand color on hover or focus">
        <div className={frame}>
          <LogoMarquee
            variant="static"
            logos={[
              { name: 'Fernhill Books', color: 'var(--tint-blue-solid)', href: '#fernhill' },
              { name: 'Brightloop Fitness', color: 'var(--tint-orange-solid)', href: '#brightloop' },
              { name: 'Copperline Bank', color: 'var(--tint-green-solid)', href: '#copperline' },
              { name: 'No color given', href: '#plain' },
            ]}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Static">
        <div className={frame}>
          <LogoMarquee variant="static" />
        </div>
      </PreviewSection>

      <PreviewSection title="Names only, no line">
        <div className={frame}>
          <LogoMarquee title={null} logos={stack} />
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container, 320px">
        <div className="flex flex-wrap items-start gap-4">
          <div className={`${frame} max-w-80`}>
            <LogoMarquee />
          </div>
          <div className={`${frame} max-w-80`}>
            <LogoMarquee variant="static" />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Two logos in a wide container">
        <div className={frame}>
          <LogoMarquee logos={stack.slice(0, 2)} />
        </div>
      </PreviewSection>

      <PreviewSection title="Right to left">
        <div dir="rtl" className={frame}>
          <LogoMarquee title="يستخدمه فريق كل منتج" logos={stack} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long line and long names">
        <div className={frame}>
          <LogoMarquee
            title="Used by the product, engineering and growth teams behind these web, iOS, Android and server apps"
            logos={[
              { name: 'Fernhill Books and Stationery International' },
              { name: 'Brightloop Fitness' },
              { name: 'Copperline Bank' },
              { name: 'Сaltmarsh Кофе' },
              { name: '霧島ウェザー' },
            ]}
          />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
