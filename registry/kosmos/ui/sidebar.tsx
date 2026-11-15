'use client';

import { useDirection } from '@base-ui/react/direction-provider';
import { mergeProps } from '@base-ui/react/merge-props';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { useRender } from '@base-ui/react/use-render';
import { ChevronDown, ChevronRight, ChevronsUpDown, PanelLeftIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Button, type ButtonProps } from '@/registry/kosmos/ui/button';
import { Collapsible, CollapsibleContent } from '@/registry/kosmos/ui/collapsible';
import { Drawer, DrawerContent, DrawerTitle } from '@/registry/kosmos/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';
import { ScrollArea, type ScrollAreaProps } from '@/registry/kosmos/ui/scroll-area';
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
  setOpenInstantly: (open: boolean) => void;
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

/**
 * Runs after the sidebar's panel is parsed, ahead of hydration: makes the panel of a sidebar collapsed off canvas
 * inert, reading the state the restore script set, so its hidden links take no focus.
 */
const inertScript =
  "(function(e){e.previousElementSibling.firstElementChild.inert=e.parentElement.getAttribute('data-collapsible')==='offcanvas'})(document.currentScript)";

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
  /**
   * The key that collapses and reopens the sidebar beside the page together with ⌘ (Ctrl on Windows and Linux); it
   * does nothing to the phone drawer. `false` turns it off.
   */
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
  const [snapping, setSnapping] = React.useState(false);
  const [collapsible, setCollapsible] = React.useState<SidebarCollapsible>('offcanvas');
  const sidebarId = React.useId();

  const setOpen = React.useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (storageKey) writeStorage(storageKey, next ? 'expanded' : 'collapsed');
    },
    [setOpenState, storageKey],
  );

  const setOpenInstantly = React.useCallback(
    (next: boolean) => {
      setSnapping(true);
      setOpen(next);
      requestAnimationFrame(() => requestAnimationFrame(() => setSnapping(false)));
    },
    [setOpen],
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
    if (!keyboardShortcut || isMobile) return;
    function onKeyDown(event: KeyboardEvent) {
      // Ctrl+B on a Mac moves the caret back in a text field, so there only ⌘ counts.
      const modifier = /Mac|iPhone|iPad/.test(navigator.userAgent) ? event.metaKey : event.ctrlKey;
      if (event.key.toLowerCase() !== keyboardShortcut || !modifier || event.altKey || event.shiftKey) return;
      // ⌘B is bold in a rich text editor.
      if (event.defaultPrevented || (event.target instanceof HTMLElement && event.target.isContentEditable)) return;
      event.preventDefault();
      setOpenInstantly(!open);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keyboardShortcut, isMobile, open, setOpenInstantly]);

  const context = React.useMemo<SidebarContextValue>(
    () => ({
      open,
      setOpen,
      setOpenInstantly,
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
      setOpenInstantly,
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
        data-snapping={snapping ? '' : undefined}
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
        'group-data-resizing/sidebar-wrapper:transition-none group-data-snapping/sidebar-wrapper:transition-none',
      )}
    >
      {storageKey && !hydrated ? <script dangerouslySetInnerHTML={{ __html: restoreScript(storageKey, collapsible) }} /> : null}
      <div
        data-slot="sidebar-inner"
        className="sticky top-0 h-svh max-h-full overflow-hidden border-e border-sidebar-border bg-sidebar text-sidebar-foreground group-data-[collapsible=offcanvas]/sidebar:border-e-0"
      >
        <div
          inert={!open && collapsible === 'offcanvas'}
          // The inert script below may already have set `inert` on this element.
          suppressHydrationWarning
          className={cn('flex h-full flex-col', collapsible === 'icon' ? 'w-full' : 'w-(--sidebar-width)', className)}
          {...props}
          id={sidebarId}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </div>
      </div>
      {storageKey && !hydrated ? <script dangerouslySetInnerHTML={{ __html: inertScript }} /> : null}
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
    setOpenInstantly,
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
      setOpenInstantly(!open);
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
  const key = isMobile ? undefined : keyboardShortcut?.toUpperCase();
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

/** The bottom of the sidebar, for the user menu or help links. Stays put while the content scrolls. */
function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn('mt-auto flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-2', className)}
      {...props}
    />
  );
}

/**
 * The scrolling middle of the sidebar, holding the groups. It scrolls in a `ScrollArea`, so an edge with groups hidden
 * past it fades out. `render` and the other props go to the element that scrolls: `render={<nav aria-label="Main" />}`.
 */
