import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Shimmer } from '@/registry/kosmos/ui/shimmer';

export default function ShimmerPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default">
        <p className="text-body font-medium">
          <Shimmer>Generating the report…</Shimmer>
        </p>
      </PreviewSection>
      <PreviewSection title="Sizes">
        <div className="flex flex-col gap-2">
          <p className="text-heading font-semibold">
            <Shimmer>Thinking…</Shimmer>
          </p>
          <p className="text-small">
            <Shimmer>Searching 14 sources…</Shimmer>
          </p>
          <p className="text-caption">
            <Shimmer>Reading acme_secret_demo_notes.md</Shimmer>
          </p>
        </div>
      </PreviewSection>
      <PreviewSection title="Settled (active false)">
        <p className="text-body font-medium">
          <Shimmer active={false}>Done in 12 seconds</Shimmer>
        </p>
      </PreviewSection>
      <PreviewSection title="Wraps and non-Latin">
        <p className="max-w-xs text-body">
          <Shimmer>Analysing the quarterly numbers for every workspace in the account before drafting a summary</Shimmer>
        </p>
        <p className="text-body">
          <Shimmer>考え中…</Shimmer>
        </p>
      </PreviewSection>
    </PreviewStack>
  );
}
