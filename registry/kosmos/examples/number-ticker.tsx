import { DataSetPreview } from '@/components/preview/data-set-preview';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import NumberTickerGrouped from '@/registry/kosmos/examples/number-ticker-grouped';
import { NumberTicker } from '@/registry/kosmos/ui/number-ticker';

function Normal() {
  return (
    <>
      <PreviewSection title="Default">
        <p className="text-display font-semibold text-foreground">
          <NumberTicker value={60} />
        </p>
      </PreviewSection>
      <PreviewSection title="Grouped digits, slower, and in a sentence">
        <NumberTickerGrouped />
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
    <DataSetPreview
      demo={
        <PreviewStack>
          <Normal />
        </PreviewStack>
      }
      worst={
        <PreviewStack>
          <Worst />
        </PreviewStack>
      }
    />
  );
}
