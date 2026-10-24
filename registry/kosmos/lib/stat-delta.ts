/**
 * What a change in a stat says without color: its direction (the arrow), its text with a sign
 * ("+12.4%", "−3.3%", "0%"), and whether it is good or bad news, which a color may add on top.
 */
type StatDelta = { direction: 'up' | 'down' | 'flat'; tone: 'good' | 'bad' | 'neutral'; text: string };

type StatDeltaOptions = {
  /** Whether a rise is good news (users), bad news (`down`: errors, latency) or neither. Defaults to `up`. */
  goodWhen?: 'up' | 'down' | 'neither';
  /** `percent` writes "+12.4%"; `points` writes "+0.3 pts", for a change in a rate. Defaults to `percent`. */
  unit?: 'percent' | 'points';
  /** The most decimals the change shows. Defaults to 1. */
  fractionDigits?: number;
  /** Writes the text from the rounded change, for another locale. */
  format?: (value: number) => string;
};

const suffix = { percent: '%', points: ' pts' };

/** Rounds half away from zero, as `Intl.NumberFormat` does, so the direction matches the text. */
const round = (value: number, digits: number) => (Math.sign(value) * Math.round(Math.abs(value) * 10 ** digits)) / 10 ** digits;

/**
 * Reads a change, such as 12.4 for a 12.4% rise. A change that rounds to zero is flat. Returns `null` for a change
 * that is not a finite number, such as one against an earlier zero.
 */
function statDelta(
  value: number,
  { goodWhen = 'up', unit = 'percent', fractionDigits = 1, format }: StatDeltaOptions = {},
): StatDelta | null {
  if (!Number.isFinite(value)) return null;
  const shown = round(value, fractionDigits);
  // A fixed locale, so the server and the browser render the same text, and a true minus sign (−), not the hyphen Intl writes.
  const signed = new Intl.NumberFormat('en-US', { signDisplay: 'exceptZero', maximumFractionDigits: fractionDigits });
  const text = format ? format(shown) : `${signed.format(shown).replace('-', '−')}${suffix[unit]}`;
  if (shown === 0) return { direction: 'flat', tone: 'neutral', text };
  const direction = shown > 0 ? 'up' : 'down';
  if (goodWhen === 'neither') return { direction, tone: 'neutral', text };
  return { direction, tone: direction === goodWhen ? 'good' : 'bad', text };
}

export { statDelta, type StatDelta, type StatDeltaOptions };
