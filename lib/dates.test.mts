// Usage: node --test lib/dates.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  dayLabel,
  dayNumber,
  formatDate,
  formatRange,
  isOutside,
  monthLabel,
  monthsInViewFor,
  weekdayLabels,
  weekStart,
  lastDays,
  lastMonth,
  matchQuickRange,
  monthWeeks,
  moveFocus,
  pickRange,
  quickRanges,
  rangeLength,
  rangePosition,
  thisMonth,
} from '../registry/kosmos/lib/dates.ts';

const day = (year: number, month: number, date: number) => new Date(year, month - 1, date);
const dates = (week: (Date | null)[]) => week.map((cell) => cell?.getDate() ?? null);

test('a month fills six weeks from the chosen first day, with blanks outside it', () => {
  const weeks = monthWeeks(day(2026, 10, 14), 1);
  assert.equal(weeks.length, 6);
  assert.deepEqual(dates(weeks[0]), [null, null, null, 1, 2, 3, 4]);
  assert.deepEqual(dates(weeks[4]), [26, 27, 28, 29, 30, 31, null]);
  assert.deepEqual(dates(weeks[5]), [null, null, null, null, null, null, null]);
});

test('a week can start on Sunday', () => {
  const weeks = monthWeeks(day(2026, 10, 1), 0);
  assert.deepEqual(dates(weeks[0]), [null, null, null, null, 1, 2, 3]);
});

