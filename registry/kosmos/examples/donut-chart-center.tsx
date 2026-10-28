'use client';

import { DonutChart } from '@/registry/kosmos/ui/donut-chart';

const storage = [
  { label: 'Media', value: 412 },
  { label: 'Backups', value: 236 },
  { label: 'Logs', value: 88 },
];

export default function DonutChartCenter() {
  return (
    <DonutChart data={storage} format={(value) => `${value} GB`} aria-label="736 GB used: media 412 GB, backups 236 GB, logs 88 GB">
      <span className="text-title font-medium tabular-nums">736 GB</span>
      <span className="text-caption text-muted-foreground">of 1 TB</span>
    </DonutChart>
  );
}
