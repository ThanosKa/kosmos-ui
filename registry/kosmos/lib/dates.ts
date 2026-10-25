/** A day of the week, Sunday first: `0` is Sunday, `1` Monday, up to `6`, Saturday. */
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** The same day `months` later, or the month's last day when it is shorter (31 January plus one month is 28 February). */
function addMonths(date: Date, months: number) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

/** Orders two dates by day, ignoring the time: negative when `a` comes first, `0` on the same day. */
function compareDays(a: Date, b: Date) {
  return a.getFullYear() - b.getFullYear() || a.getMonth() - b.getMonth() || a.getDate() - b.getDate();
}

function isSameDay(a: Date | null | undefined, b: Date | null | undefined) {
  return !!a && !!b && compareDays(a, b) === 0;
}

/** Whether the day falls before `min` or after `max`, counting whole days. */
function isOutside(date: Date, min?: Date | null, max?: Date | null) {
  return (!!min && compareDays(date, min) < 0) || (!!max && compareDays(date, max) > 0);
}

/** The day itself, or the nearest allowed day when it falls before `min` or after `max`. */
function clampDay(date: Date, min?: Date | null, max?: Date | null) {
  if (min && compareDays(date, min) < 0) return startOfDay(min);
  if (max && compareDays(date, max) > 0) return startOfDay(max);
  return startOfDay(date);
}

/**
 * The days of `month` in six weeks of seven, starting on `weekStartsOn`, with `null` for the days outside it.
 * Every month takes six weeks, so a calendar keeps its height from one month to the next.
 */
function monthWeeks(month: Date, weekStartsOn: Weekday): (Date | null)[][] {
  const first = startOfMonth(month);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const date = addDays(first, week * 7 + weekday - lead);
      return date.getMonth() === first.getMonth() ? date : null;
    }),
  );
}

/**
 * The first of `months` months in view once the focus moves to `focus`: the same as now while the focus stays in
 * view, else the fewest months over, so the focused day is the first or the last month shown.
 */
function monthsInViewFor(first: Date, focus: Date, months: number) {
  const start = startOfMonth(first);
  const offset = (focus.getFullYear() - start.getFullYear()) * 12 + focus.getMonth() - start.getMonth();
  if (offset < 0) return startOfMonth(focus);
  if (offset >= months) return addMonths(startOfMonth(focus), 1 - months);
  return start;
}

type MoveOptions = {
  weekStartsOn: Weekday;
  /** The page direction: on a right-to-left page the left arrow moves forward. */
  dir?: 'ltr' | 'rtl';
  shiftKey?: boolean;
  min?: Date | null;
  max?: Date | null;
};

/**
 * The day a key moves the focus to in a calendar grid, following the WAI-ARIA date picker pattern: the arrows move
 * a day or a week, Home and End go to the ends of the week, Page Up and Page Down a month, and a year with Shift.
 * `null` for a key that does not move.
 */
function moveFocus(from: Date, key: string, { weekStartsOn, dir = 'ltr', shiftKey = false, min, max }: MoveOptions) {
  const forward = dir === 'rtl' ? -1 : 1;
  const weekday = (from.getDay() - weekStartsOn + 7) % 7;
  const moves: Record<string, () => Date> = {
    ArrowRight: () => addDays(from, forward),
    ArrowLeft: () => addDays(from, -forward),
    ArrowDown: () => addDays(from, 7),
    ArrowUp: () => addDays(from, -7),
    Home: () => addDays(from, -weekday),
    End: () => addDays(from, 6 - weekday),
    PageDown: () => addMonths(from, shiftKey ? 12 : 1),
    PageUp: () => addMonths(from, shiftKey ? -12 : -1),
  };
  const next = moves[key]?.();
  return next ? clampDay(next, min, max) : null;
}

/** A period of days, both ends included. `to` stays empty while only the first day is picked. */
type DateRange = { from: Date; to?: Date };

/** The range after a pick: the first pick starts it, the second ends it in either order, and the next starts again. */
function pickRange(range: DateRange | null | undefined, day: Date): DateRange {
  if (!range || range.to) return { from: startOfDay(day) };
  return compareDays(day, range.from) < 0
    ? { from: startOfDay(day), to: startOfDay(range.from) }
    : { from: startOfDay(range.from), to: startOfDay(day) };
}

/** How many days a range covers, both ends included: one for an open range. Counted on the calendar, so a change of clocks never shifts it. */
function rangeLength({ from, to }: DateRange) {
  if (!to) return 1;
  const utc = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.abs(utc(to) - utc(from)) / 86_400_000 + 1;
}

type RangePosition ='start' | 'middle' | 'end' | 'single';

/**
 * Where a day sits in a range: its first or last day, between them, or `single` when the range is that one day.
 * While the range has no end yet, `preview` (the day under the pointer or the focus) stands in for it.
 */
function rangePosition(day: Date, range: DateRange | null | undefined, preview?: Date | null): RangePosition | null {
  if (!range) return null;
  const other = range.to ?? preview ?? range.from;
  const [from, to] = compareDays(other, range.from) < 0 ? [other, range.from] : [range.from, other];
  const fromOrder = compareDays(day, from);
  const toOrder = compareDays(day, to);
  if (fromOrder < 0 || toOrder > 0) return null;
  if (fromOrder === 0 && toOrder === 0) return 'single';
  if (fromOrder === 0) return 'start';
  if (toOrder === 0) return 'end';
  return 'middle';
}

/** A named range offered beside the calendar, such as "Last 7 days". */
type QuickRange = { label: string; from: Date; to: Date };