function SidebarContent({
  className,
  render = <div />,
  children,
  ...props
}: React.ComponentProps<'div'> & { render?: ScrollAreaProps['viewportRender'] }) {
  const viewportRender: ScrollAreaProps['viewportRender'] =
    typeof render === 'function'
      ? (viewportProps, state) => render(mergeProps<'div'>(viewportProps, props), state)
      : React.cloneElement(render, props);
  return (
    <ScrollArea
      data-slot="sidebar-content"
      // Every item takes focus and scrolls itself into view, so the list needs no tab stop of its own.
      focusable={false}
      // The 48px icon column has no room for a scrollbar beside the items, so there the edge fade alone marks the overflow.
      className="min-h-0 flex-1 rounded-none group-data-[collapsible=icon]/sidebar:[&>[data-slot=scroll-area-scrollbar]]:hidden"
      viewportClassName={cn(
        'overscroll-contain',
        // The icon column has no room for the scrollbar's gutter, and its labels must not widen the content.
        'group-data-[collapsible=icon]/sidebar:data-has-overflow-y:pe-0 [&>[data-slot=scroll-area-content]]:min-w-0!',
        className,
      )}
      viewportRender={viewportRender}
    >
      {children}
    </ScrollArea>
  );
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
          'flex h-6 shrink-0 items-center truncate px-2 text-caption tracking-[0.08em] text-muted-foreground uppercase',
          // In icon mode the label fades but keeps its row, so the icons below it never move. On expand it waits
          // for the column to widen, so it never shows as a cut-off stub.
          'transition-[opacity] group-data-[collapsible=icon]/sidebar:opacity-0 group-data-snapping/sidebar-wrapper:transition-none',
          'motion-safe:group-data-[state=expanded]/sidebar:delay-(--transition-duration-fast) group-data-snapping/sidebar-wrapper:delay-0',
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
  /** Marks the current page: `aria-current="page"` on a link, a highlight (flat in light, raised in dark) and the label and icon in `accent-text`. */
  isActive?: boolean;
  /** The item's name, shown in a tooltip beside the icon while the sidebar is collapsed to icons. */
  tooltip?: React.ReactNode;
};

/** Whether the sidebar is collapsed to its column of icons beside the page. */
function useIconsOnly() {
  const sidebar = React.useContext(SidebarContext);
  return sidebar !== null && !sidebar.isMobile && !sidebar.open && sidebar.collapsible === 'icon';
}

/**
 * The clickable row of an item: a Button with `href` for a page, without it for an action.
 * Put an icon first and the label in a `<span>`, which truncates. On phones a link closes the drawer.
 * In icon mode only the icon shows, and `tooltip` names the item.
 */
