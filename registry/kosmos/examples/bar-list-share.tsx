import { BarList } from '@/registry/kosmos/ui/bar-list';

const plans = [
  { label: 'Scale', meta: '4 projects', value: 97410 },
  { label: 'Pro', meta: '6 projects', value: 46230 },
  { label: 'Free', meta: '2 projects', value: 960 },
];

export default function BarListShareExample() {
  return <BarList aria-label="Active users by plan" items={plans} showShare className="w-full max-w-sm" />;
}
