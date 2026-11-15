'use client';

import type { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { mergeProps } from '@base-ui/react/merge-props';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { useRender } from '@base-ui/react/use-render';
import { ChevronRight, Ellipsis } from 'lucide-react';
import * as React from 'react';
import { hiddenCrumbs, type HiddenCrumbs } from '@/registry/kosmos/lib/breadcrumb-fit';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { Tooltip, TooltipContent } from '@/registry/kosmos/ui/tooltip';

/** One page in a trail. Every crumb but the last links to its page; the last is the page the user is on. */
type BreadcrumbCrumb = {
  label: string;
  href?: string;
};

/** Renders a crumb's link instead of `<a>`, such as a router link: `(props) => <Link {...props} />`. */
type BreadcrumbLinkRender = (props: React.ComponentProps<'a'> & { href: string }) => React.ReactElement;

/** Hands `link` the props Base UI built for the anchor, plus the crumb's `href`. */
function renderWith(link: BreadcrumbLinkRender | undefined, href: string) {
  return link ? (props: React.HTMLAttributes<HTMLElement>) => link({ ...(props as React.ComponentProps<'a'>), href }) : undefined;
}

/** A crumb label stops at 192px and truncates, so one long name never pushes the others out. */
const crumbLabel = 'max-w-48 truncate font-medium';
const pageLabel = 'font-medium text-foreground';

const crumbKey = (item: BreadcrumbCrumb, index: number) => `${index}-${item.href ?? item.label}`;

/** The `<nav>` landmark of a trail, named "Breadcrumb" for screen readers. Put a `BreadcrumbList` inside. */
function Breadcrumb({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav data-slot="breadcrumb" aria-label="Breadcrumb" className={cn('min-w-0', className)} {...props} />;
}

/** The ordered list of crumbs. Stays on one line: crumbs that run out of room truncate. */
function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn('flex min-h-6 min-w-0 items-center gap-1.5 text-body text-muted-foreground', className)}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="breadcrumb-item" className={cn('inline-flex min-w-0 items-center gap-1.5', className)} {...props} />;
}

/** A parent page, in muted gray until hovered. Renders an `<a>`; pass `render` for a router link. */
function BreadcrumbLink({ className, render, ref, ...props }: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    render,
    ref,
    props: mergeProps<'a'>(
      {
        className: cn(
          crumbLabel,
          'min-w-0 rounded-sm text-muted-foreground [-webkit-tap-highlight-color:transparent]',
          'transition-[color] hover:text-foreground',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className,
        ),
      },
      props,
    ),
    state: { slot: 'breadcrumb-link' },
  });
}

/** The page the user is on, in ink, marked `aria-current="page"`. Not a link. */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn(pageLabel, 'min-w-0 truncate', className)}
      {...props}
    />
  );
}

