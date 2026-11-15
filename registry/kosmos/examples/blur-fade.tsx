import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { BlurFade } from '@/registry/kosmos/ui/blur-fade';

const card = 'rounded-xl border border-transparent bg-card p-4 text-body shadow-card';

export default function BlurFadePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="On screen at load: stays put">
        <BlurFade className={card}>Already in view, so it does not hide</BlurFade>
      </PreviewSection>
      <PreviewSection title="Staggered">
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((index) => (
            <BlurFade key={index} delay={index * 80} className={card}>
              Item {index + 1}
            </BlurFade>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
