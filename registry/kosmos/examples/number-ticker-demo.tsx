import { NumberTicker } from '@/registry/kosmos/ui/number-ticker';

export default function NumberTickerDemo() {
  return (
    <p className="text-display font-semibold text-foreground">
      <NumberTicker value={12840} />
    </p>
  );
}
