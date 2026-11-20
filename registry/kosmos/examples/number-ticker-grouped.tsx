import { NumberTicker } from '@/registry/kosmos/ui/number-ticker';

export default function NumberTickerGrouped() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-display font-semibold text-foreground">
        <NumberTicker value={1234567} duration={2400} />
      </p>
      <p className="text-body text-foreground">
        <NumberTicker value={20} /> blocks and <NumberTicker value={60} /> components
      </p>
    </div>
  );
}
