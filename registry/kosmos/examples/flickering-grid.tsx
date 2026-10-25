import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { FlickeringGrid } from '@/registry/kosmos/ui/flickering-grid';

const frame = 'relative isolate flex h-64 w-full items-center justify-center overflow-hidden rounded-xl bg-background shadow-card';

export default function FlickeringGridPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default">
        <div className={frame}>
          <FlickeringGrid />
          <p className="text-title font-semibold text-foreground">Default</p>
        </div>
      </PreviewSection>
      <PreviewSection title="Larger squares, stronger and quicker">
        <div className={frame}>
          <FlickeringGrid squareSize={6} gap={10} maxOpacity={0.22} flickerRate={0.6} />
          <p className="text-title font-semibold text-foreground">Larger squares</p>
        </div>
      </PreviewSection>
      <PreviewSection title="Cursor spotlight">
        <div className={frame}>
          <FlickeringGrid spotlight />
          <p className="text-title font-semibold text-foreground">Move the pointer over the grid</p>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
