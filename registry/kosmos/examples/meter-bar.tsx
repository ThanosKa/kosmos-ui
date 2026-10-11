import { Meter, MeterBar, MeterLabel, MeterValue } from '@/registry/kosmos/ui/meter';

export default function MeterBarExample() {
  return (
    <Meter value={42} className="max-w-xs">
      <MeterLabel>Monthly emails sent</MeterLabel>
      <MeterValue />
      <MeterBar />
    </Meter>
  );
}
