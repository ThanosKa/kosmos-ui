'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { useRender } from '@base-ui/react/use-render';
import { Bell } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { duration, ease } from '@/registry/kosmos/lib/motion';
import { Button, type ButtonProps } from '@/registry/kosmos/ui/button';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/registry/kosmos/ui/drawer';
import { PopoverPortal, PopoverPositioner } from '@/registry/kosmos/ui/popover';
import { ScrollArea, type ScrollAreaProps } from '@/registry/kosmos/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

type NotificationInboxVariant = 'popover' | 'sheet';

const InboxVariant = React.createContext<NotificationInboxVariant>('popover');

const power3Out = `cubic-bezier(${ease.power3Out.join(',')})`;
const sineInOut = 'cubic-bezier(0.37, 0, 0.63, 1)';
/** One ring of the bell: a swing that settles over 0.8s. */
const swingDegrees = [0, 16, -13, 9, -6, 3, 0];
const swingDuration = 800;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function countLabel(count: number, max: number) {
  return count > max ? `${max}+` : String(count);
}

/**
 * The bell icon and its unread badge. The bell swings when `count` goes up, so the motion always means something new
 * arrived; the badge pops in the first time and its number rolls on every change. Under reduced motion only the
 * badge fades.
 */
function BellGlyph({ count, max }: { count: number; max: number }) {
  const icon = React.useRef<SVGSVGElement>(null);
  const badge = React.useRef<HTMLSpanElement>(null);
  const number = React.useRef<HTMLSpanElement>(null);
  const outgoing = React.useRef<HTMLSpanElement>(null);
  const previous = React.useRef(count);

  React.useLayoutEffect(() => {
    const before = previous.current;
    previous.current = count;
    if (before === count) return;
    const reduce = prefersReducedMotion();

    if (count > before && !reduce && icon.current?.getAnimations().length === 0) {
      icon.current.animate(
        swingDegrees.map((deg) => ({ rotate: `${deg}deg`, easing: sineInOut })),
        { duration: swingDuration },
      );
    }

    if (before === 0) {
      badge.current?.animate(
        reduce
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, scale: 0.7 },
              { opacity: 1, scale: 1.08, offset: 0.6 },
              { opacity: 1, scale: 1 },
            ],
        { duration: duration.slow * 1000, easing: power3Out },
      );
      return;
    }

    if (count === 0 || !number.current || !outgoing.current) return;
    if (countLabel(before, max) === countLabel(count, max)) return;
    const shift = reduce ? '0%' : count > before ? '100%' : '-100%';
    const timing = { duration: duration.base * 1000, easing: power3Out };
    outgoing.current.textContent = countLabel(before, max);
    outgoing.current.animate(
      [
        { translate: '0 0', opacity: 1 },
        { translate: `0 calc(${shift} * -1)`, opacity: 0 },
      ],
      { ...timing, fill: 'forwards' },
    );
    number.current.animate(
      [
        { translate: `0 ${shift}`, opacity: 0 },
        { translate: '0 0', opacity: 1 },
      ],
      timing,
    );
  }, [count, max]);

  return (
    <>
      <Bell ref={icon} aria-hidden className="origin-[50%_10%]" />
      {count > 0 ? (
        <span
          ref={badge}
          aria-hidden
          data-slot="notification-bell-badge"
          className="pointer-events-none absolute -end-1.75 -top-1.75 grid h-4 min-w-4 overflow-hidden rounded-full bg-primary px-1 text-caption leading-4 font-medium text-primary-foreground tabular-nums ring-2 ring-background"
        >
          <span ref={number} className="col-start-1 row-start-1 text-center">
            {countLabel(count, max)}
          </span>
          <span ref={outgoing} className="col-start-1 row-start-1 text-center opacity-0" />
        </span>
      ) : null}
    </>
  );
}

type PlainButtonProps = Extract<ButtonProps, { href?: undefined }>;

type NotificationBellProps = Omit<PlainButtonProps, 'children' | 'variant' | 'size'> & {
  /** Unread notifications. 0 hides the badge. */
  count?: number;
  /** Counts above this show as "9+". */
  max?: number;
};

function bellLabel(count: number) {
  return count > 0 ? `Notifications, ${count} unread` : 'Notifications';
}

/**
 * The header's bell: a secondary icon button with the unread count. Use it alone when the bell opens a page; inside a
 * `NotificationInbox`, `NotificationInboxTrigger` renders it.
 */
function NotificationBell({ count = 0, max = 9, className, ...props }: NotificationBellProps) {
  return (
    <Button
      data-slot="notification-bell"
      variant="secondary"
      size="icon"
      aria-label={bellLabel(count)}
      className={cn('relative', className)}
      {...props}
    >
      <BellGlyph count={count} max={max} />
    </Button>
  );
}

