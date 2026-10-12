'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { mergeProps } from '@base-ui/react/merge-props';
import { Check, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { KbdGroup } from '@/registry/kosmos/ui/kbd';

/**
 * Keeps this part's `data-slot` when `render` is an element that brings its own, such as a Button
 * rendered on the server, whose `data-slot="button"` would otherwise win the prop merge.
 */
function withSlot<Render>(render: Render, slot: string) {
  if (!React.isValidElement<Record<string, unknown>>(render)) return render;
  return (props: React.ComponentProps<'button'>) =>
    React.cloneElement(render, { ...mergeProps<'button'>(props, render.props), 'data-slot': slot, ref: props.ref });
}

function DropdownMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger({ render, ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" render={withSlot(render, 'dropdown-menu-trigger')} {...props} />;
}

function DropdownMenuPortal(props: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

/** Places the menu next to its trigger: 4px away, 16px clear of the screen edges, flipping when out of room. */
function DropdownMenuPositioner({
  className,
  sideOffset = 4,
  collisionPadding = 16,
  ...props
}: MenuPrimitive.Positioner.Props) {
  return (
    <MenuPrimitive.Positioner
      data-slot="dropdown-menu-positioner"
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn('isolate z-50 outline-none', className)}
      {...props}
    />
  );
}

/** The menu surface. Grows out of its trigger (`scale-[0.97]` plus a fade), or only fades under reduced motion. */
function DropdownMenuPopup({ className, ...props }: MenuPrimitive.Popup.Props) {
  return (
    <MenuPrimitive.Popup
      data-slot="dropdown-menu-popup"
      className={cn(
        'max-h-(--available-height) max-w-(--available-width) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto overscroll-contain rounded-xl border border-transparent bg-popover p-1 text-body text-popover-foreground shadow-popover sm:min-w-44 dark:scheme-dark',
        // The popup holds focus only as the container of its items; the highlighted item is the focus indicator.
        'outline-none',
        'transition-[opacity,scale] duration-base',
        'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast',
        'motion-safe:data-starting-style:scale-[0.97] motion-safe:data-ending-style:scale-[0.97]',
        className,
      )}
      {...props}
    />
  );
}

type DropdownMenuContentProps = MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'side' | 'sideOffset' | 'align' | 'alignOffset' | 'collisionPadding' | 'anchor'
  > & {
    /** The element the menu renders into. Defaults to `document.body`. */
    container?: MenuPrimitive.Portal.Props['container'];
  };

/** Portal, positioner and popup in one part. Opens below the trigger, lined up with its start edge. */
function DropdownMenuContent({
  side = 'bottom',
  sideOffset,
  align = 'start',
  alignOffset,
  collisionPadding,
  anchor,
  container,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPortal container={container}>
      <DropdownMenuPositioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        anchor={anchor}
      >
        <DropdownMenuPopup data-slot="dropdown-menu-content" {...props} />
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  );
}

const itemClass = cn(
  'relative flex min-h-7.5 cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-body font-medium outline-none select-none',
  'transition-[background-color] duration-instant',
  'data-highlighted:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50',
  'data-inset:ps-8',
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='text-'])]:text-muted-foreground",
);

type DropdownMenuItemProps = MenuPrimitive.Item.Props & {
  /** `destructive` colors the label and icon red, for an action that deletes or removes. */
  variant?: 'default' | 'destructive';
  /** Lines the label up with items that have an icon or a check mark. */
  inset?: boolean;
};

/** One action. Clicking it, or Enter or Space on it, runs `onClick` and closes the menu. */
function DropdownMenuItem({ className, variant = 'default', inset, ...props }: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      data-inset={inset ? '' : undefined}
      className={cn(
        itemClass,
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:[&_svg:not([class*='text-'])]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

type DropdownMenuLinkItemProps = MenuPrimitive.LinkItem.Props & { inset?: boolean };

/** An item that navigates. Renders an `<a>`; pass `href`, or `render` for a router link. */
function DropdownMenuLinkItem({ className, inset, ...props }: DropdownMenuLinkItemProps) {
  return (
    <MenuPrimitive.LinkItem
      data-slot="dropdown-menu-link-item"
      data-inset={inset ? '' : undefined}
      className={cn(itemClass, className)}
      {...props}
    />
  );
}

type DropdownMenuCheckboxItemProps = MenuPrimitive.CheckboxItem.Props & { inset?: boolean };

/** An item that turns a setting on and off, with a check mark at the end while on. Stays open on click. */
function DropdownMenuCheckboxItem({ className, children, inset, ...props }: DropdownMenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset ? '' : undefined}
      closeOnClick={false}
      className={cn(itemClass, 'pe-8', className)}
      {...props}
    >
      {children}
      <MenuPrimitive.CheckboxItemIndicator className="absolute end-2 flex items-center">
        <Check aria-hidden className="text-foreground" />
      </MenuPrimitive.CheckboxItemIndicator>
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

type DropdownMenuRadioItemProps = MenuPrimitive.RadioItem.Props & { inset?: boolean };

/** One choice in a `DropdownMenuRadioGroup`, with a check mark at the end while chosen. Stays open on click. */
function DropdownMenuRadioItem({ className, children, inset, ...props }: DropdownMenuRadioItemProps) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset ? '' : undefined}
      closeOnClick={false}
      className={cn(itemClass, 'pe-8', className)}
      {...props}
    >
      {children}
      <MenuPrimitive.RadioItemIndicator className="absolute end-2 flex items-center">
        <Check aria-hidden className="text-foreground" />
      </MenuPrimitive.RadioItemIndicator>
    </MenuPrimitive.RadioItem>
  );
}

/** Groups related items. Put a `DropdownMenuLabel` first to name the group. */
function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

type DropdownMenuLabelProps = MenuPrimitive.GroupLabel.Props & { inset?: boolean };

/** Names a `DropdownMenuGroup` or `DropdownMenuRadioGroup`. Must sit inside one. */
function DropdownMenuLabel({ className, inset, ...props }: DropdownMenuLabelProps) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset ? '' : undefined}
      className={cn('px-2 pt-2 pb-1 text-caption font-medium text-muted-foreground data-inset:ps-8', className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 border-t border-border', className)}
      {...props}
    />
  );
}

/** The shortcut that runs an item, at its end. Put a `Kbd` per key inside; the menu does not bind the keys. */
function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<typeof KbdGroup>) {
  return <KbdGroup data-slot="dropdown-menu-shortcut" className={cn('ms-auto ps-4', className)} {...props} />;
}

function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

type DropdownMenuSubTriggerProps = MenuPrimitive.SubmenuTrigger.Props & { inset?: boolean };

/** The item that opens a submenu, on hover, click, or the arrow key toward the end side. */
function DropdownMenuSubTrigger({ className, children, inset, ...props }: DropdownMenuSubTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset ? '' : undefined}
      className={cn(itemClass, 'data-popup-open:bg-accent', className)}
      {...props}
    >
      {children}
      <ChevronRight aria-hidden className="ms-auto rtl:rotate-180" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

/** A submenu's portal, positioner and popup. Opens on the end side, its first item level with the trigger. */
function DropdownMenuSubContent({
  side = 'inline-end',
  sideOffset = 0,
  align = 'start',
  alignOffset = -5,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuLinkItemProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuSubTriggerProps,
};
