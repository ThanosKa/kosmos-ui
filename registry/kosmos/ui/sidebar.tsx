'use client';

import { useDirection } from '@base-ui/react/direction-provider';
import { mergeProps } from '@base-ui/react/merge-props';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { useRender } from '@base-ui/react/use-render';
import { PanelLeftIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button, type ButtonProps } from '@/registry/kosmos/ui/button';
import { Drawer, DrawerContent, DrawerTitle } from '@/registry/kosmos/ui/drawer';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';
import { Separator } from '@/registry/kosmos/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider } from '@/registry/kosmos/ui/tooltip';

/** Below this viewport width (px) the sidebar leaves the layout and opens as a drawer from the left edge. */
const MOBILE_BREAKPOINT = 768;
/** Arrow keys resize by this much; with Shift, by four times as much. */
const KEYBOARD_STEP = 16;
/** The width of the icon column (px) a sidebar with `collapsible="icon"` collapses to. */
const ICON_WIDTH = 48;

/** Sets an item's tooltip 6px past the icon column's edge, which sits 9px beyond the item. */
const ICON_TOOLTIP_OFFSET = 15;

type SidebarCollapsible = 'offcanvas' | 'icon';

type SidebarContextValue = {
  /** Whether the sidebar shows next to the page (from `mobileBreakpoint` up). */
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Whether the drawer is open (below `mobileBreakpoint`). */
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  /** Opens or closes the sidebar, or the drawer on phones. */
  toggleSidebar: () => void;
  /** How the sidebar collapses, set by `Sidebar`: to the edge (`offcanvas`) or to a column of icons (`icon`). */
  collapsible: SidebarCollapsible;
  setCollapsible: (collapsible: SidebarCollapsible) => void;
  /** The local storage key that keeps the open state between visits, or `null` when nothing is kept. */
  storageKey: string | null;
  /** The key that toggles the sidebar with ⌘ or Ctrl, or `null` when the shortcut is off. */
  keyboardShortcut: string | null;
  isMobile: boolean;
  /** Whether `mobileBreakpoint` is the default 768px, which CSS also knows before hydration. */
  usesDefaultBreakpoint: boolean;
  /** The width in pixels while open. */
  width: number;
  setWidth: (width: number) => void;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  /** True while the resize handle is dragged or moved with the keyboard; the width follows without easing. */
  resizing: boolean;
  setResizing: (resizing: boolean) => void;
  sidebarId: string;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

/** The sidebar's state and setters. Use it inside `SidebarProvider`. */
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used inside a SidebarProvider.');
  return context;
}

function useIsMobile(breakpoint: number) {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** For values that never change after hydration: nothing to subscribe to. */
const subscribeNever = () => () => {};

/** False while the server renders and while the page hydrates, true after. */
function useHydrated() {
  return React.useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

/** Apple platforms show ⌘ for the shortcut, the rest Ctrl. The server renders ⌘. */
function useIsMac() {
  return React.useSyncExternalStore(
    subscribeNever,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => true,
  );
}

const storageListeners = new Set<() => void>();

function subscribeStorage(onChange: () => void) {
  storageListeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    storageListeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    return;
  }
  storageListeners.forEach((listener) => listener());
}

/** The open state saved under `key`: `true`, `false`, or `null` when nothing is saved or `key` is `null`. */
function useStoredOpen(key: string | null) {
  const stored = React.useSyncExternalStore(
    subscribeStorage,
    () => (key ? readStorage(key) : null),
    () => null,
  );
  return stored === 'expanded' ? true : stored === 'collapsed' ? false : null;
}

/**
 * Runs before the page paints, ahead of hydration: applies the saved state to the sidebar it sits in, so a
 * collapsed sidebar never flashes open. Arguments: the sidebar element, the storage key and the collapse mode.
 */
const restoreScript = (key: string, collapsible: SidebarCollapsible) =>
  `(function(e,k,m){try{var v=localStorage.getItem(k);if(v!=='expanded'&&v!=='collapsed')return;e.setAttribute('data-state',v);e.setAttribute('data-collapsible',v==='collapsed'?m:'')}catch(_){}})(document.currentScript.parentElement,${JSON.stringify(key)},${JSON.stringify(collapsible)})`;

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const current = value === undefined ? uncontrolled : value;
  const setValue = React.useCallback(
    (next: T) => {
      if (value === undefined) setUncontrolled(next);
      onChange?.(next);
    },
    [value, onChange],
  );
  return [current, setValue] as const;
}