type NotificationInboxProps = {
  /** `popover` opens under the bell; `sheet` slides in from the end edge, for a busier inbox. */
  variant?: NotificationInboxVariant;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Traps focus and blocks the page while open. On by default for the sheet only. */
  modal?: boolean;
  children?: React.ReactNode;
};

/** Holds the open state, as a Base UI Popover or, with `variant="sheet"`, a Drawer. */
function NotificationInbox({ variant = 'popover', onOpenChange, modal, ...props }: NotificationInboxProps) {
  const handleOpenChange = onOpenChange ? (open: boolean) => onOpenChange(open) : undefined;
  return (
    <InboxVariant value={variant}>
      {variant === 'sheet' ? (
        <Drawer data-slot="notification-inbox" modal={modal ?? true} onOpenChange={handleOpenChange} {...props} />
      ) : (
        <PopoverPrimitive.Root
          data-slot="notification-inbox"
          modal={modal ?? false}
          onOpenChange={handleOpenChange}
          {...props}
        />
      )}
    </InboxVariant>
  );
}

/** The bell that opens the inbox. Takes the `NotificationBell` props. */
function NotificationInboxTrigger({ count = 0, max = 9, className, ...props }: NotificationBellProps) {
  const variant = React.use(InboxVariant);
  const button = (
    <Button variant="secondary" size="icon" aria-label={bellLabel(count)} className={cn('relative', className)} {...props} />
  );
  const glyph = <BellGlyph count={count} max={max} />;
  return variant === 'sheet' ? (
    <DrawerTrigger data-slot="notification-inbox-trigger" render={button}>
      {glyph}
    </DrawerTrigger>
  ) : (
    <PopoverPrimitive.Trigger data-slot="notification-inbox-trigger" render={button}>
      {glyph}
    </PopoverPrimitive.Trigger>
  );
}

type NotificationInboxContentProps = {
  className?: string;
  children?: React.ReactNode;
  /** Which edge of the bell the popover lines up with. */
  align?: 'start' | 'center' | 'end';
  /** The element the inbox renders into. Defaults to `document.body`. */
  container?: HTMLElement | null;
  /** Where focus goes on open; `false` leaves it on the bell. */
  initialFocus?: boolean;
};

/**
 * The inbox surface: a 380px popover under the bell that keeps one height as its tabs change, or a full-height sheet
 * on the end edge. Lay it out top to bottom with a header, optional tabs, the body and a footer.
 */
function NotificationInboxContent({ className, children, align = 'end', container, initialFocus }: NotificationInboxContentProps) {
  const variant = React.use(InboxVariant);
  if (variant === 'sheet') {
    return (
      <DrawerContent
        data-slot="notification-inbox-content"
        container={container}
        initialFocus={initialFocus}
        className={cn('sm:data-[swipe-direction=right]:max-w-md', className)}
      >
        {children}
      </DrawerContent>
    );
  }
  return (
    <PopoverPortal container={container}>
      <PopoverPositioner align={align}>
        <PopoverPrimitive.Popup
          data-slot="notification-inbox-content"
          initialFocus={initialFocus}
          className={cn(
            'flex h-[min(35rem,var(--available-height))] w-95 max-w-(--available-width) origin-(--transform-origin) flex-col overflow-hidden rounded-xl border border-transparent bg-popover text-body text-popover-foreground shadow-popover',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            'transition-[opacity,scale] duration-base',
            'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast',
            'motion-safe:data-starting-style:scale-[0.97] motion-safe:data-ending-style:scale-[0.97]',
            className,
          )}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPositioner>
    </PopoverPortal>
  );
}

/** The title row. Put `NotificationInboxTitle` and `NotificationInboxActions` in it. */
function NotificationInboxHeader({ className, ...props }: React.ComponentProps<'div'>) {
  const variant = React.use(InboxVariant);
  return (
    <div
      data-slot="notification-inbox-header"
      className={cn(
        'flex shrink-0 items-center gap-2',
        variant === 'sheet' ? 'ps-5 pe-3 pt-4 group-data-close-button/drawer:pe-12' : 'ps-4 pe-2 pt-3',
        className,
      )}
      {...props}
    />
  );
}

function NotificationInboxTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  const variant = React.use(InboxVariant);
  if (variant === 'sheet') {
    return <DrawerTitle data-slot="notification-inbox-title" className={className} {...props} />;
  }
  return (
    <PopoverPrimitive.Title data-slot="notification-inbox-title" className={cn('text-title', className)} {...props} />
  );
}

/** Buttons at the end of the header, such as "Mark all as read" and a settings link. */
function NotificationInboxActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="notification-inbox-actions"
      className={cn('ms-auto flex items-center gap-0.5', className)}
      {...props}
    />
  );
}