function SidebarMenuButton({ isActive = false, tooltip, className, ...props }: SidebarMenuButtonProps) {
  const sidebar = React.useContext(SidebarContext);
  const iconsOnly = useIconsOnly();
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
        // `relative` keeps an `sr-only` count label inside the clip, so it never widens the sidebar.
        'relative h-7.5 w-full min-w-0 justify-start gap-2 overflow-hidden rounded-[calc(var(--radius-lg)-4px)] px-2 font-normal text-muted-foreground',
        'transition-[background-color,color,box-shadow] hover:not-data-disabled:bg-sidebar-accent hover:not-data-disabled:text-sidebar-foreground',
        'data-active:bg-sidebar-accent data-active:text-accent-text hover:data-active:not-data-disabled:bg-sidebar-accent hover:data-active:not-data-disabled:text-accent-text',
        'dark:data-active:bg-muted dark:data-active:shadow-control dark:hover:data-active:not-data-disabled:bg-muted',
        '[&>span]:min-w-0 [&>span]:truncate [&_svg]:text-muted-foreground data-active:[&_svg]:text-accent-text',
        // In icon mode the first child (an icon, a mark or an avatar) stays and the label and count after it fade.
        // On expand they wait for the column to widen, so they never show as cut-off stubs.
        '[&>span]:transition-[opacity] group-data-[collapsible=icon]/sidebar:[&>span:not(:first-child)]:opacity-0',
        'motion-safe:group-data-[state=expanded]/sidebar:[&>span]:delay-(--transition-duration-fast) group-data-snapping/sidebar-wrapper:[&>span]:transition-none group-data-snapping/sidebar-wrapper:[&>span]:delay-0',
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

type SidebarSubmenuContextValue = {
  /** Whether the panel under the trigger is open, beside the page and in the drawer. */
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Whether the popover is open, in icon mode. */
  popoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
  iconsOnly: boolean;
  label: React.ReactNode;
  panelId: string;
};

const SidebarSubmenuContext = React.createContext<SidebarSubmenuContextValue | null>(null);

function useSidebarSubmenu() {
  const context = React.useContext(SidebarSubmenuContext);
  if (!context) throw new Error('SidebarSubmenu parts must be used inside a SidebarSubmenu.');
  return context;
}

/** True inside the popover a submenu opens in icon mode. */
const SidebarSubmenuPopupContext = React.createContext(false);

type SidebarSubmenuProps = {
  /** The submenu's name, the heading of its popover in icon mode. Usually the trigger's label. */
  label: React.ReactNode;
  /** Whether the panel starts open. */
  defaultOpen?: boolean;
  /** Whether the panel is open. Use with `onOpenChange`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Whether the popover is open in icon mode. Use with `onPopoverOpenChange`. */
  popoverOpen?: boolean;
  onPopoverOpenChange?: (open: boolean) => void;
  className?: string;
  children?: React.ReactNode;
};

/**
 * One item that holds a level of pages under it: a `SidebarSubmenuTrigger` and a `SidebarSubmenuContent`. Place it
 * inside a `SidebarMenuItem`. Beside the page and in the drawer the pages open in a panel under the trigger; in icon
 * mode the panel closes and the pages open in a popover beside the icon, on hover or on click.
 */
function SidebarSubmenu({
  label,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  popoverOpen: popoverOpenProp,
  onPopoverOpenChange,
  className,
  children,
}: SidebarSubmenuProps) {
  const iconsOnly = useIconsOnly();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [popoverOpenState, setPopoverOpen] = useControllable(popoverOpenProp, false, onPopoverOpenChange);
  const popoverOpen = iconsOnly && popoverOpenState;
  // Expanding the sidebar closes the popover for good, so the next collapse does not bring it back.
  React.useEffect(() => {
    if (!iconsOnly && popoverOpenState) setPopoverOpen(false);
  }, [iconsOnly, popoverOpenState, setPopoverOpen]);
  const panelId = React.useId();
  const context = React.useMemo<SidebarSubmenuContextValue>(
    () => ({ open, setOpen, popoverOpen, setPopoverOpen, iconsOnly, label, panelId }),
    [open, setOpen, popoverOpen, setPopoverOpen, iconsOnly, label, panelId],
  );
  return (
    <SidebarSubmenuContext.Provider value={context}>
      <PopoverPrimitive.Root
        open={popoverOpen}
        onOpenChange={(next) => {
          if (iconsOnly || !next) setPopoverOpen(next);
        }}
      >
        <Collapsible
          data-slot="sidebar-submenu"
          open={open && !iconsOnly}
          onOpenChange={(next) => {
            if (!iconsOnly) setOpen(next);
          }}
          className={className}
        >
          {children}
        </Collapsible>
      </PopoverPrimitive.Root>
    </SidebarSubmenuContext.Provider>
  );
}

type SidebarSubmenuTriggerProps = Omit<Extract<ButtonProps, { href?: undefined }>, 'variant' | 'size'> & {
  /**
   * Marks the submenu that holds the current page. The trigger takes the current page's highlight while the page is
   * out of sight: while the panel is closed, and in icon mode.
   */
  isActive?: boolean;
};

/**
 * The row that opens and closes a submenu. Put an icon first and the label in a `<span>`, as in `SidebarMenuButton`;
 * the chevron comes last by itself. In icon mode only the icon shows, and it opens the popover.
 */
function SidebarSubmenuTrigger({ isActive = false, className, children, onClick, ...props }: SidebarSubmenuTriggerProps) {
  const { open, setOpen, iconsOnly, panelId } = useSidebarSubmenu();
  const panelOpen = open && !iconsOnly;
  // Beside the page the trigger discloses the panel, so it describes the panel instead of the popover.
  const disclosure = iconsOnly ? {} : { 'aria-haspopup': undefined, 'aria-expanded': panelOpen, 'aria-controls': panelId };
  return (
    <PopoverPrimitive.Trigger
      openOnHover={iconsOnly}
      {...disclosure}
      render={
        <SidebarMenuButton
          data-slot="sidebar-submenu-trigger"
          data-active={isActive && !panelOpen ? '' : undefined}
          aria-current={isActive && !panelOpen ? 'true' : undefined}
          data-panel-open={panelOpen ? '' : undefined}
          className={cn('group/submenu-trigger data-popup-open:bg-sidebar-accent', className)}
          onClick={(event: Parameters<NonNullable<typeof onClick>>[0]) => {
            onClick?.(event);
            if (!iconsOnly && !event.defaultPrevented) setOpen(!open);
          }}
          {...props}
        />
      }
    >
      {children}
      {/* Turns as the panel opens; under reduced motion the right and down chevrons cross-fade instead. */}
      <span aria-hidden className="relative ms-auto -me-0.5 size-3.5 shrink-0 *:absolute *:inset-0">
        <ChevronRight
          className={cn(
            'transition-[rotate,opacity] duration-fast ease-power3-out rtl:rotate-180 group-data-panel-open/submenu-trigger:duration-slow',
            'motion-safe:group-data-panel-open/submenu-trigger:rotate-90 motion-safe:group-data-panel-open/submenu-trigger:ease-smooth-in-out',
            'motion-reduce:group-data-panel-open/submenu-trigger:opacity-0',
          )}
        />
        <ChevronDown className="opacity-0 transition-[opacity] duration-fast motion-reduce:group-data-panel-open/submenu-trigger:opacity-100" />
      </span>
    </PopoverPrimitive.Trigger>
  );
}

type SidebarSubmenuContentProps = React.ComponentProps<'ul'> & {
  /** The element the popover renders into in icon mode. Defaults to `document.body`. */
  container?: PopoverPrimitive.Portal.Props['container'];
};

/**
 * The pages of a submenu, `SidebarSubmenuItem`s. Renders `<ul>`: in a panel under the trigger that grows open, or in
 * icon mode in a popover beside the icon, under the submenu's `label`.
 */
function SidebarSubmenuContent({ className, children, container, id, ...props }: SidebarSubmenuContentProps) {
  const { label, panelId } = useSidebarSubmenu();
  return (
    <>
      <CollapsibleContent id={panelId} hiddenUntilFound>
        <ul
          id={id}
          data-slot="sidebar-submenu-content"
          // Indented so the pages' labels line up with the trigger's label, past its icon.
          className={cn('flex w-full min-w-0 flex-col gap-0.5 ps-5.5 pt-0.5', className)}
          {...props}
        >
          {children}
        </ul>
      </CollapsibleContent>
      <PopoverPrimitive.Portal container={container}>
        <PopoverPrimitive.Positioner
          side="inline-end"
          align="start"
          sideOffset={ICON_TOOLTIP_OFFSET}
          alignOffset={-4}
          collisionPadding={16}
          className="isolate z-50"
        >
          <PopoverPrimitive.Popup
            data-slot="sidebar-submenu-popup"
            className={cn(
              'flex max-h-(--available-height) w-max max-w-[min(16rem,var(--available-width))] min-w-44 origin-(--transform-origin) flex-col overflow-hidden rounded-lg border border-transparent bg-popover text-body text-popover-foreground shadow-popover dark:scheme-dark',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              'transition-[opacity,scale] duration-base',
              'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast',
              'motion-safe:data-starting-style:scale-[0.97] motion-safe:data-ending-style:scale-[0.97]',
            )}
          >
            <ScrollArea
              focusable={false}
              className="rounded-none"
              viewportClassName="overscroll-contain scroll-py-1 [&>[data-slot=scroll-area-content]]:min-w-0!"
            >
              <div className="p-1">
                <PopoverPrimitive.Title
                  render={<div />}
                  className="truncate px-2 pt-2 pb-1 text-caption font-medium text-muted-foreground"
                >
                  {label}
                </PopoverPrimitive.Title>
                <SidebarSubmenuPopupContext.Provider value>
                  <ul data-slot="sidebar-submenu-content" className={cn('flex w-full min-w-0 flex-col gap-0.5', className)} {...props}>
                    {children}
                  </ul>
                </SidebarSubmenuPopupContext.Provider>
              </div>
            </ScrollArea>
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </>
  );
}

/** One page of a submenu. Renders `<li>`. */
function SidebarSubmenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="sidebar-submenu-item" className={cn('relative', className)} {...props} />;
}

