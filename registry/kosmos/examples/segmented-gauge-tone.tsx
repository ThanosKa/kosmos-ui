import { SegmentedGauge } from '@/registry/kosmos/ui/segmented-gauge';

const quotas = [
  { name: 'Saltmarsh Coffee', events: 412_300, allowance: 3_000_000 },
  { name: 'Ironbark Logistics', events: 6_342_900, allowance: 8_000_000 },
  { name: 'Copperline Bank', events: 8_730_100, allowance: 8_000_000 },
];

export default function SegmentedGaugeTone() {
  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-3">
      {quotas.map(({ name, events, allowance }) => (
        <SegmentedGauge
          key={name}
          value={events}
          max={allowance}
          high={allowance * 0.75}
          label={`Event quota, ${name}`}
          caption={name}
        />
      ))}
    </div>
  );
}
