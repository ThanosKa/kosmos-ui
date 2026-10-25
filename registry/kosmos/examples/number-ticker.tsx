import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { NumberTicker } from '@/registry/kosmos/ui/number-ticker';

export default function NumberTickerPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default">
        <p className="text-display font-semibold text-foreground">
          <NumberTicker value={60} />
        </p>
      </PreviewSection>
      <PreviewSection title="Grouped digits, slower">
        <p className="text-display font-semibold text-foreground">
          <NumberTicker value={1234567} duration={2400} />
        </p>
      </PreviewSection>
      <PreviewSection title="In a sentence">
        <p className="text-body text-foreground">
          <NumberTicker value={20} /> blocks and <NumberTicker value={60} /> components
        </p>
      </PreviewSection>
    </PreviewStack>
  );
}