type SidebarSubmenuButtonProps = DistributiveOmit<SidebarMenuButtonProps, 'tooltip'>;

/**
 * The link of a page in a submenu, a `SidebarMenuButton` without a tooltip: in icon mode the popover names the
 * pages itself. A click on it closes the popover.
 */
function SidebarSubmenuButton({ className, ...props }: SidebarSubmenuButtonProps) {
  const submenu = React.useContext(SidebarSubmenuContext);
  const inPopup = React.useContext(SidebarSubmenuPopupContext);
  const { onClickCapture } = props as { onClickCapture?: (event: React.MouseEvent<HTMLElement>) => void };
  return (
    <SidebarMenuButton
      data-slot="sidebar-submenu-button"
      className={cn(
        // The panel and the popover clip anything outside them, so the focus outline is drawn inside.
        'focus-visible:-outline-offset-2',
        // The popover has no resize handle, so a long label wraps there instead of truncating.
        inPopup &&
          'h-auto min-h-7.5 py-1 text-start [&>span]:whitespace-normal hover:not-data-disabled:bg-accent hover:not-data-disabled:text-popover-foreground data-active:bg-accent hover:data-active:not-data-disabled:bg-accent dark:data-active:bg-accent dark:data-active:shadow-none dark:hover:data-active:not-data-disabled:bg-accent',
        className,
      )}
      {...props}
      onClickCapture={(event: React.MouseEvent<HTMLElement>) => {
        onClickCapture?.(event);
        if (inPopup) submenu?.setPopoverOpen(false);
      }}
    />
  );
}

