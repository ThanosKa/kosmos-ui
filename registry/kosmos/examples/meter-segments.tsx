import { Meter, MeterLabel, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';

export default function MeterSegmentsExample() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <Meter value={3} max={5} format={{ style: 'decimal' }}>
        <MeterLabel>Onboarding steps done</MeterLabel>
        <MeterValue />
        <MeterSegments count={5} />
      </Meter>
      <Meter value={72} tone="success">
        <MeterLabel>Uptime budget left</MeterLabel>
        <MeterValue />
        <MeterSegments count={40} />
      </Meter>
    </div>
  );
}
