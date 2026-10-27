'use client';

import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu';
import { ArrowRight, Check, ChevronDown, Menu, Search, X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/registry/kosmos/ui/drawer';

type NavbarLink = {
  label: string;
  href: string;
  description?: string;
  /** A 14px icon in a small tile beside the label in a mega menu, and before it in the sheet. */
  icon?: React.ReactNode;
};
/** Links under one label: a dropdown in the bar, a titled list in the sheet. */
type NavbarGroup = { label: string; links: NavbarLink[] };
/** Titled columns of links under one label: a wide mega menu in the bar, a list per title in the sheet. */
type NavbarMegaMenu = { label: string; sections: { title: string; links: NavbarLink[] }[] };
type NavbarItem = NavbarLink | NavbarGroup | NavbarMegaMenu;
type NavbarLinkComponent = React.ElementType<React.ComponentProps<'a'> & { href: string }>;

// Sample data: replace it with your product's name, pages and actions.
const sampleName = 'Acme';
const sampleItems: NavbarItem[] = [
  {
    label: 'Product',
    links: [
      { label: 'Dashboards', href: '/features/dashboards', description: 'Charts of your events, shared with the whole team.' },
      { label: 'Funnels', href: '/features/funnels', description: 'See where users drop off between two steps.' },
      { label: 'Retention', href: '/features/retention', description: 'Cohorts of users who come back, week after week.' },
      { label: 'Alerts', href: '/features/alerts', description: 'A message when a number leaves its usual range.' },
    ],
  },
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Changelog', href: '/changelog' },
];
const sampleActions = (
  <>
    <Button variant="secondary" href="/login" className="@max-3xl:hidden">
      Sign in
    </Button>
    <Button variant="primary" href="/signup">
      Start for free
    </Button>
  </>
);
const sampleSheetActions = (
  <>
    <Button variant="secondary" size="lg" href="/login">
      Sign in
    </Button>
    <Button variant="primary" size="lg" href="/signup">
      Start for free
    </Button>
  </>
);

const isGroup = (item: NavbarItem): item is NavbarGroup => 'links' in item;
const isMega = (item: NavbarItem): item is NavbarMegaMenu => 'sections' in item;
const groupLinks = (item: NavbarGroup | NavbarMegaMenu) =>
  isMega(item) ? item.sections.flatMap((section) => section.links) : item.links;

/** Whether the page has scrolled at all, so the bar can show its bottom edge. */
function useScrolled() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return scrolled;
}

/** The edge the sheet opens from: the start edge, so it opens beside its button in either text direction. */
function useStartEdge(ref: React.RefObject<HTMLElement | null>) {
  const [edge, setEdge] = React.useState<'left' | 'right'>('left');
  React.useEffect(() => {
    if (ref.current && getComputedStyle(ref.current).direction === 'rtl') setEdge('right');
  }, [ref]);
  return edge;
}

/** The first letter of the product in a filled tile, until there is a logo. */
function NavbarMark({ name }: { name: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="flex size-6 items-center justify-center rounded-md border border-transparent bg-primary text-caption font-semibold text-primary-foreground shadow-primary"
    >
      {typeof name === 'string' ? name.trim().charAt(0).toUpperCase() : null}
    </span>
  );
}

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

// A nav item: the ghost look without the press scale, which dense rows of items skip.
const barItemClass = cn(
  'inline-flex h-7.5 shrink-0 items-center gap-1 rounded-lg border border-transparent px-3 text-body font-medium whitespace-nowrap text-muted-foreground',
  'transition-[background-color,color] hover:bg-accent hover:text-foreground',
  'aria-[current=page]:bg-accent aria-[current=page]:text-accent-text data-current:bg-accent data-current:text-accent-text',
  focusRing,
);

const sheetLinkClass = cn(
  'flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-body font-medium text-muted-foreground',
  'transition-[background-color,color] hover:bg-accent hover:text-foreground',
  'aria-[current=page]:bg-accent aria-[current=page]:text-accent-text',
  focusRing,
);

type NavbarLinksProps = {
  items: readonly NavbarItem[];
  current?: string;
  label: string;
  Link: NavbarLinkComponent;
};

type NavbarContainer = NavigationMenuPrimitive.Portal.Props['container'];
/** Pins the sheet in a preview: controlled `open`, `modal`, and where focus goes when it opens. */
type NavbarSheetProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  initialFocus?: React.ComponentProps<typeof DrawerContent>['initialFocus'];
};
/** Opens a dropdown by its group label, such as `{ value: 'Product' }` in a preview. */
type NavbarDropdownProps = Pick<NavigationMenuPrimitive.Root.Props<string>, 'value' | 'onValueChange'>;