type SidebarProviderProps = React.ComponentProps<'div'> & {
  /** Whether the sidebar starts open from `mobileBreakpoint` up. */
  defaultOpen?: boolean;
  /** Whether the sidebar is open from `mobileBreakpoint` up. Use with `onOpenChange`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The starting width in pixels. A double click on the resize handle returns to it. */
  defaultWidth?: number;
  /** The width in pixels. Use with `onWidthChange`, for example to save it. */
  width?: number;
  onWidthChange?: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  /** Below this viewport width in pixels the sidebar opens as a drawer instead. */
  mobileBreakpoint?: number;
  /**
   * The local storage key that keeps the open state between visits; `false` keeps nothing. Unused while `open` is
   * controlled. Give each sidebar on a page its own key.
   */
  storageKey?: string | false;
  /** The key that collapses and reopens the sidebar together with ⌘ (Ctrl on Windows and Linux); `false` turns it off. */
  keyboardShortcut?: string | false;
};

/**
 * Holds the sidebar's open state and width, and lays the sidebar and the page out side by side.
 * Wrap the whole app shell in it: `Sidebar`, `SidebarResizeHandle` and `SidebarInset`.
 */
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  defaultWidth = 256,
  width: widthProp,
  onWidthChange,
  minWidth = 208,
  maxWidth = 384,
  mobileBreakpoint = MOBILE_BREAKPOINT,
  storageKey: storageKeyProp = 'sidebar-state',
  keyboardShortcut: keyboardShortcutProp = 'b',
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile(mobileBreakpoint);
  const usesDefaultBreakpoint = mobileBreakpoint === MOBILE_BREAKPOINT;
  const storageKey = openProp === undefined && storageKeyProp !== false ? storageKeyProp : null;
  const keyboardShortcut = keyboardShortcutProp === false ? null : keyboardShortcutProp.toLowerCase();
  const storedOpen = useStoredOpen(storageKey);
  const [openState, setOpenState] = useControllable(openProp, defaultOpen, onOpenChange);
  const open = openProp === undefined && storedOpen !== null ? storedOpen : openState;
  const [width, setWidthState] = useControllable(widthProp, defaultWidth, onWidthChange);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [resizing, setResizing] = React.useState(false);
  const [collapsible, setCollapsible] = React.useState<SidebarCollapsible>('offcanvas');
  const sidebarId = React.useId();

  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (storageKey) writeStorage(storageKey, next ? 'expanded' : 'collapsed');
    },
    [setOpenState, storageKey],
  );

  const setWidth = React.useCallback(
    (next: number) => setWidthState(Math.round(Math.min(maxWidth, Math.max(minWidth, next)))),
    [setWidthState, minWidth, maxWidth],
  );
  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((value) => !value);
    else setOpen(!open);
  }, [isMobile, open, setOpen]);

  React.useEffect(() => {
    if (!keyboardShortcut) return;
    function onKeyDown(event: KeyboardEvent) {
      // Ctrl+B on a Mac moves the caret back in a text field, so there only ⌘ counts.
      const modifier = /Mac|iPhone|iPad/.test(navigator.userAgent) ? event.metaKey : event.ctrlKey;
      if (event.key.toLowerCase() !== keyboardShortcut || !modifier || event.altKey || event.shiftKey) return;
      // ⌘B is bold in a rich text editor.
      if (event.defaultPrevented || (event.target instanceof HTMLElement && event.target.isContentEditable)) return;
      event.preventDefault();
      toggleSidebar();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keyboardShortcut, toggleSidebar]);

  const context = React.useMemo<SidebarContextValue>(
    () => ({
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      collapsible,
      setCollapsible,
      storageKey,
      keyboardShortcut,
      isMobile,
      usesDefaultBreakpoint,
      width,
      setWidth,
      defaultWidth,
      minWidth,
      maxWidth,
      resizing,
      setResizing,
      sidebarId,
    }),
    [
      open,
      setOpen,
      openMobile,
      toggleSidebar,
      collapsible,
      storageKey,
      keyboardShortcut,
      isMobile,
      usesDefaultBreakpoint,
      width,
      setWidth,
      defaultWidth,
      minWidth,
      maxWidth,
      resizing,
      sidebarId,
    ],
  );

  return (
    <SidebarContext.Provider value={context}>
      <div
        data-slot="sidebar-wrapper"
        data-resizing={resizing ? '' : undefined}
        style={{ '--sidebar-width': `${width}px`, '--sidebar-width-icon': `${ICON_WIDTH}px`, ...style } as React.CSSProperties}
        className={cn(
          'group/sidebar-wrapper flex min-h-svh w-full bg-background text-foreground data-resizing:cursor-col-resize data-resizing:select-none',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarProps = React.ComponentProps<'div'> & {
  /** The drawer's accessible name on phones, where the sidebar opens as a dialog. */
  label?: string;
  /** How the sidebar collapses: to the edge (`offcanvas`), or to a column of icons that name their item in a tooltip (`icon`). */
  collapsible?: SidebarCollapsible;
};

/**
 * The sidebar surface. From `mobileBreakpoint` (768px) up it sits next to the page, sticks to the top while the page scrolls
 * and collapses to the left edge, or to a column of icons with `collapsible="icon"`; below it, it opens as a drawer from
 * the left edge. Fill it with `SidebarHeader`, `SidebarContent` and `SidebarFooter`.
 */
function Sidebar({ className, children, label = 'Sidebar', collapsible = 'offcanvas', ...props }: SidebarProps) {
  const { isMobile, usesDefaultBreakpoint, open, openMobile, setOpenMobile, setCollapsible, storageKey, sidebarId } = useSidebar();
  const hydrated = useHydrated();
  // The drawer opens from the side the sidebar sits on: the right edge in a right-to-left layout.
  const side = useDirection() === 'rtl' ? 'right' : 'left';

  React.useLayoutEffect(() => setCollapsible(collapsible), [collapsible, setCollapsible]);

  if (isMobile) {
    return (
      <Drawer open={openMobile} onOpenChange={setOpenMobile} swipeDirection={side}>
        <DrawerContent
          id={sidebarId}
          showCloseButton={false}
          className={cn(
            'bg-sidebar text-sidebar-foreground',
            'data-[swipe-direction=left]:w-72 data-[swipe-direction=left]:max-w-[calc(100%-1rem)] sm:data-[swipe-direction=left]:w-72',
            'data-[swipe-direction=right]:w-72 data-[swipe-direction=right]:max-w-[calc(100%-1rem)] sm:data-[swipe-direction=right]:w-72',
          )}
        >
          <DrawerTitle className="sr-only">{label}</DrawerTitle>
          <div data-slot="sidebar" data-mobile="" className={cn('flex min-h-0 flex-1 flex-col', className)} {...props}>
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      data-slot="sidebar"
      data-state={open ? 'expanded' : 'collapsed'}
      data-collapsible={open ? '' : collapsible}
      // The restore script below may already have set the saved state on this element.
      suppressHydrationWarning
      className={cn(
        'group/sidebar relative w-(--sidebar-width) shrink-0 data-[collapsible=icon]:w-(--sidebar-width-icon) data-[collapsible=offcanvas]:w-0',
        // Hidden on phones before hydration too, so the page never flashes the side-by-side layout.
        usesDefaultBreakpoint && 'max-md:hidden',
        // Collapse and expand: the width eases. Under reduced motion the panel (or the labels, in icon mode) fades
        // out before the width changes, and fades in after. Resizing follows the pointer.
        'motion-safe:transition-[width] motion-safe:duration-slow motion-safe:ease-smooth-in-out',
        'motion-reduce:[transition:opacity_var(--transition-duration-fast)_var(--ease-power3-out),width_0s] motion-reduce:data-[collapsible=offcanvas]:opacity-0',
        'motion-reduce:data-[state=collapsed]:[transition:opacity_var(--transition-duration-fast)_var(--ease-power3-out),width_0s_var(--transition-duration-fast)]',
        'group-data-resizing/sidebar-wrapper:transition-none',
      )}
    >
      {storageKey && !hydrated ? <script dangerouslySetInnerHTML={{ __html: restoreScript(storageKey, collapsible) }} /> : null}
      <div
        data-slot="sidebar-inner"
        className="sticky top-0 h-svh max-h-full overflow-hidden border-e border-sidebar-border bg-sidebar text-sidebar-foreground group-data-[collapsible=offcanvas]/sidebar:border-e-0"
      >
        <div
          inert={!open && collapsible === 'offcanvas'}
          className={cn('flex h-full flex-col', collapsible === 'icon' ? 'w-full' : 'w-(--sidebar-width)', className)}
          {...props}
          id={sidebarId}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </div>
      </div>
    </div>
  );
}

/**
 * The drag handle on the sidebar's edge, a window splitter: drag it, or focus it and use the arrow keys
 * (Shift for bigger steps), Home and End. Enter collapses and reopens the sidebar; a double click returns
 * to the default width. Dragging below halfway between the collapsed width and the minimum width collapses it.
 * Place it between `Sidebar` and `SidebarInset`. It is not rendered on phones.
 */
function SidebarResizeHandle({ className, ...props }: React.ComponentProps<'div'>) {
  const {
    isMobile,
    usesDefaultBreakpoint,
    open,
    setOpen,
    width,
    setWidth,
    defaultWidth,
    minWidth,
    maxWidth,
    setResizing,
    collapsible,
    sidebarId,
  } = useSidebar();
  const collapsedWidth = collapsible === 'icon' ? ICON_WIDTH : 0;
  const drag = React.useRef<{ startX: number; startWidth: number; direction: number } | null>(null);
  const [dragging, setDragging] = React.useState(false);

  if (isMobile) return null;

  const direction = (element: HTMLElement) => (getComputedStyle(element).direction === 'rtl' ? -1 : 1);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    drag.current = { startX: event.clientX, startWidth: open ? width : collapsedWidth, direction: direction(event.currentTarget) };
    setDragging(true);
    setResizing(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const next = drag.current.startWidth + (event.clientX - drag.current.startX) * drag.current.direction;
    if (next < (collapsedWidth + minWidth) / 2) {
      if (open) setOpen(false);
      return;
    }
    if (!open) setOpen(true);
    setWidth(next);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
    setDragging(false);
    setResizing(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? KEYBOARD_STEP * 4 : KEYBOARD_STEP;
    const sign = direction(event.currentTarget);
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = width + step * sign;
    else if (event.key === 'ArrowLeft') next = width - step * sign;
    else if (event.key === 'Home') next = minWidth;
    else if (event.key === 'End') next = maxWidth;
    else if (event.key === 'Enter') {
      event.preventDefault();
      setOpen(!open);
      return;
    } else return;
    event.preventDefault();
    setResizing(true);
    if (!open) {
      // A collapsed sidebar reopens on Home, End or an arrow pointing outward.
      if (next <= width && event.key !== 'Home' && event.key !== 'End') return;
      setOpen(true);
    }
    setWidth(next);
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-controls={sidebarId}
      aria-label="Resize sidebar"
      aria-valuenow={open ? width : collapsedWidth}
      aria-valuemin={collapsedWidth}
      aria-valuemax={maxWidth}
      aria-valuetext={open ? `${width} pixels` : collapsible === 'icon' ? 'Collapsed to icons' : 'Collapsed'}
      data-slot="sidebar-resize-handle"
      data-state={open ? 'expanded' : 'collapsed'}
      data-dragging={dragging ? '' : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onKeyUp={() => setResizing(false)}
      onBlur={() => setResizing(false)}
      onDoubleClick={() => {
        setOpen(true);
        setWidth(defaultWidth);
      }}
      className={cn(
        'relative z-20 w-0 shrink-0 cursor-col-resize touch-none self-stretch',
        usesDefaultBreakpoint && 'max-md:hidden',
        'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring',
        // The hit area: 8px wide, centered on the sidebar's edge.
        'before:absolute before:inset-y-0 before:-start-1 before:w-2',
        // The line that shows on hover and while dragging; focus draws the outline instead.
        'after:pointer-events-none after:absolute after:inset-y-0 after:-start-px after:w-0.5 after:bg-transparent after:transition-[background-color]',
        'hover:after:bg-sidebar-foreground/20 data-dragging:after:bg-sidebar-foreground/20',
        className,
      )}
      {...props}
    />
  );
}

type SidebarTriggerProps = Omit<Extract<ButtonProps, { href?: undefined }>, 'variant' | 'size'>;

/** Opens and closes the sidebar, or the drawer on phones. Its tooltip names the keyboard shortcut. */
function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { toggleSidebar, isMobile, open, openMobile, keyboardShortcut, sidebarId } = useSidebar();
  const isMac = useIsMac();
  const key = keyboardShortcut?.toUpperCase();
  return (
    <Tooltip>
      <TooltipPrimitive.Trigger
        render={
          <Button
            variant="secondary"
            size="icon"
            data-slot="sidebar-trigger"
            aria-label="Toggle sidebar"
            aria-expanded={isMobile ? openMobile : open}
            aria-controls={isMobile && !openMobile ? undefined : sidebarId}
            aria-keyshortcuts={key ? `${isMac ? 'Meta' : 'Control'}+${key}` : undefined}
            className={className}
            onClick={(event) => {
              onClick?.(event);
              toggleSidebar();
            }}
            {...props}
          >
            <PanelLeftIcon aria-hidden />
          </Button>
        }
      />
      <TooltipContent side="bottom" className={cn(key && 'flex items-center gap-2 pe-1')}>
        Toggle sidebar
        {key ? (
          <KbdGroup>
            <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
            <Kbd>{key}</Kbd>
          </KbdGroup>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

/** The page next to the sidebar. Renders `<main>`; pass `render={<div />}` when the page already has one. */
function SidebarInset({ className, render, ...props }: useRender.ComponentProps<'main'>) {
  return useRender({
    defaultTagName: 'main',
    render,
    props: mergeProps<'main'>({ className: cn('relative flex min-w-0 flex-1 flex-col bg-background', className) }, props),
    state: { slot: 'sidebar-inset' },
  });
}

/** The top of the sidebar, for the workspace or product name. Stays put while the content scrolls. */
function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn('flex shrink-0 flex-col gap-2 border-b border-sidebar-border p-2', className)}
      {...props}
    />
  );
}

/** The bottom of the sidebar, for the account or help links. Stays put while the content scrolls. */
function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn('mt-auto flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-2', className)}
      {...props}
    />
  );
}

/** The scrolling middle of the sidebar, holding the groups. Render it as `<nav>` with `render={<nav aria-label="Main" />}`. */
function SidebarContent({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      { className: cn('flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain', className) },
      props,
    ),
    state: { slot: 'sidebar-content' },
  });
}

/** A line between the header, groups and footer. */
function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      className={cn('mx-2 border-sidebar-border data-[orientation=horizontal]:w-auto', className)}
      {...props}
    />
  );
}

