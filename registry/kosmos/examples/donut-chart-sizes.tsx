import { DonutChart } from '@/registry/kosmos/ui/donut-chart';

const plans = [
  { label: 'Pro', value: 1840 },
  { label: 'Free', value: 1220 },
  { label: 'Scale', value: 610 },
  { label: 'Trial', value: 330 },
];

export default function DonutChartSizes() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <DonutChart size="sm" data={plans} />
      <DonutChart size="md" data={plans} />
      <DonutChart size="lg" data={plans} label="Accounts" />
    </div>
  );
}
