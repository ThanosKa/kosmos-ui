import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * Shares the open delay between tooltips: once one is open, its neighbors open at once.
 * Wrap the app (or a toolbar) in it once.
 */
function TooltipProvider(props: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider {...props} />;
}

function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

/** Pass the control it describes through `render`: `<TooltipTrigger render={<Button variant="ghost" />} />`. */
function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

type TooltipContentProps = TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset'>;

function TooltipContent({
  className,
  side = 'top',
  sideOffset = 6,
  align = 'center',
  alignOffset = 0,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            'w-fit max-w-[min(20rem,var(--available-width))] rounded-lg border border-transparent bg-popover px-2 py-1 text-small text-pretty text-popover-foreground shadow-popover',
            'origin-(--transform-origin) transition-[opacity,scale] duration-base',
            'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast',
            'motion-safe:data-starting-style:scale-[0.97] motion-safe:data-ending-style:scale-[0.97]',
            'data-instant:duration-0',
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
