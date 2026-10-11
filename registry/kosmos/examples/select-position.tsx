import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';

const ranges = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
};

export default function SelectPosition() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select name="range-over" items={ranges} defaultValue="30d">
        <SelectTrigger aria-label="Date range, list over the trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ranges).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select name="range-below" items={ranges} defaultValue="30d">
        <SelectTrigger aria-label="Date range, list below the trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {Object.entries(ranges).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
