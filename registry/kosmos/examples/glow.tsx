import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Glow } from '@/registry/kosmos/ui/glow';

const frame = 'relative isolate flex h-64 w-full items-center justify-center overflow-hidden rounded-xl bg-background shadow-card';

export default function GlowPreview() {
  return (
    <PreviewStack>
      {(['top', 'center', 'bottom'] as const).map((position) => (
        <PreviewSection key={position} title={position}>
          <div className={frame}>
            <Glow position={position} />
            <p className="text-title font-semibold text-foreground">Position {position}</p>
          </div>
        </PreviewSection>
      ))}
    </PreviewStack>
  );
}
