import { DonutChart } from '@/registry/kosmos/ui/donut-chart';

export default function DonutChartEmpty() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <DonutChart data={[{ label: 'Search', value: 1240 }]} label="Visitors" />
      <DonutChart
        data={[
          { label: 'Search', value: 0 },
          { label: 'Direct', value: 0 },
        ]}
        label="Visitors"
      />
    </div>
  );
}
