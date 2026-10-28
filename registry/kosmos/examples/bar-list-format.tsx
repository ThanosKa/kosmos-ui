import { BarList } from '@/registry/kosmos/ui/bar-list';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const revenue = [
  { label: 'Scale', value: 13700 },
  { label: 'Pro', value: 928 },
  { label: 'Free', value: 0 },
];

export default function BarListFormatExample() {
  return (
    <BarList
      aria-label="Monthly revenue by plan"
      items={revenue}
      format={(value) => usd.format(value)}
      className="w-full max-w-sm"
    />
  );
}