/** A labelled section of the sidebar: a `SidebarGroupLabel` and a `SidebarMenu`. */
function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn('flex w-full min-w-0 flex-col px-2 py-3 not-first:border-t not-first:border-sidebar-border', className)}
      {...props}
    />
  );
}

/** The small heading of a group. Render it as a heading with `render={<h2 />}` when the page outline needs one. */
function SidebarGroupLabel({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      {
        className: cn(
          'flex h-6 shrink-0 items-center truncate px-2 text-caption font-medium tracking-[0.05em] text-muted-foreground uppercase',
          // In icon mode the label fades but keeps its row, so the icons below it never move.
          'transition-[opacity] group-data-[collapsible=icon]/sidebar:opacity-0',
          className,
        ),
      },
      props,
    ),
    state: { slot: 'sidebar-group-label' },
  });
}

/** The list of items in a group. Renders `<ul>`. */
function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot="sidebar-menu" className={cn('flex w-full min-w-0 flex-col gap-0.5', className)} {...props} />;
}

/** One entry of a `SidebarMenu`. Renders `<li>`. */
function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="sidebar-menu-item" className={cn('group/menu-item relative', className)} {...props} />;
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type SidebarMenuButtonProps = DistributiveOmit<ButtonProps, 'variant' | 'size'> & {
  /** Marks the current page: `aria-current="page"` on a link, a raised highlight and an orange label and icon. */
  isActive?: boolean;
  /** The item's name, shown in a tooltip beside the icon while the sidebar is collapsed to icons. */
  tooltip?: React.ReactNode;
};

