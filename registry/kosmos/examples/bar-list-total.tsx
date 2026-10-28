import { BarList } from '@/registry/kosmos/ui/bar-list';

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

const topProjects = [
  { label: 'Copperline Bank', value: 8730100 },
  { label: 'Ironbark Logistics', value: 6342900 },
  { label: 'Brightloop Fitness', value: 5204800 },
  { label: 'Fernhill Books', value: 3912400 },
  { label: 'Cirrus Weather', value: 2391700 },
];

export default function BarListTotalExample() {
  return (
    <BarList
      aria-label="Top projects by events, last 30 days"
      items={topProjects}
      format={compact.format}
      showShare
      total={28495200}
      className="w-full max-w-sm"
    />
  );
}