type SidebarMenuRootProps = Omit<React.ComponentProps<typeof DropdownMenu>, 'children'>;

/** A menu trigger in the header or footer: two lines of text beside a 24px mark, which stays centered in the icon column. */
const menuTriggerClass =
  'h-10 gap-2.5 px-1.5 text-sidebar-foreground data-popup-open:bg-sidebar-accent group-data-[collapsible=icon]/sidebar:px-1';
/** Fades out in icon mode and, on expand, waits for the column to widen. */
const hiddenInIconMode =
  'transition-[opacity] group-data-[collapsible=icon]/sidebar:opacity-0 motion-safe:group-data-[state=expanded]/sidebar:delay-(--transition-duration-fast) group-data-snapping/sidebar-wrapper:transition-none group-data-snapping/sidebar-wrapper:delay-0';

/** Where a header or footer menu opens: beside the icon in icon mode, otherwise below the header or above the footer. */
function useMenuPlacement(side: 'bottom' | 'top') {
  const iconsOnly = useIconsOnly();
  return iconsOnly
    ? ({ side: 'inline-end', align: side === 'bottom' ? 'start' : 'end', sideOffset: ICON_TOOLTIP_OFFSET } as const)
    : ({ side, align: 'start' } as const);
}

function MenuText({ title, description }: { title: string; description?: string }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col text-start">
      <span title={title} className="truncate font-medium">
        {title}
      </span>
      {description ? (
        <span title={description} className="truncate text-caption text-muted-foreground">
          {description}
        </span>
      ) : null}
    </span>
  );
}

type SidebarWorkspace = {
  id: string;
  name: string;
  /** A second line under the name, such as the plan. */
  description?: string;
  /** Replaces the name's first letter in the workspace's mark, such as an `<img>` of its logo. */
  logo?: React.ReactNode;
};

