'use client';

import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import CandlestickChartDemo from '@/registry/kosmos/examples/candlestick-chart-demo';
import { CandlestickChart, type CandlestickChartItem } from '@/registry/kosmos/ui/candlestick-chart';

const DAY = 86_400_000;
const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** Events a minute over the week to October 11, one candle a day. */
const week: CandlestickChartItem[] = [
  { label: 'Mon', name: 'Mon, Oct 5', open: 662, high: 701, low: 641, close: 668, volume: 962400 },
  { label: 'Tue', name: 'Tue, Oct 6', open: 668, high: 712, low: 655, close: 679, volume: 978100 },
  { label: 'Wed', name: 'Wed, Oct 7', open: 679, high: 729, low: 662, close: 689, volume: 991500 },
  { label: 'Thu', name: 'Thu, Oct 8', open: 689, high: 694, low: 640, close: 662, volume: 953800 },
  { label: 'Fri', name: 'Fri, Oct 9', open: 662, high: 690, low: 648, close: 673, volume: 969700 },
  { label: 'Sat', name: 'Sat, Oct 10', open: 673, high: 699, low: 660, close: 675, volume: 971300 },
  { label: 'Sun', name: 'Sun, Oct 11', open: 675, high: 731, low: 668, close: 703, volume: 1012000 },
];

/** A year of days: more candles than pixels to give each one. */
const year: CandlestickChartItem[] = Array.from({ length: 365 }, (_, i) => {
  const date = Date.UTC(2025, 9, 12) + i * DAY;
  const base = 480 + i * 0.6 + ((i * 37) % 23) - 11;
  const close = base + ((i * 53) % 17) - 8;
  return {
    label: monthDay.format(date),
    group: new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(date),
    open: Math.round(base),
    close: Math.round(close),
    high: Math.round(Math.max(base, close) + 6),
    low: Math.round(Math.min(base, close) - 6),
    volume: Math.round((base + 20) * 1440),
  };
});

const cases: { title: string; data: CandlestickChartItem[]; format?: (value: number) => string }[] = [
  { title: '7 candles', data: week },
  { title: '365 candles, labels by month', data: year },
  { title: 'One candle', data: [week[6]] },
  { title: 'Every value zero', data: week.map((candle) => ({ ...candle, open: 0, high: 0, low: 0, close: 0, volume: 0 })) },
  { title: 'No data', data: [] },
  { title: 'No volume', data: week.map(({ volume: _, ...candle }) => candle) },
  {
    title: 'Long labels and huge values',
    format: usd.format,
    data: [
      { label: 'Ironbark Logistics, the whole of September', open: 1_234_567_890, high: 1_334_567_890, low: 1_134_567_890, close: 1_300_000_000, volume: 6_342_900_000 },
      { label: 'Copperline Bank, the whole of October so far', open: 1_300_000_000, high: 1_420_000_000, low: 1_210_000_000, close: 1_250_000_000, volume: 8_730_100_000 },
    ],
  },
];

export default function CandlestickChartPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="In a chart card, with a range switch">
        <CandlestickChartDemo />
      </PreviewSection>

      <PreviewSection title="Data">
        <div className="grid w-full gap-8 sm:grid-cols-2">
          {cases.map(({ title, data, format }) => (
            <div key={title} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{title}</p>
              <CandlestickChart data={data} label={title} format={format} volumeLabel="Events" entrance="none" />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Entrance: always, session (default), none">
        <div className="grid w-full gap-8 sm:grid-cols-3">
          {(['always', 'session', 'none'] as const).map((entrance) => (
            <div key={entrance} className="flex min-w-0 flex-col gap-2">
              <p className="font-mono text-caption text-muted-foreground">{entrance}</p>
              <CandlestickChart data={week} label={`Events a minute, ${entrance}`} volumeLabel="Events" entrance={entrance} />
            </div>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