/** The mark between two crumbs, a chevron by default. Hidden from screen readers, which announce the list instead. */
function BreadcrumbSeparator({ className, children, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden
      className={cn("flex shrink-0 items-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight className="rtl:rotate-180" />}
    </li>
  );
}

type BreadcrumbEllipsisProps = Omit<MenuPrimitive.Trigger.Props, 'children' | 'render' | 'className'> &
  Pick<MenuPrimitive.Root.Props, 'open' | 'defaultOpen' | 'onOpenChange' | 'modal'> & {
    /** The crumbs it hides, from the root down. They open in a menu, in the same order. */
    items: readonly BreadcrumbCrumb[];
    /** What each menu item renders instead of `<a>`, such as a router link. */
    link?: BreadcrumbLinkRender;
    /** The element the menu renders into. Defaults to `document.body`. */
    container?: React.ComponentProps<typeof DropdownMenuContent>['container'];
    /** Goes to the button. */
    className?: string;
  };

/** Stands in for crumbs that do not fit: a button that opens them in a menu. */
function BreadcrumbEllipsis({
  items,
  link,
  container,
  className,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  ...props
}: BreadcrumbEllipsisProps) {
  return (
    <DropdownMenu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <DropdownMenuTrigger
        {...props}
        render={
          <Button
            variant="item"
            size="icon-sm"
            aria-label={items.length === 1 ? 'Show 1 more page' : `Show ${items.length} more pages`}
            className={cn('data-popup-open:bg-accent', className)}
          />
        }
      >
        <Ellipsis aria-hidden className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent container={container} className="max-w-72">
        {items.map((item, index) =>
          item.href ? (
            <DropdownMenuLinkItem key={crumbKey(item, index)} href={item.href} render={renderWith(link, item.href)}>
              {item.label}
            </DropdownMenuLinkItem>
          ) : (
            <DropdownMenuItem key={crumbKey(item, index)} disabled>
              {item.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Shows a crumb's full name in a tooltip on hover and focus, only while the crumb is truncated. */
function FullNameHint({ label, children }: { label: string; children: React.ReactElement }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const truncated = () => {
    const crumb = triggerRef.current;
    return crumb ? crumb.scrollWidth > crumb.clientWidth : false;
  };
  return (
    <Tooltip open={open} onOpenChange={(next) => setOpen(next && truncated())}>
      {/* The primitive trigger, so the crumb keeps its own `data-slot`. */}
      <TooltipPrimitive.Trigger ref={triggerRef} render={children} />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

type BreadcrumbTrailProps = Omit<React.ComponentProps<'nav'>, 'children'> & {
  /** The pages from the root down to the current one, which is last. */
  items: readonly BreadcrumbCrumb[];
  /** What each link renders instead of `<a>`, such as a router link: `(props) => <Link {...props} />`. */
  link?: BreadcrumbLinkRender;
  /** Replaces the chevron between crumbs. */
  separator?: React.ReactNode;
};

/**
 * A whole trail from a list of pages. It fills the width it is given and, when the crumbs do not fit, hides
 * the ones after the first, nearest the root first, behind an ellipsis that opens them in a menu. When the
 * first crumb, the ellipsis and the current page still do not fit, the first crumb goes into the menu too.
 * The current page always stays, and truncates when even it alone is too wide.
 */
function BreadcrumbTrail({ items, link, separator, className, ...props }: BreadcrumbTrailProps) {
  const navRef = React.useRef<HTMLElement>(null);
  const measureRef = React.useRef<HTMLOListElement>(null);
  const [hidden, setHidden] = React.useState<HiddenCrumbs>({ start: 1, count: 0 });
  const itemsKey = items.map((item) => `${item.label}\u0000${item.href ?? ''}`).join('\u0001');

  React.useLayoutEffect(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return;
    const width = (selector: string) => measure.querySelector(selector)?.getBoundingClientRect().width ?? 0;
    const fit = () => {
      const next = hiddenCrumbs({
          widths: Array.from(measure.querySelectorAll('[data-measure=crumb]'), (crumb) => crumb.getBoundingClientRect().width),
          gap: Number.parseFloat(getComputedStyle(measure).columnGap) || 0,
          separatorWidth: width('[data-measure=separator]'),
          ellipsisWidth: width('[data-measure=ellipsis]'),
          available: nav.getBoundingClientRect().width,
      });
      setHidden((current) => (current.start === next.start && current.count === next.count ? current : next));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(nav);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [itemsKey]);

  const last = items.length - 1;
  const crumb = (item: BreadcrumbCrumb, index: number) => (
    // A shown parent never truncates once the trail is measured, since everything shown fits. Before that, as
    // rendered on the server, the current page gives up room first.
    <BreadcrumbItem key={crumbKey(item, index)} className={index === last ? undefined : 'max-w-[40%] shrink-0'}>
      <FullNameHint label={item.label}>
        {index === last ? (
          <BreadcrumbPage>{item.label}</BreadcrumbPage>
        ) : item.href ? (
          <BreadcrumbLink href={item.href} render={renderWith(link, item.href)}>
            {item.label}
          </BreadcrumbLink>
        ) : (
          <span className={cn(crumbLabel, 'min-w-0')}>{item.label}</span>
        )}
      </FullNameHint>
    </BreadcrumbItem>
  );
  const ellipsis = (
    <BreadcrumbItem className="shrink-0">
      <BreadcrumbEllipsis items={items.slice(hidden.start, hidden.start + hidden.count)} link={link} />
    </BreadcrumbItem>
  );
  const shown = items.map((item, index) => ({ item, index })).filter(({ index }) => index < hidden.start || index >= hidden.start + hidden.count);
  const slots = shown.map(({ item, index }) => crumb(item, index));
  if (hidden.count > 0) slots.splice(hidden.start, 0, ellipsis);

  return (
    <Breadcrumb ref={navRef} data-slot="breadcrumb-trail" className={cn('relative', className)} {...props}>
      <BreadcrumbList>
        {slots.map((slot, position) => (
          <React.Fragment key={slot.key ?? 'ellipsis'}>
            {position > 0 ? <BreadcrumbSeparator>{separator}</BreadcrumbSeparator> : null}
            {slot}
          </React.Fragment>
        ))}
      </BreadcrumbList>
      {/* Every crumb at its natural width, out of sight, so the trail knows how many fit. */}
      <div aria-hidden inert className="pointer-events-none invisible absolute inset-0 overflow-hidden">
        <ol ref={measureRef} className="flex w-max items-center gap-1.5 text-body">
          {items.map((item, index) => (
            <li key={crumbKey(item, index)} data-measure="crumb" className="flex">
              <span className={index === last ? pageLabel : crumbLabel}>{item.label}</span>
            </li>
          ))}
          <BreadcrumbSeparator data-measure="separator">{separator}</BreadcrumbSeparator>
          <li data-measure="ellipsis" className="flex">
            <Button variant="item" size="icon-sm" tabIndex={-1}>
              <Ellipsis />
            </Button>
          </li>
        </ol>
      </div>
    </Breadcrumb>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbTrail,
  type BreadcrumbCrumb,
  type BreadcrumbEllipsisProps,
  type BreadcrumbLinkRender,
  type BreadcrumbTrailProps,
};
