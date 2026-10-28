import { BarList } from '@/registry/kosmos/ui/bar-list';

export default function BarListEmptyExample() {
  return <BarList items={[]} empty="No events in this range" className="w-full max-w-sm" />;
}