/** One link in a dropdown or mega menu: an optional icon tile, the label with its check, and a line under it. */
function renderDropdownLink(link: NavbarLink, current: string | undefined, Link: NavbarLinkComponent) {
  return (
    <NavigationMenuPrimitive.Link
      active={link.href === current}
      closeOnClick
      render={<Link href={link.href} />}
      className={cn(
        'group/link flex gap-2.5 rounded-lg px-2.5 py-2 transition-[background-color] duration-instant hover:bg-accent aria-[current=page]:bg-accent',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
      )}
    >
      {link.icon ? (
        <span
          aria-hidden
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-transparent bg-secondary text-muted-foreground shadow-control [&_svg]:size-3.5"
        >
          {link.icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-body font-medium text-foreground group-aria-[current=page]/link:text-accent-text">
          {link.label}
          {link.href === current ? <Check aria-hidden className="ms-auto size-3.5 shrink-0" /> : null}
        </span>
        {link.description ? <span className="text-small text-pretty text-muted-foreground">{link.description}</span> : null}
      </span>
    </NavigationMenuPrimitive.Link>
  );
}

/** The links in the bar, from 768px wide: plain links and groups that open a dropdown on hover or click. */
function NavbarBarLinks({
  items,
  current,
  label,
  Link,
  container,
  dropdownProps,
  centered,
}: NavbarLinksProps & { container?: NavbarContainer; dropdownProps?: NavbarDropdownProps; centered?: boolean }) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navbar-nav"
      aria-label={label}
      className={cn('flex min-w-0 @max-3xl:hidden', centered ? 'shrink' : 'ms-3 flex-1')}
      {...dropdownProps}
    >
      <ScrollArea
        data-slot="navbar-scroll-area"
        focusable={false}
        className="min-w-0 rounded-none"
        // The list's own padding leaves the scrollbar room under the links, so they stay in line with the bar.
        viewportClassName="data-has-overflow-x:pb-0"
      >
        <NavigationMenuPrimitive.List className="flex w-max items-center gap-0.5 px-1 py-3">
          {items.map((item) => (
            <NavigationMenuPrimitive.Item key={item.label} value={item.label}>
              {isGroup(item) || isMega(item) ? (
                <>
                  <NavigationMenuPrimitive.Trigger
                    data-current={groupLinks(item).some((link) => link.href === current) ? '' : undefined}
                    className={cn(barItemClass, 'pe-2 data-popup-open:bg-accent data-popup-open:text-foreground')}
                  >
                    {item.label}
                    <NavigationMenuPrimitive.Icon
                      className={cn(
                        'flex size-3.5 items-center justify-center',
                        'transition-[rotate] duration-fast data-popup-open:duration-base motion-safe:data-popup-open:rotate-180',
                      )}
                    >
                      <ChevronDown aria-hidden className="size-3.5" />
                    </NavigationMenuPrimitive.Icon>
                  </NavigationMenuPrimitive.Trigger>
                  <NavigationMenuPrimitive.Content
                    keepMounted
                    className={cn(
                      'max-w-(--available-width) p-1 transition-[opacity] duration-base data-ending-style:opacity-0 data-ending-style:duration-fast data-starting-style:opacity-0',
                      isMega(item) ? 'w-176' : 'w-80',
                    )}
                  >
                    {isMega(item) ? (
                      <div
                        className="grid grid-cols-(--section-columns) gap-x-1"
                        style={{ '--section-columns': `repeat(${item.sections.length}, minmax(0, 1fr))` } as React.CSSProperties}
                      >
                        {item.sections.map((section) => (
                          <div key={section.title} className="flex flex-col gap-0.5">
                            <p className="px-2.5 pt-2 pb-1 text-caption text-muted-foreground">{section.title}</p>
                            <ul className="flex flex-col gap-0.5">
                              {section.links.map((link) => (
                                <li key={`${link.label}:${link.href}`}>{renderDropdownLink(link, current, Link)}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="flex flex-col gap-0.5">
                        {item.links.map((link) => (
                          <li key={`${link.label}:${link.href}`}>{renderDropdownLink(link, current, Link)}</li>
                        ))}
                      </ul>
                    )}
                  </NavigationMenuPrimitive.Content>
                </>
              ) : (
                <NavigationMenuPrimitive.Link
                  active={item.href === current}
                  render={<Link href={item.href} />}
                  className={barItemClass}
                >
                  {item.label}
                </NavigationMenuPrimitive.Link>
              )}
            </NavigationMenuPrimitive.Item>
          ))}
        </NavigationMenuPrimitive.List>
      </ScrollArea>
      <NavigationMenuPrimitive.Portal container={container}>
        <NavigationMenuPrimitive.Positioner
          sideOffset={8}
          collisionPadding={16}
          align="start"
          className={cn(
            'isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)',
            'motion-safe:transition-[top,left,right,bottom] motion-safe:duration-slow motion-safe:ease-smooth-in-out data-instant:transition-none',
          )}
        >
          <NavigationMenuPrimitive.Popup
            data-slot="navbar-popup"
            className={cn(
              'relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-xl border border-transparent bg-popover text-body text-popover-foreground shadow-popover outline-none dark:scheme-dark',
              'transition-[opacity] duration-base data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast',
              // Opening grows out of the trigger; moving to another dropdown resizes the popup to its content.
              'motion-safe:[transition:opacity_var(--transition-duration-base)_var(--ease-power3-out),scale_var(--transition-duration-base)_var(--ease-power3-out),width_var(--transition-duration-slow)_var(--ease-smooth-in-out),height_var(--transition-duration-slow)_var(--ease-smooth-in-out)]',
              'motion-safe:data-ending-style:[transition:opacity_var(--transition-duration-fast)_var(--ease-power3-out),scale_var(--transition-duration-fast)_var(--ease-power3-out)]',
              'motion-safe:data-starting-style:scale-[0.97] motion-safe:data-ending-style:scale-[0.97]',
            )}
          >
            <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden rounded-[inherit]" />
          </NavigationMenuPrimitive.Popup>
        </NavigationMenuPrimitive.Positioner>
      </NavigationMenuPrimitive.Portal>
    </NavigationMenuPrimitive.Root>
  );
}

/** The same links, in a list for the sheet: groups under their label. Following a link closes the sheet. */
function NavbarSheetLinks({ items, current, label, Link, onNavigate }: NavbarLinksProps & { onNavigate: () => void }) {
  const id = React.useId();
  const renderLink = (link: NavbarLink) => (
    <li key={`${link.label}:${link.href}`}>
      <Link
        href={link.href}
        aria-current={link.href === current ? 'page' : undefined}
        onClick={onNavigate}
        className={sheetLinkClass}
      >
        {link.icon ? (
          <span aria-hidden className="flex shrink-0 text-muted-foreground [&_svg]:size-4">
            {link.icon}
          </span>
        ) : null}
        <span className="truncate">{link.label}</span>
        {link.href === current ? <Check aria-hidden className="ms-auto size-4 shrink-0" /> : null}
      </Link>
    </li>
  );
  return (
    <nav data-slot="navbar-sheet-nav" aria-label={label}>
      <ul className="flex flex-col gap-0.5">
        {items.map((item, index) =>
          isMega(item) ? (
            <li key={item.label} className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
              <h3 className="px-2.5 pb-1 text-caption text-muted-foreground">{item.label}</h3>
              {item.sections.map((section, sectionIndex) => (
                <div key={section.title} className="flex flex-col gap-0.5">
                  <h4 id={`${id}-${index}-${sectionIndex}`} className="px-2.5 pt-1.5 pb-1 text-caption text-muted-foreground">
                    {section.title}
                  </h4>
                  <ul aria-labelledby={`${id}-${index}-${sectionIndex}`} className="flex flex-col gap-0.5">
                    {section.links.map(renderLink)}
                  </ul>
                </div>
              ))}
            </li>
          ) : isGroup(item) ? (
            <li key={item.label} className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
              <h3 id={`${id}-${index}`} className="px-2.5 pb-1 text-caption text-muted-foreground">
                {item.label}
              </h3>
              <ul aria-labelledby={`${id}-${index}`} className="flex flex-col gap-0.5">
                {item.links.map(renderLink)}
              </ul>
            </li>
          ) : (
            renderLink(item)
          ),
        )}
      </ul>
    </nav>
  );
}

type NavbarSearchProps = Omit<React.ComponentProps<'button'>, 'children'> & {
  /** The hint inside the trigger. */
  children?: React.ReactNode;
  /** Keys that open the search from the keyboard, shown as a hint, such as `['⌘', 'K']`. */
  shortcut?: string[];
};

/** A search field look-alike that opens a search, such as the command menu. Takes the width of its slot. */
function NavbarSearch({ children = 'Search…', shortcut, className, ...props }: NavbarSearchProps) {
  return (
    <Button
      variant="secondary"
      data-slot="navbar-search"
      aria-keyshortcuts={shortcut ? 'Meta+K Control+K' : undefined}
      className={cn('w-full justify-start ps-2.5 pe-1.5 font-normal text-muted-foreground', className)}
      {...props}
    >
      <Search aria-hidden />
      <span className="flex-1 truncate text-start">{children}</span>
      {shortcut ? (
        <KbdGroup aria-hidden>
          {shortcut.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </KbdGroup>
      ) : null}
    </Button>
  );
}

type NavbarBannerProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** One short line. The link, when there is one, wraps the whole line. */
  children: React.ReactNode;
  /** Where the line links. Leave it out for a line with no link. */
  href?: string;
  /** The label that follows the line, such as "Read more". */
  linkLabel?: string;
  /** Called when the banner is dismissed. Keep the choice (a cookie, local storage) and stop rendering it. */
  onDismiss?: () => void;
  /** The accessible name of the dismiss button. */
  dismissLabel?: string;
  linkComponent?: NavbarLinkComponent;
};

/** One line above the bar, with a link and a button that dismisses it. Pass it to `Navbar` as `banner`. */
function NavbarBanner({
  children,
  href,
  linkLabel,
  onDismiss,
  dismissLabel = 'Dismiss',
  linkComponent: Link = 'a',
  className,
  ...props
}: NavbarBannerProps) {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;
  const line = (
    <>
      <span className="min-w-0 line-clamp-2 text-pretty">{children}</span>
      {linkLabel ? (
        <span className="flex shrink-0 items-center gap-1 font-medium text-foreground">
          {linkLabel}
          <ArrowRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
        </span>
      ) : null}
    </>
  );
  return (
    <div
      data-slot="navbar-banner"
      className={cn('flex min-h-9 items-center gap-2 border-b border-border bg-muted py-1 ps-4 pe-2 text-small text-muted-foreground', className)}
      {...props}
    >
      <span className="size-6 shrink-0" aria-hidden />
      {href ? (
        <Link
          href={href}
          className={cn(
            'mx-auto flex min-w-0 items-center gap-2 rounded-md px-1 py-0.5 transition-[color] hover:text-foreground',
            focusRing,
          )}
        >
          {line}
        </Link>
      ) : (
        <span className="mx-auto flex min-w-0 items-center gap-2">{line}</span>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={dismissLabel}
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
      >
        <X aria-hidden />
      </Button>
    </div>
  );
}

type NavbarProps = React.ComponentProps<'header'> & {
  /** The product name beside the logo, linking to `homeHref`. */
  name?: React.ReactNode;
  /** Replaces the letter tile beside the name, usually with your logo. Decorative: the name names the link. */
  logo?: React.ReactNode;
  /** Where the name links. */
  homeHref?: string;
  /** Links, and groups of links that open a dropdown. */
  items?: readonly NavbarItem[];
  /** The `href` of the page being shown: its link, and the group that holds it, take the current-page color. */
  current?: string;
  /** Where the links sit: after the name (`start`) or in the middle of the bar (`center`). */
  layout?: 'start' | 'center';
  /** A search trigger, usually a `NavbarSearch`: in the bar from 768px wide, at the top of the sheet below it. */
  search?: React.ReactNode;
  /** A line above the bar, usually a `NavbarBanner`. It sticks with the bar. */
  banner?: React.ReactNode;
  /** The accessible name of the navigation landmark. */
  navLabel?: string;
  /** Buttons at the end of the bar, at every width. Hide one below the wide layout with `@max-3xl:hidden`. */
  actions?: React.ReactNode;
  /** Buttons at the bottom of the sheet, such as the actions the bar hides on a phone. */
  sheetActions?: React.ReactNode;
  /** Replaces the button that opens the sheet below 768px, such as with a button that opens your docs sidebar. */
  menu?: React.ReactNode;
  /** Spans the whole width instead of a centered 80rem column, so the logo lines up with a docked sidebar, and always shows the bottom edge the sidebar's divider meets. */
  fullWidth?: boolean;
  /** Renders the name and every link, such as your router's `Link`. Defaults to `<a>`. */
  linkComponent?: NavbarLinkComponent;
  /** Controls the sheet, such as `{ open: true, modal: false }` to pin it open in a preview. */
  sheetProps?: NavbarSheetProps;
  /** Controls which dropdown is open, by its group label. */
  dropdownProps?: NavbarDropdownProps;
  /** The element the sheet and the dropdowns render into. Defaults to `document.body`. */
  container?: NavbarContainer;
};

/**
 * The top of a marketing page: the product, its links and dropdowns, and actions at the end. Sticks to the top of the
 * window and shows its bottom edge once the page scrolls under it. Lays itself out by its own width: below 768px the
 * links move into a sheet that opens from the start edge.
 */
function Navbar({
  name = sampleName,
  logo,
  homeHref = '/',
  items = sampleItems,
  current,
  navLabel = 'Main',
  layout = 'start',
  search,
  banner,
  actions = sampleActions,
  sheetActions = sampleSheetActions,
  menu,
  fullWidth = false,
  linkComponent: Link = 'a',
  sheetProps,
  dropdownProps,
  container,
  className,
  ref,
  ...props
}: NavbarProps) {
  const headerRef = React.useRef<HTMLElement>(null);
  const scrolled = useScrolled();
  const startEdge = useStartEdge(headerRef);
  const [innerSheetOpen, setInnerSheetOpen] = React.useState(false);
  const sheetOpen = sheetProps?.open ?? innerSheetOpen;
  const setSheetOpen = (open: boolean) => {
    setInnerSheetOpen(open);
    sheetProps?.onOpenChange?.(open);
  };
  const hasSheet = items.length > 0 || Boolean(sheetActions) || Boolean(search);
  const centered = layout === 'center' && items.length > 0;

  return (
    <header
      ref={(node) => {
        headerRef.current = node;
        if (typeof ref === 'function') return ref(node);
        if (ref) ref.current = node;
      }}
      data-slot="navbar"
      data-scrolled={scrolled ? '' : undefined}
      className={cn(
        '@container sticky top-0 z-40 border-b border-transparent bg-background transition-[border-color] data-scrolled:border-border',
        fullWidth && 'border-border',
        className,
      )}
      {...props}
    >
      {banner}
      <div className={cn('mx-auto flex h-14 w-full items-center gap-1 px-4', !fullWidth && 'max-w-7xl @min-[40rem]:px-6')}>
        <div className={cn('flex min-w-0 items-center', centered && 'flex-1 basis-0')}>
          {menu ? (
            <div className="me-2 flex @3xl:hidden">{menu}</div>
          ) : hasSheet ? (
            <Drawer swipeDirection={startEdge} open={sheetOpen} onOpenChange={setSheetOpen} modal={sheetProps?.modal}>
              <DrawerTrigger
                render={<Button variant="secondary" size="icon" aria-label="Open menu" className="me-2 @3xl:hidden" />}
              >
                <Menu aria-hidden />
              </DrawerTrigger>
              <DrawerContent data-slot="navbar-sheet" container={container} initialFocus={sheetProps?.initialFocus}>
                <DrawerHeader>
                  <DrawerTitle className="flex items-center gap-2">
                    {logo ?? <NavbarMark name={name} />}
                    {name}
                  </DrawerTitle>
                </DrawerHeader>
                <DrawerBody>
                  {search ? (
                    <div className="mb-3" onClickCapture={() => setSheetOpen(false)}>
                      {search}
                    </div>
                  ) : null}
                  <NavbarSheetLinks
                    items={items}
                    current={current}
                    label={navLabel}
                    Link={Link}
                    onNavigate={() => setSheetOpen(false)}
                  />
                </DrawerBody>
                {sheetActions ? <DrawerFooter className="sm:flex-col-reverse sm:justify-start">{sheetActions}</DrawerFooter> : null}
              </DrawerContent>
            </Drawer>
          ) : null}
          <Link
            href={homeHref}
            className={cn(
              '-mx-1 flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 text-body font-semibold whitespace-nowrap text-foreground [&>:first-child]:shrink-0',
              focusRing,
            )}
          >
            {logo ?? <NavbarMark name={name} />}
            <span className="truncate">{name}</span>
          </Link>
        </div>
        {items.length > 0 ? (
          <NavbarBarLinks
            items={items}
            current={current}
            label={navLabel}
            Link={Link}
            container={container}
            dropdownProps={dropdownProps}
            centered={centered}
          />
        ) : null}
        {search || actions ? (
          <div className={cn('flex items-center justify-end gap-1.5', centered ? 'min-w-0 flex-1 basis-0' : 'ms-auto shrink-0')}>
            {search ? <div className="w-56 shrink-0 @max-3xl:hidden">{search}</div> : null}
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export {
  Navbar,
  NavbarBanner,
  NavbarSearch,
  type NavbarBannerProps,
  type NavbarDropdownProps,
  type NavbarGroup,
  type NavbarItem,
  type NavbarLink,
  type NavbarMegaMenu,
  type NavbarProps,
  type NavbarSearchProps,
  type NavbarSheetProps,
};