const iso = (date: Date | null) =>
  date && `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const move = (from: Date, key: string, options: Partial<Parameters<typeof moveFocus>[2]> = {}) =>
  iso(moveFocus(from, key, { weekStartsOn: 1, ...options }));

test('arrow keys move a day sideways and a week up or down', () => {
  const from = day(2026, 10, 31);
  assert.equal(move(from, 'ArrowRight'), '2026-11-01');
  assert.equal(move(from, 'ArrowLeft'), '2026-10-30');
  assert.equal(move(from, 'ArrowDown'), '2026-11-07');
  assert.equal(move(from, 'ArrowUp'), '2026-10-24');
});

test('on a right-to-left page the left arrow moves forward', () => {
  assert.equal(move(day(2026, 10, 14), 'ArrowLeft', { dir: 'rtl' }), '2026-10-15');
  assert.equal(move(day(2026, 10, 14), 'ArrowRight', { dir: 'rtl' }), '2026-10-13');
});

test('Home and End go to the first and last day of the week', () => {
  assert.equal(move(day(2026, 10, 14), 'Home'), '2026-10-12');
  assert.equal(move(day(2026, 10, 14), 'End'), '2026-10-18');
  assert.equal(move(day(2026, 10, 14), 'Home', { weekStartsOn: 0 }), '2026-10-11');
});

test('Page Up and Page Down change the month, Shift with them the year, and keep the day where it exists', () => {
  assert.equal(move(day(2026, 1, 31), 'PageDown'), '2026-02-28');
  assert.equal(move(day(2026, 3, 31), 'PageUp'), '2026-02-28');
  assert.equal(move(day(2024, 2, 29), 'PageDown', { shiftKey: true }), '2025-02-28');
  assert.equal(move(day(2026, 10, 14), 'PageUp', { shiftKey: true }), '2025-10-14');
});

test('a move never leaves the allowed dates', () => {
  assert.equal(move(day(2026, 10, 30), 'ArrowDown', { max: day(2026, 10, 31) }), '2026-10-31');
  assert.equal(move(day(2026, 10, 2), 'PageUp', { min: day(2026, 10, 1) }), '2026-10-01');
});

test('the allowed dates count whole days, whatever the time of min and max', () => {
  const min = new Date(2026, 9, 10, 15, 30);
  const max = new Date(2026, 9, 20, 8, 0);
  assert.equal(isOutside(day(2026, 10, 10), min, max), false);
  assert.equal(isOutside(day(2026, 10, 20), min, max), false);
  assert.equal(isOutside(day(2026, 10, 9), min, max), true);
  assert.equal(isOutside(day(2026, 10, 21), min, max), true);
  assert.equal(isOutside(day(2026, 10, 21)), false);
});

test('the months in view follow the focus only when it leaves them', () => {
  const october = day(2026, 10, 1);
  assert.equal(iso(monthsInViewFor(october, day(2026, 11, 30), 2)), '2026-10-01');
  assert.equal(iso(monthsInViewFor(october, day(2026, 12, 1), 2)), '2026-11-01');
  assert.equal(iso(monthsInViewFor(october, day(2026, 9, 30), 2)), '2026-09-01');
  assert.equal(iso(monthsInViewFor(october, day(2027, 10, 5), 1)), '2027-10-01');
});

test('a range counts its days, both ends included, across a change of clocks', () => {
  assert.equal(rangeLength({ from: day(2026, 10, 3), to: day(2026, 10, 9) }), 7);
  assert.equal(rangeLength({ from: day(2026, 10, 20), to: day(2026, 11, 5) }), 17);
  assert.equal(rangeLength({ from: day(2026, 3, 1), to: day(2026, 4, 1) }), 32);
  assert.equal(rangeLength({ from: day(2026, 10, 9) }), 1);
});

test('other keys do not move', () => {
  assert.equal(move(day(2026, 10, 14), 'Enter'), null);
});

const span = (range: { from: Date; to?: Date } | null) => range && `${iso(range.from)} to ${range.to ? iso(range.to) : ''}`;

test('the first pick starts a range and the second ends it, in either order', () => {
  const started = pickRange(null, day(2026, 10, 9));
  assert.equal(span(started), '2026-10-09 to ');
  assert.equal(span(pickRange(started, day(2026, 10, 14))), '2026-10-09 to 2026-10-14');
  assert.equal(span(pickRange(started, day(2026, 10, 3))), '2026-10-03 to 2026-10-09');
  assert.equal(span(pickRange(started, day(2026, 10, 9))), '2026-10-09 to 2026-10-09');
});

test('a pick after a finished range starts a new one', () => {
  assert.equal(span(pickRange({ from: day(2026, 10, 3), to: day(2026, 10, 9) }, day(2026, 10, 20))), '2026-10-20 to ');
});

test('quick ranges end today, and last month is the whole month before', () => {
  const today = day(2026, 10, 25);
  assert.equal(span(lastDays(7, today)), '2026-10-19 to 2026-10-25');
  assert.equal(span(lastDays(1, today)), '2026-10-25 to 2026-10-25');
  assert.equal(span(thisMonth(today)), '2026-10-01 to 2026-10-25');
  assert.equal(span(lastMonth(day(2026, 1, 15))), '2025-12-01 to 2025-12-31');
});

test('the common quick ranges, and the one a range matches', () => {
  const today = day(2026, 10, 25);
  const ranges = quickRanges(today);
  assert.deepEqual(
    ranges.map((range) => range.label),
    ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'This month', 'Last month'],
  );
  assert.equal(span(ranges[1]), '2026-10-24 to 2026-10-24');
  assert.equal(matchQuickRange(ranges, { from: day(2026, 10, 19), to: day(2026, 10, 25) })?.label, 'Last 7 days');
  assert.equal(matchQuickRange(ranges, { from: day(2026, 10, 19), to: day(2026, 10, 24) }), undefined);
  assert.equal(matchQuickRange(ranges, { from: day(2026, 10, 19) }), undefined);
});

test('the week starts on the day the locale starts it', () => {
  assert.equal(weekStart('en-US'), 0);
  assert.equal(weekStart('en-GB'), 1);
  assert.equal(weekStart('el'), 1);
  assert.equal(weekStart('ar-EG'), 6);
});

test('the week start holds in a browser that has no week info', (t) => {
  const prototype = Intl.Locale.prototype;
  const saved = ['getWeekInfo', 'weekInfo'].map((key) => [key, Object.getOwnPropertyDescriptor(prototype, key)] as const);
  for (const [key] of saved) Reflect.deleteProperty(prototype, key);
  t.after(() => {
    for (const [key, descriptor] of saved) if (descriptor) Object.defineProperty(prototype, key, descriptor);
  });
  assert.equal('weekInfo' in new Intl.Locale('en-US'), false);
  assert.equal(weekStart('en-US'), 0);
  assert.equal(weekStart('pt-BR'), 0);
  assert.equal(weekStart('en-GB'), 1);
  assert.equal(weekStart('fa-IR'), 6);
});

test('labels name the month, the weekdays and each day in the locale', () => {
  assert.equal(monthLabel(day(2026, 10, 14), 'en-US'), 'October 2026');
  assert.equal(monthLabel(day(2026, 10, 14), 'el'), 'Οκτώβριος 2026');
  assert.deepEqual(
    weekdayLabels('en-US', 1).map(({ short }) => short),
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  );
  assert.equal(weekdayLabels('en-US', 0)[0].long, 'Sunday');
  assert.equal(dayNumber(day(2026, 10, 25), 'en-US'), '25');
  assert.equal(dayNumber(day(2026, 10, 25), 'ar-EG'), '٢٥');
});

test('a column head falls back to the narrow weekday where the short one is a whole word', () => {
  const arabic = weekdayLabels('ar-EG', 6);
  assert.ok(arabic.every(({ short }) => short.length <= 3), arabic.map(({ short }) => short).join(' '));
  assert.equal(arabic[0].long, 'السبت');
  assert.equal(dayLabel(day(2026, 10, 25), 'en-US'), 'Sunday, October 25, 2026');
});

test('a date and a range read short, and an open range reads its first day', () => {
  assert.equal(formatDate(day(2026, 10, 25), 'en-US'), 'Oct 25, 2026');
  assert.equal(formatRange({ from: day(2026, 10, 3), to: day(2026, 10, 9) }, 'en-US'), 'Oct 3 – 9, 2026');
  assert.equal(formatRange({ from: day(2025, 12, 3), to: day(2026, 1, 9) }, 'en-US'), 'Dec 3, 2025 – Jan 9, 2026');
  assert.equal(formatRange({ from: day(2026, 10, 3) }, 'en-US'), 'Oct 3, 2026 –');
  assert.equal(formatRange({ from: day(2026, 10, 3), to: day(2026, 10, 3) }, 'en-US'), 'Oct 3, 2026');
});

test('each day knows its place in a range, and an open range reaches to the day in preview', () => {
  const range = { from: day(2026, 10, 3), to: day(2026, 10, 9) };
  assert.equal(rangePosition(day(2026, 10, 3), range), 'start');
  assert.equal(rangePosition(day(2026, 10, 5), range), 'middle');
  assert.equal(rangePosition(day(2026, 10, 9), range), 'end');
  assert.equal(rangePosition(day(2026, 10, 10), range), null);
  assert.equal(rangePosition(day(2026, 10, 3), { from: day(2026, 10, 3), to: day(2026, 10, 3) }), 'single');
  const open = { from: day(2026, 10, 9) };
  assert.equal(rangePosition(day(2026, 10, 9), open), 'single');
  assert.equal(rangePosition(day(2026, 10, 5), open, day(2026, 10, 3)), 'middle');
  assert.equal(rangePosition(day(2026, 10, 3), open, day(2026, 10, 3)), 'start');
  assert.equal(rangePosition(day(2026, 10, 9), open, day(2026, 10, 3)), 'end');
});
