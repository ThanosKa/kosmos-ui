import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { TextReveal } from '@/registry/kosmos/ui/text-reveal';

export default function TextRevealPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default">
        <p className="text-heading font-semibold text-foreground">
          <TextReveal>A title that comes in word by word</TextReveal>
        </p>
      </PreviewSection>
      <PreviewSection title="Slower stagger and a delay">
        <p className="text-heading font-semibold text-foreground">
          <TextReveal stagger={120} delay={200}>
            One word at a time
          </TextReveal>
        </p>
      </PreviewSection>
      <PreviewSection title="Wraps and balances like plain text">
        <p className="max-w-xs text-title text-balance text-foreground">
          <TextReveal>A longer line that wraps onto a second line inside a narrow column and still breaks between words</TextReveal>
        </p>
      </PreviewSection>
    </PreviewStack>
  );
}
