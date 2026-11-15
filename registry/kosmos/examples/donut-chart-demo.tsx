import { DonutChart, DonutChartLegend } from '@/registry/kosmos/ui/donut-chart';

const sources = [
  { label: 'Search', value: 15950 },
  { label: 'Direct', value: 10510 },
  { label: 'Referral', value: 6610 },
  { label: 'Social', value: 3890 },
  { label: 'Email', value: 1950 },
];

export default function DonutChartDemo() {
  return (
    <div className="flex w-full max-w-sm flex-wrap items-center justify-center gap-5">
      <DonutChart data={sources} label="Visitors" aria-label="38.9K visitors" />
      <DonutChartLegend data={sources} aria-label="Visitors by source" className="min-w-44 flex-1" />
    </div>
  );
}