/**
 * The clickable row of an item: a Button with `href` for a page, without it for an action.
 * Put an icon first and the label in a `<span>`, which truncates. On phones a link closes the drawer.
 * In icon mode only the icon shows, and `tooltip` names the item.
 */
function SidebarMenuButton({ isActive = false, tooltip, className, ...props }: SidebarMenuButtonProps) {
  const sidebar = React.useContext(SidebarContext);
  const isLink = props.href !== undefined;
  const { onClickCapture } = props as { onClickCapture?: (event: React.MouseEvent<HTMLElement>) => void };
  const button = (
    <Button
      variant="item"
      size="md"
      data-slot="sidebar-menu-button"
      data-active={isActive ? '' : undefined}
      aria-current={isActive ? (isLink ? 'page' : 'true') : undefined}
      className={cn(
        'h-7.5 w-full min-w-0 justify-start gap-2 overflow-hidden px-2 text-muted-foreground',
        'transition-[background-color,color,box-shadow] hover:not-data-disabled:bg-sidebar-accent hover:not-data-disabled:text-sidebar-foreground',
        'data-active:bg-secondary data-active:text-active-foreground data-active:shadow-control hover:data-active:not-data-disabled:bg-secondary hover:data-active:not-data-disabled:text-active-foreground',
        '[&>span]:min-w-0 [&>span]:truncate [&_svg]:text-muted-foreground data-active:[&_svg]:text-active-foreground',
        '[&>span]:transition-[opacity] group-data-[collapsible=icon]/sidebar:[&>span]:opacity-0',
        className,
      )}
      {...props}
      onClickCapture={(event: React.MouseEvent<HTMLElement>) => {
        onClickCapture?.(event);
        if (isLink && sidebar?.isMobile) sidebar.setOpenMobile(false);
      }}
    />
  );
  if (tooltip === undefined) return button;
  const iconsOnly = sidebar !== null && !sidebar.isMobile && !sidebar.open && sidebar.collapsible === 'icon';
  return (
    <Tooltip disabled={!iconsOnly}>
      <TooltipPrimitive.Trigger render={button} />
      <TooltipContent side="inline-end" sideOffset={ICON_TOOLTIP_OFFSET}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/** A count at the end of an item, like unread messages. Place it last inside `SidebarMenuButton`. */
function SidebarMenuBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="sidebar-menu-badge"
      className={cn(
        'ms-auto inline-flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full border border-input bg-muted px-1.5 text-caption leading-none font-medium text-muted-foreground tabular-nums',
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarResizeHandle,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  type SidebarCollapsible,
  type SidebarMenuButtonProps,
  type SidebarTriggerProps,
  type SidebarProps,
  type SidebarProviderProps,
};
