import { DonutChart, DonutChartLegend } from '@/registry/kosmos/ui/donut-chart';

const browsers = [
  { label: 'Chrome', value: 9612 },
  { label: 'Safari', value: 214 },
  { label: 'Firefox', value: 98 },
  { label: 'Edge', value: 41 },
];

export default function DonutChartSmallParts() {
  return (
    <div className="flex w-full max-w-sm flex-wrap items-center justify-center gap-5">
      <DonutChart data={browsers} label="Sessions" aria-label="9,965 sessions" />
      <DonutChartLegend data={browsers} aria-label="Sessions by browser" className="min-w-44 flex-1" />
    </div>
  );
}