/** Tabs that filter the list, such as All, Unread and Archive. The body goes inside, after the list. */
function NotificationInboxTabs({ className, ...props }: React.ComponentProps<typeof Tabs>) {
  return <Tabs data-slot="notification-inbox-tabs" className={cn('min-h-0 flex-1 gap-0', className)} {...props} />;
}

function NotificationInboxTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
  const variant = React.use(InboxVariant);
  return <TabsList className={cn(variant === 'sheet' ? 'px-3' : 'px-2', className)} {...props} />;
}

const NotificationInboxTab = TabsTrigger;

type NotificationInboxBodyProps = Omit<ScrollAreaProps, 'children'> & {
  children?: React.ReactNode;
  /** Shown over the top of the list, such as `NotificationInboxNewItems`; it stays put while the list scrolls. */
  overlay?: React.ReactNode;
};

/** The list area. Fills the room between header and footer and scrolls on its own, with the edge fade. */
function NotificationInboxBody({ className, children, overlay, viewportClassName, ...props }: NotificationInboxBodyProps) {
  return (
    <div data-slot="notification-inbox-body" className="relative flex min-h-0 flex-1 flex-col">
      {overlay}
      <ScrollArea
        className={cn('min-h-0 flex-1 rounded-none has-[>[data-slot=scroll-area-viewport]:focus-visible]:-outline-offset-2', className)}
        viewportClassName={cn('overscroll-contain', viewportClassName)}
        {...props}
      >
        {children}
      </ScrollArea>
    </div>
  );
}

/**
 * A pill over the top of the list for notifications that arrived while the inbox is open, so the rows under the
 * pointer never move. Clicking it shows them; hold new items back until then. Renders nothing at 0.
 */
function NotificationInboxNewItems({
  count,
  className,
  children,
  ...props
}: Omit<PlainButtonProps, 'variant' | 'size'> & { count: number }) {
  if (count === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center">
      <Button
        data-slot="notification-inbox-new-items"
        variant="secondary"
        size="sm"
        className={cn(
          'pointer-events-auto rounded-full shadow-popover',
          'transition-[opacity,translate,scale] starting:opacity-0 motion-safe:starting:-translate-y-2',
          className,
        )}
        {...props}
      >
        {children ?? `${count} new`}
      </Button>
    </div>
  );
}

type NotificationInboxGroupProps = React.ComponentProps<'section'> & {
  /** The heading over the rows, such as "Today". */
  label: React.ReactNode;
};

/** Rows under one heading, split by dividers. */
function NotificationInboxGroup({ label, className, children, ...props }: NotificationInboxGroupProps) {
  const variant = React.use(InboxVariant);
  const id = React.useId();
  return (
    <section data-slot="notification-inbox-group" aria-labelledby={id} className={className} {...props}>
      <h3
        id={id}
        className={cn(
          'pt-3 pb-1 text-caption tracking-[0.05em] text-muted-foreground uppercase',
          variant === 'sheet' ? 'px-5' : 'px-4',
        )}
      >
        {label}
      </h3>
      <ul className="flex flex-col divide-y divide-border">{children}</ul>
    </section>
  );
}

/** A row of full-width buttons at the bottom edge, such as "View all notifications". */
function NotificationInboxFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="notification-inbox-footer"
      className={cn(
        'flex shrink-0 divide-x divide-border border-t border-border *:h-10 *:flex-1 *:rounded-none',
        className,
      )}
      {...props}
    />
  );
}

const ItemUnread = React.createContext(false);

type NotificationItemProps = React.ComponentProps<'li'> & {
  /** Shows the unread dot, and says "Unread" to screen readers. */
  unread?: boolean;
};

/**
 * One notification. The whole row opens it through `NotificationItemTitle`; buttons inside stay clickable on top.
 * Lay it out with Media, Content and Aside.
 */
function NotificationItem({ unread = false, className, ...props }: NotificationItemProps) {
  const variant = React.use(InboxVariant);
  return (
    <ItemUnread value={unread}>
      <li
        data-slot="notification-item"
        data-unread={unread ? '' : undefined}
        className={cn(
          'group/notification relative flex gap-3 py-3 transition-[background-color] duration-instant hover:bg-accent',
          variant === 'sheet' ? 'px-5' : 'px-4',
          className,
        )}
        {...props}
      />
    </ItemUnread>
  );
}

type NotificationItemMediaProps = React.ComponentProps<'span'> & {
  /** A small icon on the corner that says what kind of notification it is, such as a mention. */
  icon?: React.ReactNode;
};

/** The sender: an `Avatar`, or a square one for a project or the system, with the kind icon on its corner. */
function NotificationItemMedia({ icon, className, children, ...props }: NotificationItemMediaProps) {
  return (
    <span data-slot="notification-item-media" className={cn('relative inline-flex h-fit shrink-0', className)} {...props}>
      {children}
      {icon ? (
        <span
          aria-hidden
          className="absolute -end-1 -bottom-1 grid size-4 place-items-center rounded-full border border-transparent bg-popover text-muted-foreground shadow-control [&_svg]:size-2.5"
        >
          {icon}
        </span>
      ) : null}
    </span>
  );
}

function NotificationItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="notification-item-content" className={cn('flex min-w-0 flex-1 flex-col gap-1', className)} {...props} />;
}

/**
 * The sentence, and the link that opens the notification: it stretches over the whole row. Wrap names and the object
 * in `<strong>`. Renders an `<a>`; `render` swaps in a router link.
 */
function NotificationItemTitle({ className, render, ...props }: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    render,
    props: mergeProps<'a'>(
      {
        className: cn(
          'block text-body text-pretty text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground',
          'after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring',
          className,
        ),
      },
      props,
    ),
    state: { slot: 'notification-item-title' },
  });
}

/** A quote of the comment or message, two lines at most. */
function NotificationItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="notification-item-description"
      className={cn('line-clamp-2 border-s-2 border-border ps-2 text-small text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Where it happened, such as the project's name. */
function NotificationItemMeta({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="notification-item-meta" className={cn('text-caption text-muted-foreground', className)} {...props} />;
}

/** Buttons for a decision made from the row, such as Approve and Decline. They sit above the row's link. */
function NotificationItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="notification-item-actions" className={cn('relative z-10 flex flex-wrap gap-2 pt-1', className)} {...props} />;
}

/**
 * The end column: the time and the unread dot, which give their place to the quick actions while the row is hovered
 * or holds focus. On a touch screen the quick actions stay in view under the dot.
 */
function NotificationItemAside({ className, children, ...props }: React.ComponentProps<'div'>) {
  const unread = React.use(ItemUnread);
  return (
    <div data-slot="notification-item-aside" className={cn('relative flex w-14 shrink-0 flex-col items-end gap-2', className)} {...props}>
      {children}
      <span
        aria-hidden
        className={cn(
          'me-0.5 size-2 rounded-full bg-primary transition-[opacity,scale] [@media(hover:hover)]:group-focus-within/notification:opacity-0 [@media(hover:hover)]:group-hover/notification:opacity-0',
          !unread && 'scale-50 opacity-0',
        )}
      />
      {unread ? <span className="sr-only">Unread</span> : null}
    </div>
  );
}

/** When it happened, as a short relative time ("4m"). Give the full date to `dateTime` and, for screen readers, a `title`. */
function NotificationItemTime({ className, ...props }: React.ComponentProps<'time'>) {
  return (
    <time
      data-slot="notification-item-time"
      className={cn(
        'pt-0.5 text-caption whitespace-nowrap text-muted-foreground tabular-nums transition-[opacity]',
        '[@media(hover:hover)]:group-focus-within/notification:opacity-0 [@media(hover:hover)]:group-hover/notification:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

/** Up to two icon buttons, such as "Mark as read" and "Archive", shown in the time's place on hover and focus. */
function NotificationItemQuickActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="notification-item-quick-actions"
      className={cn(
        'relative z-10 order-last flex gap-0.5',
        '[@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:absolute [@media(hover:hover)]:end-0 [@media(hover:hover)]:top-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-[opacity]',
        '[@media(hover:hover)]:group-focus-within/notification:pointer-events-auto [@media(hover:hover)]:group-focus-within/notification:opacity-100',
        '[@media(hover:hover)]:group-hover/notification:pointer-events-auto [@media(hover:hover)]:group-hover/notification:opacity-100',
        className,
      )}
      {...props}
    />
  );
}

/** One quick action: an icon button named by `label`, which also shows as its tooltip text. */
function NotificationItemQuickAction({ label, ...props }: Omit<PlainButtonProps, 'variant' | 'size'> & { label: string }) {
  return <Button variant="item" size="icon-sm" aria-label={label} title={label} {...props} />;
}

export {
  NotificationBell,
  NotificationInbox,
  NotificationInboxActions,
  NotificationInboxBody,
  NotificationInboxContent,
  NotificationInboxFooter,
  NotificationInboxGroup,
  NotificationInboxHeader,
  NotificationInboxNewItems,
  NotificationInboxTab,
  NotificationInboxTabs,
  NotificationInboxTabsList,
  NotificationInboxTitle,
  NotificationInboxTrigger,
  NotificationItem,
  NotificationItemActions,
  NotificationItemAside,
  NotificationItemContent,
  NotificationItemDescription,
  NotificationItemMedia,
  NotificationItemMeta,
  NotificationItemQuickAction,
  NotificationItemQuickActions,
  NotificationItemTime,
  NotificationItemTitle,
  type NotificationBellProps,
  type NotificationInboxProps,
  type NotificationInboxContentProps,
  type NotificationItemProps,
};
