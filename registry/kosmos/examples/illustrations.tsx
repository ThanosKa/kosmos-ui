import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { cn } from '@/registry/kosmos/lib/cn';
import { ChecklistIllustration, LayerStackIllustration, SyncIllustration } from '@/registry/kosmos/ui/illustrations';

const tile = 'overflow-hidden rounded-2xl border border-transparent bg-muted shadow-inset';

export default function IllustrationsPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Layer stack: fans out on scroll, then on hover">
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className={tile}>
            <LayerStackIllustration />
          </div>
          <div className={tile}>
            <LayerStackIllustration trigger="hover" />
          </div>
        </div>
      </PreviewSection>
      <PreviewSection title="Sync">
        <div className={cn(tile, 'max-w-md')}>
          <SyncIllustration />
        </div>
      </PreviewSection>
      <PreviewSection title="Checklist">
        <div className={cn(tile, 'max-w-md')}>
          <ChecklistIllustration />
        </div>
      </PreviewSection>
      <PreviewSection title="Scales with its container: 160px, 240px, 360px">
        <div className="flex flex-wrap items-start gap-4">
          {[160, 240, 360].map((width) => (
            <div key={width} style={{ width }} className={tile}>
              <LayerStackIllustration />
              <SyncIllustration />
              <ChecklistIllustration />
            </div>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
