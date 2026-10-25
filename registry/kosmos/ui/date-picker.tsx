'use client';

import { CalendarDays, Check } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import {
  addMonths,
  clampDay,
  formatDate,
  formatRange,
  isOutside,
  matchQuickRange,
  quickRanges,
  startOfDay,
  startOfMonth,
  type DateRange,
  type QuickRange,
  type Weekday,
} from '@/registry/kosmos/lib/dates';
import { Button } from '@/registry/kosmos/ui/button';
import { Calendar } from '@/registry/kosmos/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/registry/kosmos/ui/popover';

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

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

const subscribeToWidth = (onChange: () => void) => {
  const list = window.matchMedia('(min-width: 640px)');
  list.addEventListener('change', onChange);
  return () => list.removeEventListener('change', onChange);
};

/** Two months from 640px wide, one below. The popup only opens on the client, so the server value never shows. */
function useMonthsThatFit() {
  return React.useSyncExternalStore(
    subscribeToWidth,
    () => (window.matchMedia('(min-width: 640px)').matches ? 2 : 1),
    () => 1,
  );
}

/** The day the calendar puts in the Tab order, which the popup focuses when it opens. */
function tabbableDay(popup: HTMLElement | null) {
  return popup?.querySelector<HTMLElement>('[data-slot=calendar-day][tabindex="0"]') ?? true;
}

type PickerSharedProps = {
  /** Shown while nothing is picked. */
  placeholder?: string;
  /** A BCP 47 language tag for the names and the dates on the trigger. */
  locale?: string;
  weekStartsOn?: Weekday;
  /** The first day that can be picked. */
  min?: Date;
  /** The last day that can be picked. */
  max?: Date;
  /** Turns off single days, such as weekends. */
  isDateDisabled?: (date: Date) => boolean;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Where the popup lines up with the trigger. */
  align?: 'start' | 'center' | 'end';
  /** The element the popup renders into. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof PopoverContent>['container'];
  /** Classes for the trigger. A trigger beside a 30px Button takes `h-7.5`. */
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
};

type NameProps = Pick<PickerSharedProps, 'aria-label' | 'aria-labelledby' | 'aria-describedby'>;

/**
 * Names the field with its label and its value, "Due date, Oct 25, 2026", where a plain `aria-label` would hide the
 * value, and names the popup after the field. A field named by a `label` element instead gets its value as a description.
 */
function usePickerNames({ 'aria-label': label, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy }: NameProps) {
  const labelId = React.useId();
  const valueId = React.useId();
  const nameIds = labelledBy ?? (label ? labelId : undefined);
  return {
    trigger: {
      label,
      labelId,
      valueId,
      'aria-labelledby': nameIds && `${nameIds} ${valueId}`,
      'aria-describedby': (nameIds ? describedBy : [valueId, describedBy].filter(Boolean).join(' ')) || undefined,
    },
    popup: { 'aria-labelledby': nameIds },
  };
}

type PickerTriggerProps = Omit<React.ComponentProps<typeof PopoverTrigger>, 'className'> & {
  className?: string;
  empty: boolean;
  label?: string;
  labelId: string;
  valueId: string;
};

/** The field the picker lives in: the surface, height and focus of a Select trigger, keep the two in step. */
function PickerTrigger({ className, empty, label, labelId, valueId, children, ...props }: PickerTriggerProps) {
  return (
    <PopoverTrigger
      data-slot="date-picker-trigger"
      data-placeholder={empty || undefined}
      className={cn(
        'inline-flex h-8.5 min-w-0 items-center gap-2 rounded-lg border border-transparent bg-secondary ps-2.5 pe-3 text-start text-body text-secondary-foreground shadow-field select-none [-webkit-tap-highlight-color:transparent]',
        'transition-[background-color,box-shadow]',
        'hover:not-data-disabled:bg-muted data-popup-open:bg-muted',
        // The transparent outline paints only in forced-colors mode, which drops the box-shadow focus line and halo.
        'focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-transparent focus-visible:ring-offset-1 focus-visible:ring-offset-ring focus-visible:ring-3 focus-visible:ring-ring/20',
        'aria-invalid:ring-1 aria-invalid:ring-destructive',
        'aria-invalid:focus-visible:ring-offset-destructive aria-invalid:focus-visible:ring-3 aria-invalid:focus-visible:ring-destructive/20',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CalendarDays aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      {label && (
        <span id={labelId} className="sr-only">
          {label}
        </span>
      )}
      <span id={valueId} className={cn('min-w-0 flex-1 truncate', empty && 'text-muted-foreground')}>
        {children}
      </span>
    </PopoverTrigger>
  );
}

type DatePickerProps = PickerSharedProps & {
  /** The picked day. Use with `onValueChange`. */
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date) => void;
  /** Submits the day with a form, as `YYYY-MM-DD`. */
  name?: string;
  /** How the trigger writes the day. Defaults to the short date of the locale, "Oct 25, 2026". */
  formatValue?: (date: Date) => string;
};

/** A field that opens a calendar to pick one day. The popup closes on the pick and gives the focus back to the field. */
function DatePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  name,
  formatValue,
  placeholder = 'Pick a date',
  locale = 'en-US',
  weekStartsOn,
  min,
  max,
  isDateDisabled,
  disabled,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  align = 'start',
  container,
  className,
  ...triggerProps
}: DatePickerProps) {
  const [value, setValue] = useControllableState(valueProp, defaultValue ?? null, onValueChange as (date: Date | null) => void);
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const popupRef = React.useRef<HTMLDivElement>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PickerTrigger empty={!value} disabled={disabled} className={className} {...triggerProps}>
        {value ? (formatValue?.(value) ?? formatDate(value, locale)) : placeholder}
      </PickerTrigger>
      {name && <input type="hidden" name={name} value={value ? dateKey(value) : ''} />}
      <PopoverContent
        ref={popupRef}
        align={align}
        container={container}
        initialFocus={() => tabbableDay(popupRef.current)}
        className="w-auto"
      >
        <Calendar
          value={value}
          onValueChange={(date) => {
            setValue(date);
            setOpen(false);
          }}
          locale={locale}
          weekStartsOn={weekStartsOn}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
        />
      </PopoverContent>
    </Popover>
  );
}

