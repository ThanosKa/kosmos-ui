import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { NumberTicker } from '@/registry/kosmos/ui/number-ticker';
import { DataSet, DataToggle } from '@/components/preview/data-toggle';

function Normal() {
  return (
    <>
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
    </>
  );
}

function Worst() {
  return (
    <>
      <PreviewSection title="Billions, zero and a negative number in a narrow slot">
        <div className="flex w-72 max-w-full flex-col gap-3">
          <p className="text-display font-semibold text-foreground tabular-nums">
            <NumberTicker value={1284903772} duration={1200} />
          </p>
          <p className="text-display font-semibold text-foreground tabular-nums">
            <NumberTicker value={0} />
          </p>
          <p className="text-display font-semibold text-foreground tabular-nums">
            <NumberTicker value={-1284} />
          </p>
        </div>
      </PreviewSection>
    </>
  );
}

export default function NumberTickerPreview() {
  return (
    <PreviewStack>
      <DataToggle />
      <DataSet demo={<Normal />} worst={<Worst />} />
    </PreviewStack>
  );
}
