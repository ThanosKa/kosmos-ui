'use client';

import { useDirection } from '@base-ui/react/direction-provider';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import {
  addDays,
  addMonths,
  clampDay,
  compareDays,
  dayLabel,
  dayNumber,
  isOutside,
  isSameDay,
  monthLabel,
  monthsInViewFor,
  monthWeeks,
  moveFocus,
  pickRange,
  rangePosition,
  startOfDay,
  startOfMonth,
  weekdayLabels,
  weekStart,
  type DateRange,
  type RangePosition,
  type Weekday,
} from '@/registry/kosmos/lib/dates';
import { Button } from '@/registry/kosmos/ui/button';

type CalendarBaseProps = Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> & {
  /** The first month in view. Use with `onMonthChange`. */
  month?: Date;
  /** The first month in view at first. Defaults to the month of the value, or this month. */
  defaultMonth?: Date;
  /** Called with the first of the month whenever the months in view change. */
  onMonthChange?: (month: Date) => void;
  /** How many months show side by side. */
  months?: number;
  /** The first day that can be picked. */
  min?: Date;
  /** The last day that can be picked. */
  max?: Date;
  /** Turns off single days, such as weekends. They keep their place in the keyboard path. */
  isDateDisabled?: (date: Date) => boolean;
  /** A BCP 47 language tag for the month and weekday names. */
  locale?: string;
  /** The first column, `0` for Sunday to `6` for Saturday. Defaults to the first day of the week in `locale`. */
  weekStartsOn?: Weekday;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
};

type CalendarSingleProps = CalendarBaseProps & {
  mode?: 'single';
  /** The picked day. Use with `onValueChange`. */
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date) => void;
};

type CalendarRangeProps = CalendarBaseProps & {
  mode: 'range';
  /** The picked range. `to` stays empty between the first and the second pick. Use with `onValueChange`. */
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  /** Called on each pick: with `{ from }` after the first, with `{ from, to }` after the second, in order. */
  onValueChange?: (range: DateRange) => void;
};

type CalendarProps = CalendarSingleProps | CalendarRangeProps;

function useControllableState<Value>(controlled: Value | undefined, initial: Value, onChange?: (next: Value) => void) {
  const [inner, setInner] = React.useState(initial);
  const set = React.useCallback(
    (next: Value) => {
      setInner(next);
      onChange?.(next);
    },
    [onChange],
  );
  return [controlled === undefined ? inner : controlled, set] as const;
}

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Every cell keeps the day's size, empty ones too, so each month takes the same six rows.
const cellClass = 'size-8 p-0 pointer-coarse:size-10';

// The range band sits on the cell behind the day, so it runs unbroken across a week and rounds off where it stops:
// at its ends, at the ends of a week and at the ends of the month. Its fill is the flat one of the current nav item.
const bandClass: Record<RangePosition, string> = {
  start: 'bg-accent rounded-s-lg',
  middle: 'bg-accent first:rounded-s-lg last:rounded-e-lg data-month-start:rounded-s-lg data-month-end:rounded-e-lg',
  end: 'bg-accent rounded-e-lg',
  single: '',
};

/**
 * A month grid to pick one day or a range. Follows the WAI-ARIA date grid: Tab lands on one day, the arrows move a day
 * or a week, Home and End go to the ends of the week, Page Up and Page Down a month (a year with Shift), and Enter or
 * Space picks. Every month takes six rows, so the height never changes, and the month names are read on change.
 */