/** A finished range: both days picked. */
type DateRangeValue = { from: Date; to: Date };

type DateRangePickerProps = PickerSharedProps & {
  /** The picked range. Use with `onValueChange`. */
  value?: DateRangeValue | null;
  defaultValue?: DateRangeValue | null;
  /** Called once the range is whole: on a quick range, or on the second day picked. */
  onValueChange?: (range: DateRangeValue) => void;
  /** The quick ranges beside the calendar. Defaults to `quickRanges()` from `@/lib/dates`; pass `[]` for none. */
  ranges?: readonly QuickRange[];
  /** How the trigger writes a range that is no quick range. Defaults to "Oct 3 – 9, 2026". */
  formatValue?: (range: DateRangeValue) => string;
  /** Read while the first day is to pick, and while the second is. */
  startHint?: string;
  endHint?: string;
  /** Names the list of quick ranges. */
  rangesLabel?: string;
};

/**
 * A field that opens a calendar to pick a range, with quick ranges such as "Last 7 days" beside it. The trigger names
 * the quick range a value matches. Two months show from 640px wide, one below, with the quick ranges above them.
 */
function DateRangePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  ranges: rangesProp,
  formatValue,
  placeholder = 'Pick a range',
  startHint = 'Pick the first or last day',
  endHint = 'Pick the other end',
  rangesLabel = 'Quick ranges',
  locale = 'en-US',
  weekStartsOn,
  min,
  max,
  isDateDisabled,
  disabled,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  align = 'start',
  container,
  className,
  ...triggerProps
}: DateRangePickerProps) {
  const [value, setValue] = useControllableState(
    valueProp,
    defaultValue ?? null,
    onValueChange as (range: DateRangeValue | null) => void,
  );
  const [open, setOpenState] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [draft, setDraft] = React.useState<DateRange | null>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const months = useMonthsThatFit();
  const ranges = React.useMemo(() => rangesProp ?? quickRanges(startOfDay(new Date())), [rangesProp]);
  const quick = matchQuickRange(ranges, value);
  const shown = draft ?? value;

  const setOpen = (next: boolean) => {
    setDraft(null);
    setOpenState(next);
  };
  const commit = (range: DateRangeValue) => {
    setValue(range);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PickerTrigger empty={!value} disabled={disabled} className={className} {...triggerProps}>
        {value ? (quick?.label ?? formatValue?.(value) ?? formatRange(value, locale)) : placeholder}
      </PickerTrigger>
      <PopoverContent
        ref={popupRef}
        align={align}
        container={container}
        initialFocus={() => tabbableDay(popupRef.current)}
        className="w-auto"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          {ranges.length > 0 && (
            <div
              role="group"
              aria-label={rangesLabel}
              className="grid grid-cols-2 gap-0.5 border-b border-border pb-3 sm:flex sm:w-max sm:max-w-44 sm:min-w-32 sm:flex-col sm:border-e sm:border-b-0 sm:pe-3 sm:pb-0"
            >
              {ranges.map((range) => {
                const current = quick === range && !draft;
                return (
                  <Button
                    key={range.label}
                    variant="item"
                    aria-pressed={current}
                    disabled={isOutside(range.from, min, max) || isOutside(range.to, min, max)}
                    onClick={() => commit({ from: range.from, to: range.to })}
                    className="h-auto min-h-7.5 justify-between gap-2 py-1.5 text-start whitespace-normal"
                  >
                    <span className="min-w-0 wrap-break-word">{range.label}</span>
                    {current && <Check aria-hidden />}
                  </Button>
                );
              })}
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Calendar
              mode="range"
              months={months}
              defaultMonth={addMonths(startOfMonth(value?.to ?? clampDay(new Date(), min, max)), 1 - months)}
              value={shown}
              onValueChange={(range) => {
                if (range.to) commit({ from: range.from, to: range.to });
                else setDraft(range);
              }}
              locale={locale}
              weekStartsOn={weekStartsOn}
              min={min}
              max={max}
              isDateDisabled={isDateDisabled}
            />
            <p aria-live="polite" className="text-small text-muted-foreground">
              {draft ? endHint : startHint}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, DateRangePicker, type DatePickerProps, type DateRangePickerProps, type DateRangeValue };