/** The last `days` days, today included. */
function lastDays(days: number, today = new Date()) {
  const to = startOfDay(today);
  return { from: addDays(to, 1 - Math.max(1, days)), to };
}

/** The first of this month to today. */
function thisMonth(today = new Date()) {
  return { from: startOfMonth(today), to: startOfDay(today) };
}

/** The whole month before this one. */
function lastMonth(today = new Date()) {
  const from = startOfMonth(addMonths(startOfMonth(today), -1));
  return { from, to: addDays(startOfMonth(today), -1) };
}

/** The quick ranges a dashboard offers most, in English. Pass your own list for other words or other ranges. */
function quickRanges(today = new Date()): QuickRange[] {
  return [
    { label: 'Today', ...lastDays(1, today) },
    { label: 'Yesterday', from: addDays(startOfDay(today), -1), to: addDays(startOfDay(today), -1) },
    { label: 'Last 7 days', ...lastDays(7, today) },
    { label: 'Last 30 days', ...lastDays(30, today) },
    { label: 'Last 90 days', ...lastDays(90, today) },
    { label: 'This month', ...thisMonth(today) },
    { label: 'Last month', ...lastMonth(today) },
  ];
}

/** The first quick range with the same days as `range`, so a picker can show "Last 7 days" instead of two dates. */
function matchQuickRange<Range extends QuickRange>(ranges: readonly Range[], range: DateRange | null | undefined) {
  if (!range?.to) return undefined;
  const { from, to } = range;
  return ranges.find((quick) => isSameDay(quick.from, from) && isSameDay(quick.to, to));
}

// Regions whose week starts on Sunday or Saturday (CLDR), for browsers without `Intl.Locale` week info; the rest start on Monday.
const sundayRegions =
  'AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW';
const saturdayRegions = 'AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY';

type WeekInfoLocale = Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };

/** The day the week starts on in `locale`: Sunday in the United States, Monday in most of Europe, Saturday in Egypt. */
function weekStart(locale: string): Weekday {
  const intlLocale = new Intl.Locale(locale) as WeekInfoLocale;
  const firstDay = (intlLocale.getWeekInfo?.() ?? intlLocale.weekInfo)?.firstDay;
  if (firstDay) return (firstDay % 7) as Weekday;
  const region = intlLocale.maximize().region ?? '';
  if (sundayRegions.split(' ').includes(region)) return 0;
  if (saturdayRegions.split(' ').includes(region)) return 6;
  return 1;
}

const formats = new Map<string, Intl.DateTimeFormat>();

/** One formatter per locale and options, kept: a calendar formats every day of every month on each render. */
function dateFormat(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = `${locale} ${JSON.stringify(options)}`;
  let format = formats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, options);
    formats.set(key, format);
  }
  return format;
}

/** The month and year a calendar shows: "October 2026". */
function monthLabel(month: Date, locale: string) {
  return dateFormat(locale, { month: 'long', year: 'numeric' }).format(month);
}

/**
 * The seven weekday names from `weekStartsOn`: `short` ("Mon") heads a column, `long` ("Monday") names it. Where the
 * short names are whole words, as in Arabic, the heads take the narrow ones, so every column stays one day wide.
 */
function weekdayLabels(locale: string, weekStartsOn: Weekday) {
  const format = (weekday: 'short' | 'narrow' | 'long') => dateFormat(locale, { weekday });
  // 4 January 1970 was a Sunday.
  const days = Array.from({ length: 7 }, (_, i) => new Date(1970, 0, 4 + ((weekStartsOn + i) % 7)));
  const short = days.map((date) => format('short').format(date));
  const heads = short.some((name) => name.replace(/\.$/, '').length > 3) ? days.map((date) => format('narrow').format(date)) : short;
  return days.map((date, i) => ({ short: heads[i], long: format('long').format(date) }));
}

/** The day of the month in the digits of `locale`: "25", or "٢٥" in Arabic. */
function dayNumber(date: Date, locale: string) {
  return dateFormat(locale, { day: 'numeric' }).format(date);
}

/** A day in full, as a screen reader reads it: "Sunday, October 25, 2026". */
function dayLabel(date: Date, locale: string) {
  return dateFormat(locale, { dateStyle: 'full' }).format(date);
}

/** A date in short: "Oct 25, 2026". */
function formatDate(date: Date, locale: string) {
  return dateFormat(locale, { dateStyle: 'medium' }).format(date);
}

/**
 * A range in short, saying the month and year once where they repeat: "Oct 3 – 9, 2026". An open range ends in a dash.
 * Thin and narrow spaces become plain ones: ICU versions differ on them, and a server and a browser must render the same text.
 */
function formatRange({ from, to }: DateRange, locale: string) {
  const format = dateFormat(locale, { dateStyle: 'medium' });
  if (!to) return `${format.format(from)} –`;
  if (isSameDay(from, to)) return format.format(from);
  return format.formatRange(from, to).replace(/[\u2009\u202f]/g, ' ');
}

export {
  addDays,
  addMonths,
  clampDay,
  compareDays,
  dayLabel,
  dayNumber,
  formatDate,
  formatRange,
  isOutside,
  isSameDay,
  lastDays,
  lastMonth,
  matchQuickRange,
  monthLabel,
  monthsInViewFor,
  monthWeeks,
  moveFocus,
  pickRange,
  quickRanges,
  rangeLength,
  rangePosition,
  startOfDay,
  startOfMonth,
  thisMonth,
  weekdayLabels,
  weekStart,
  type DateRange,
  type MoveOptions,
  type QuickRange,
  type RangePosition,
  type Weekday,
};
