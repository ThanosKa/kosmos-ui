'use client';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * Switches between panels that share one spot on the page. Arrow keys move between tabs and
 * activate them as they go; `orientation="vertical"` stacks the tabs and uses the up and down keys.
 */
function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-4 data-[orientation=vertical]:flex-row', className)}
      {...props}
    />
  );
}

/**
 * The row of tabs, drawn on a 1px divider, with an indicator that slides to the active tab. The indicator
 * sits just inside the divider, because the scrolling list clips anything drawn over its border.
 * Under reduced motion the indicator cross-fades between tabs instead of sliding.
 * Scrolls sideways when the tabs do not fit, with the platform's thin scrollbar as the cue.
 */
function TabsList({ className, children, activateOnFocus = true, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      activateOnFocus={activateOnFocus}
      className={cn(
        'group/tabs-list relative flex shrink-0 items-center gap-1 [scrollbar-width:thin]',
        'data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:border-b data-[orientation=horizontal]:border-border',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[orientation=vertical]:border-s data-[orientation=vertical]:border-border',
        className,
      )}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator
        data-slot="tabs-indicator"
        renderBeforeHydration
        className={cn(
          'pointer-events-none absolute bg-foreground motion-reduce:hidden',
          'transition-[translate,width,height] duration-slow ease-smooth-in-out',
          'data-[orientation=horizontal]:bottom-0 data-[orientation=horizontal]:left-0 data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-(--active-tab-width) data-[orientation=horizontal]:translate-x-(--active-tab-left)',
          'data-[orientation=vertical]:top-0 data-[orientation=vertical]:-start-px data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:h-(--active-tab-height) data-[orientation=vertical]:translate-y-(--active-tab-top)',
        )}
      />
    </TabsPrimitive.List>
  );
}

/**
 * One tab. Text, an icon (`data-icon="inline-start"`) and a count fit inside.
 * The active tab turns `foreground`; the rest stay `muted-foreground` until hovered.
 */
function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        'relative inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent px-2 text-body font-medium whitespace-nowrap text-muted-foreground [-webkit-tap-highlight-color:transparent]',
        'transition-[color] hover:not-data-disabled:text-foreground data-active:text-foreground',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
        'data-disabled:opacity-50',
        'group-data-[orientation=vertical]/tabs-list:h-8 group-data-[orientation=vertical]/tabs-list:justify-start group-data-[orientation=vertical]/tabs-list:px-3',
        // The underline the reduced-motion cross-fade uses in place of the sliding indicator.
        'after:pointer-events-none after:absolute after:bg-foreground after:opacity-0 after:transition-opacity motion-safe:after:hidden data-active:after:opacity-100',
        'group-data-[orientation=horizontal]/tabs-list:after:inset-x-0 group-data-[orientation=horizontal]/tabs-list:after:bottom-0 group-data-[orientation=horizontal]/tabs-list:after:h-0.5',
        'group-data-[orientation=vertical]/tabs-list:after:inset-y-0 group-data-[orientation=vertical]/tabs-list:after:-start-px group-data-[orientation=vertical]/tabs-list:after:w-0.5',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    />
  );
}

/** The content of one tab. Only the active panel is in the page; `keepMounted` keeps the rest hidden instead. */
function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        'min-w-0 flex-1 text-body focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