function WorkspaceMark({ workspace, className }: { workspace: SidebarWorkspace; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-sidebar-primary text-caption font-medium text-sidebar-primary-foreground [&>img]:size-full [&>img]:object-cover',
        className,
      )}
    >
      {workspace.logo ?? workspace.name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

type SidebarWorkspaceSwitcherProps = SidebarMenuRootProps & {
  /** The workspaces in the menu. With none, the switcher renders nothing. */
  workspaces: SidebarWorkspace[];
  /** The `id` of the current workspace. Use with `onValueChange`. */
  value?: string;
  /** The workspace shown at first, when the switcher keeps its own state. Defaults to the first one. */
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** The heading over the workspaces in the menu. */
  label?: string;
  /** More menu items after the workspaces, below a line: `DropdownMenuItem`s such as "Add workspace". */
  children?: React.ReactNode;
  /** Classes for the trigger. */
  className?: string;
};

/**
 * The current workspace at the top of the sidebar: its mark, name and description, opening a menu that switches to
 * another. Place it in `SidebarHeader`. In icon mode only the mark shows, the name is its tooltip, and the menu opens
 * beside it.
 */
function SidebarWorkspaceSwitcher({
  workspaces,
  value,
  defaultValue,
  onValueChange,
  label = 'Workspaces',
  children,
  className,
  ...props
}: SidebarWorkspaceSwitcherProps) {
  const [selected, setSelected] = useControllable(value, defaultValue ?? workspaces[0]?.id, onValueChange);
  const placement = useMenuPlacement('bottom');
  const current = workspaces.find((workspace) => workspace.id === selected) ?? workspaces[0];
  if (!current) return null;
  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            data-slot="sidebar-workspace-switcher"
            tooltip={current.name}
            className={cn(menuTriggerClass, className)}
          />
        }
        aria-label={`${current.name}, switch workspace`}
      >
        <WorkspaceMark workspace={current} />
        <MenuText title={current.name} description={current.description} />
        <ChevronsUpDown aria-hidden className={cn('ms-auto', hiddenInIconMode)} />
      </DropdownMenuTrigger>
      <DropdownMenuContent {...placement} className="min-w-(--anchor-width) sm:min-w-56">
        <DropdownMenuRadioGroup value={current.id} onValueChange={(id: string) => setSelected(id)}>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {workspaces.map((workspace) => (
            <DropdownMenuRadioItem key={workspace.id} value={workspace.id}>
              <WorkspaceMark workspace={workspace} className="size-5" />
              <span className="min-w-0 truncate">{workspace.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {children ? (
          <>
            <DropdownMenuSeparator />
            {children}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type SidebarUser = {
  name: string;
  email?: string;
  /** The address of the user's photo. Without it, or while it loads, the avatar shows `initials`. */
  avatar?: string;
  /** Defaults to the first letter of the name. */
  initials?: string;
};

function UserDetails({ user }: { user: SidebarUser }) {
  return (
    <>
      <Avatar size="sm" aria-hidden>
        {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
        <AvatarFallback>{user.initials ?? user.name.trim().charAt(0)}</AvatarFallback>
      </Avatar>
      <MenuText title={user.name} description={user.email} />
    </>
  );
}

type SidebarUserMenuProps = SidebarMenuRootProps & {
  /** The signed-in user. */
  user: SidebarUser;
  /** The menu's items, `DropdownMenuItem`s such as Profile and Log out. Without them the user shows as plain text. */
  children?: React.ReactNode;
  /** Classes for the trigger. */
  className?: string;
};

/**
 * The signed-in user at the bottom of the sidebar: avatar, name and email, opening a menu upward with the account
 * actions you pass. Place it in `SidebarFooter`. In icon mode only the avatar shows, the name is its tooltip, and the
 * menu opens beside it.
 */
function SidebarUserMenu({ user, children, className, ...props }: SidebarUserMenuProps) {
  const placement = useMenuPlacement('top');
  if (!children) {
    return (
      <div
        data-slot="sidebar-user"
        className={cn(
          'flex h-10 min-w-0 items-center gap-2.5 overflow-hidden px-1.5 text-body text-sidebar-foreground group-data-[collapsible=icon]/sidebar:px-1',
          '[&>span:last-child]:transition-[opacity] group-data-[collapsible=icon]/sidebar:[&>span:last-child]:opacity-0 motion-safe:group-data-[state=expanded]/sidebar:[&>span:last-child]:delay-(--transition-duration-fast)',
          'group-data-snapping/sidebar-wrapper:[&>span:last-child]:transition-none group-data-snapping/sidebar-wrapper:[&>span:last-child]:delay-0',
          className,
        )}
      >
        <UserDetails user={user} />
      </div>
    );
  }
  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger
        render={<SidebarMenuButton data-slot="sidebar-user-menu" tooltip={user.name} className={cn(menuTriggerClass, className)} />}
        aria-label={`${user.name}, user menu`}
      >
        <UserDetails user={user} />
        <ChevronsUpDown aria-hidden className={cn('ms-auto', hiddenInIconMode)} />
      </DropdownMenuTrigger>
      <DropdownMenuContent {...placement} className="min-w-(--anchor-width) sm:min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-body font-medium text-foreground">{user.name}</span>
            {user.email ? <span className="truncate font-normal">{user.email}</span> : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
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
  SidebarSubmenu,
  SidebarSubmenuButton,
  SidebarSubmenuContent,
  SidebarSubmenuItem,
  SidebarSubmenuTrigger,
  SidebarTrigger,
  SidebarUserMenu,
  SidebarWorkspaceSwitcher,
  useSidebar,
  type SidebarCollapsible,
  type SidebarMenuButtonProps,
  type SidebarProps,
  type SidebarProviderProps,
  type SidebarSubmenuButtonProps,
  type SidebarSubmenuContentProps,
  type SidebarSubmenuProps,
  type SidebarSubmenuTriggerProps,
  type SidebarTriggerProps,
  type SidebarUser,
  type SidebarUserMenuProps,
  type SidebarWorkspace,
  type SidebarWorkspaceSwitcherProps,
};