function Calendar(props: CalendarProps) {
  const {
    mode = 'single',
    value: valueProp,
    defaultValue,
    onValueChange,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    months = 1,
    min,
    max,
    isDateDisabled,
    locale = 'en-US',
    weekStartsOn: weekStartsOnProp,
    previousMonthLabel = 'Previous month',
    nextMonthLabel = 'Next month',
    className,
    ...rest
  } = props;
  const dir = useDirection();
  const weekStartsOn = weekStartsOnProp ?? weekStart(locale);
  const today = startOfDay(new Date());

  const [value, setValue] = useControllableState<Date | DateRange | null>(
    valueProp,
    defaultValue ?? null,
    onValueChange as ((next: Date | DateRange | null) => void) | undefined,
  );
  const range = mode === 'range' ? (value as DateRange | null) : null;
  const single = mode === 'single' ? (value as Date | null) : null;
  const anchor = single ?? range?.from ?? null;

  const [firstMonth, setFirstMonth] = useControllableState<Date>(
    monthProp && startOfMonth(monthProp),
    startOfMonth(defaultMonth ?? anchor ?? clampDay(today, min, max)),
    onMonthChange,
  );
  const lastMonth = addMonths(firstMonth, months - 1);
  const inView = (date: Date) => isSameDay(monthsInViewFor(firstMonth, date, months), firstMonth);

  const [focused, setFocused] = React.useState<Date | null>(null);
  const [hovered, setHovered] = React.useState<Date | null>(null);
  const [keyboardFocus, setKeyboardFocus] = React.useState(false);
  const refocus = React.useRef(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  // The one day in the Tab order: the last focused day while it is in view, else the picked day, today or the 1st.
  const tabbable = clampDay(
    [focused, anchor, today].find((date): date is Date => !!date && inView(date)) ?? firstMonth,
    min,
    max,
  );

  React.useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    rootRef.current?.querySelector<HTMLElement>(`[data-date="${dateKey(tabbable)}"]`)?.focus();
  });

  const isDisabled = (date: Date) => isOutside(date, min, max) || !!isDateDisabled?.(date);
  const openRange = range && !range.to ? range : null;
  const preview = openRange ? (hovered ?? (keyboardFocus ? focused : null)) : null;

  const pick = (date: Date) => {
    if (isDisabled(date)) return;
    setFocused(date);
    setValue(mode === 'single' ? startOfDay(date) : pickRange(range, date));
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const from = (event.target as HTMLElement).dataset.date ? tabbable : null;
    if (!from) return;
    const next = moveFocus(from, event.key, { weekStartsOn, dir, shiftKey: event.shiftKey, min, max });
    if (!next) return;
    event.preventDefault();
    setFocused(next);
    setKeyboardFocus(true);
    const nextFirst = monthsInViewFor(firstMonth, next, months);
    if (!isSameDay(nextFirst, firstMonth)) setFirstMonth(nextFirst);
    refocus.current = true;
  };

  const step = (by: number) => {
    const next = addMonths(firstMonth, by);
    setFirstMonth(next);
    if (focused) setFocused(clampDay(addMonths(focused, by), min, max));
  };

  const weekdays = weekdayLabels(locale, weekStartsOn);
  const monthsInView = Array.from({ length: months }, (_, index) => addMonths(firstMonth, index));
  const captionId = React.useId();

  return (
    <div
      ref={rootRef}
      data-slot="calendar"
      role="group"
      className={cn('relative flex w-fit touch-manipulation flex-col gap-3 text-body select-none', className)}
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocus(false);
      }}
      {...rest}
    >
      <div className="absolute inset-x-0 top-0 flex justify-between">
        <Button
          variant="secondary"
          size="icon"
          aria-label={previousMonthLabel}
          disabled={!!min && compareDays(firstMonth, startOfMonth(min)) <= 0}
          focusableWhenDisabled
          onClick={() => step(-1)}
        >
          <ChevronLeft aria-hidden className="rtl:rotate-180" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label={nextMonthLabel}
          disabled={!!max && compareDays(lastMonth, startOfMonth(max)) >= 0}
          focusableWhenDisabled
          onClick={() => step(1)}
        >
          <ChevronRight aria-hidden className="rtl:rotate-180" />
        </Button>
      </div>
      <div aria-live="polite" className="sr-only">
        {monthsInView.map((month) => monthLabel(month, locale)).join(', ')}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-4">
        {monthsInView.map((month, index) => {
          const id = `${captionId}-${index}`;
          return (
            <div key={dateKey(month)} data-slot="calendar-month" className="flex flex-col gap-3">
              <div id={id} className="flex h-7.5 items-center justify-center px-9 font-medium">
                {monthLabel(month, locale)}
              </div>
              <table role="grid" aria-labelledby={id} className="border-collapse">
                <thead>
                  <tr>
                    {weekdays.map(({ short, long }) => (
                      <th
                        key={long}
                        scope="col"
                        abbr={long}
                        className="h-7 p-0 text-center text-caption font-normal text-muted-foreground"
                      >
                        {short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthWeeks(month, weekStartsOn).map((week, row) => (
                    <tr key={row}>
                      {week.map((date, column) => {
                        if (!date) return <td key={column} className={cellClass} />;
                        const committed = rangePosition(date, range);
                        const band = committed ?? rangePosition(date, openRange, preview);
                        const picked = mode === 'single' ? isSameDay(date, single) : committed === 'start' || committed === 'end' || committed === 'single';
                        const isToday = isSameDay(date, today);
                        const blocked = !!isDateDisabled?.(date);
                        const disabled = blocked || isOutside(date, min, max);
                        return (
                          <td
                            key={column}
                            data-month-start={date.getDate() === 1 || undefined}
                            data-month-end={isSameDay(addDays(date, 1), startOfMonth(addMonths(month, 1))) || undefined}
                            aria-selected={mode === 'single' ? picked : !!committed}
                            className={cn(cellClass, band && bandClass[band])}
                          >
                            <Button
                              variant="item"
                              size="icon"
                              data-slot="calendar-day"
                              data-date={dateKey(date)}
                              data-picked={picked || undefined}
                              data-today={isToday || undefined}
                              data-blocked={blocked || undefined}
                              aria-label={dayLabel(date, locale)}
                              aria-current={isToday ? 'date' : undefined}
                              tabIndex={isSameDay(date, tabbable) ? 0 : -1}
                              disabled={disabled}
                              focusableWhenDisabled
                              onClick={() => pick(date)}
                              onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(date)}
                              onPointerLeave={() => setHovered((current) => (isSameDay(current, date) ? null : current))}
                              onFocus={() => setFocused(date)}
                              className={cn(
                                'relative size-8 font-normal tabular-nums pointer-coarse:size-10',
                                // Struck through when turned off one by one; days past min and max only fade.
                                'data-blocked:line-through',
                                picked && 'bg-primary text-primary-foreground hover:not-data-disabled:bg-primary/90',
                              )}
                            >
                              {dayNumber(date, locale)}
                              {isToday && (
                                <span
                                  aria-hidden
                                  className="absolute inset-x-0 bottom-0.5 mx-auto size-1 rounded-full bg-current pointer-coarse:bottom-1.5"
                                />
                              )}
                            </Button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar, type CalendarProps, type CalendarRangeProps, type CalendarSingleProps };
