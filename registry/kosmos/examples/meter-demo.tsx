import { Meter, MeterLabel, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';

export default function MeterDemo() {
  return (
    <Meter value={68} className="max-w-xs">
      <MeterLabel>Profile completeness</MeterLabel>
      <MeterValue />
      <MeterSegments />
    </Meter>
  );
}
