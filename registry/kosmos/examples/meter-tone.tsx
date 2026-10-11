'use client';

import { Meter, MeterBar, MeterLabel, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';

export default function MeterTone() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <Meter value={86} tone="auto">
        <MeterLabel>Lead score</MeterLabel>
        <MeterValue>{(_, value) => `${value} / 100`}</MeterValue>
        <MeterSegments />
      </Meter>
      <Meter
        value={44}
        max={50}
        optimum={0}
        tone="auto"
        format={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }}
      >
        <MeterLabel>Storage used</MeterLabel>
        <MeterValue>{(formatted) => `${formatted} of 50 GB`}</MeterValue>
        <MeterBar />
      </Meter>
    </div>
  );
}
