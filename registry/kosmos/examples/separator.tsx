import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Separator } from '@/registry/kosmos/ui/separator';

export default function SeparatorPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Horizontal">
        <div className="flex max-w-sm flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-body font-medium">Kosmos UI</span>
            <span className="text-small text-muted-foreground">Components for dashboard apps, built on Base UI.</span>
          </div>
          <Separator />
          <p className="text-small text-muted-foreground">Open source under the MIT license.</p>
        </div>
      </PreviewSection>

      <PreviewSection title="Vertical, in a row">
        <div className="flex h-5 items-center gap-3 text-body">
          <span>Docs</span>
          <Separator orientation="vertical" />
          <span>Components</span>
          <Separator orientation="vertical" />
          <span>Blocks</span>
        </div>
      </PreviewSection>

      <PreviewSection title="On a card">
        <div className="flex max-w-sm flex-col rounded-2xl border border-transparent bg-card shadow-card">
          <div className="flex flex-col gap-0.5 p-4">
            <span className="text-title">Billing</span>
            <span className="text-small text-muted-foreground">Pro plan, renews on November 1.</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-3 p-4 text-body">
            <span className="text-muted-foreground">Next invoice</span>
            <span className="tabular-nums">$240.00</span>
          </div>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
