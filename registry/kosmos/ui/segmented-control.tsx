'use client';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { flushSync } from 'react-dom';
import { cn } from '@/registry/kosmos/lib/cn';

type SegmentedControlSize = 'sm' | 'md';

const SegmentedControlContext = React.createContext<SegmentedControlSize>('md');

type SegmentedControlProps = Omit<RadioGroupPrimitive.Props<string>, 'value' | 'defaultValue' | 'onValueChange'> & {
  /** The selected item. Use with `onValueChange`. */
  value?: string;
  /** The item selected at first, when the control keeps its own state. */
  defaultValue?: string;
  /** Called with the newly selected item. */
  onValueChange?: (value: string, eventDetails: RadioGroupPrimitive.ChangeEventDetails) => void;
  /** `md` matches a 30px Button, `sm` a 24px one. */
  size?: SegmentedControlSize;
};

/**
 * Picks one of two to five options, like a view mode or a time range. A radio group underneath: once an
 * item is selected one always stays selected, Tab lands on it, and the arrow keys move the selection.
 * Pass `value` or `defaultValue` so it starts with a selection, and `name` to submit it with a form.
 */
function SegmentedControl({ className, size = 'md', ref, children, ...props }: SegmentedControlProps) {
  const groupRef = React.useRef<HTMLDivElement | null>(null);
  const thumbRef = React.useRef<HTMLSpanElement | null>(null);
  const [thumb, setThumb] = React.useState<{ left: number; top: number; width: number; height: number; sliding: boolean } | null>(null);

  // Place the raised surface behind the checked item. It only exists once measured, so it never slides in from nowhere.
  // It slides only to a newly checked item; when the items resize, it follows them in the same frame.
  React.useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    let checked: HTMLElement | null = null;
    const measure = () => {
      const item = group.querySelector<HTMLElement>('[data-slot="segmented-control-item"][data-checked]');
      const moved = checked !== null && item !== checked;
      checked = item;
      if (!item) return setThumb(null);
      const next = { left: item.offsetLeft - 1, top: item.offsetTop - 1, width: item.offsetWidth + 2, height: item.offsetHeight + 2 };
      setThumb((current) => {
        const sliding = moved || (current?.sliding ?? false);
        return current &&
          current.left === next.left &&
          current.top === next.top &&
          current.width === next.width &&
          current.height === next.height &&
          current.sliding === sliding
          ? current
          : { ...next, sliding };
      });
    };
    // React would otherwise paint one frame with the thumb where the item was.
    const measureNow = () => flushSync(measure);
    measure();
    const resize = new ResizeObserver(measureNow);
    resize.observe(group);
    group.querySelectorAll('[data-slot="segmented-control-item"]').forEach((item) => resize.observe(item));
    const mutation = new MutationObserver(measureNow);
    mutation.observe(group, { attributes: true, attributeFilter: ['data-checked'], subtree: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);

  // Stop sliding once no slide runs, and when a move started none, as when the item changed before the thumb painted.
  // `getAnimations` flushes styles first, so it sees a slide this commit just started.
  const settle = React.useCallback(() => {
    if (thumbRef.current?.getAnimations().length) return;
    setThumb((current) => (current?.sliding ? { ...current, sliding: false } : current));
  }, []);
  React.useLayoutEffect(() => {
    if (thumb?.sliding) settle();
  }, [thumb, settle]);

  return (
    <SegmentedControlContext.Provider value={size}>
      <RadioGroupPrimitive<string>
        ref={(node) => {
          groupRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot="segmented-control"
        data-size={size}
        data-thumb={thumb ? '' : undefined}
        className={cn(
          'group/segmented relative inline-flex w-fit max-w-full items-stretch rounded-lg border border-transparent bg-muted p-0.5 shadow-inset',
          className,
        )}
        {...props}
      >
        {thumb && (
          <span
            aria-hidden
            data-slot="segmented-control-thumb"
            ref={thumbRef}
            data-sliding={thumb.sliding ? '' : undefined}
            onTransitionEnd={settle}
            onTransitionCancel={settle}
            style={
              {
                '--thumb-x': `${thumb.left}px`,
                '--thumb-y': `${thumb.top}px`,
                '--thumb-width': `${thumb.width}px`,
                '--thumb-height': `${thumb.height}px`,
              } as React.CSSProperties
            }
            className="pointer-events-none absolute top-0 left-0 h-(--thumb-height) w-(--thumb-width) translate-x-(--thumb-x) translate-y-(--thumb-y) rounded-md border border-transparent bg-secondary shadow-control data-sliding:transition-[translate,width,height] data-sliding:duration-slow data-sliding:ease-smooth-in-out motion-reduce:hidden"
          />
        )}
        {children}
      </RadioGroupPrimitive>
    </SegmentedControlContext.Provider>
  );
}

const segmentedControlItemVariants = cva(
  [
    // Labels stay on one line until the control reaches the width of its container, then wrap.
    'relative isolate inline-flex min-w-0 grow cursor-default items-center justify-center gap-1.5 rounded-md border border-transparent text-center font-medium text-balance text-muted-foreground [-webkit-tap-highlight-color:transparent]',
    'transition-[color] hover:not-data-disabled:text-foreground data-checked:text-foreground',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'data-disabled:opacity-50',
    // The raised surface behind the selected item: it cross-fades here until the sliding one is measured, and under reduced motion.
    'before:absolute before:-inset-px before:-z-10 before:rounded-[inherit] before:border before:border-transparent before:bg-secondary before:opacity-0 before:shadow-control',
    'before:transition-opacity data-checked:before:opacity-100 motion-safe:group-data-thumb/segmented:before:hidden',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    // An item with only an icon and an `aria-label` is square.
    '[&[aria-label]]:shrink-0 [&[aria-label]]:px-0',
  ],
  {
    variants: {
      size: {
        sm: "min-h-5 px-2 text-small [&_svg:not([class*='size-'])]:size-3.5 [&[aria-label]]:w-6",
        md: 'min-h-6.5 px-2.5 py-0.5 text-body [&[aria-label]]:w-7',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

type SegmentedControlItemProps = Omit<RadioPrimitive.Root.Props<string>, 'value'> & {
  /** The value the control reports when this item is selected. */
  value: string;
};

/**
 * One option. Text, an icon (`data-icon="inline-start"`), or an icon alone with an `aria-label`,
 * which makes the item square. A raised surface slides to the selected item
 * (300ms); under reduced motion it cross-fades in instead.
 */
function SegmentedControlItem({ className, ...props }: SegmentedControlItemProps) {
  const size = React.useContext(SegmentedControlContext);
  return (
    <RadioPrimitive.Root
      data-slot="segmented-control-item"
      className={cn(segmentedControlItemVariants({ size }), className)}
      {...props}
    />
  );
}

export { SegmentedControl, SegmentedControlItem, type SegmentedControlProps, type SegmentedControlItemProps };
