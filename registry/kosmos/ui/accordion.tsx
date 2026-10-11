import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * A stack of sections that open and close under their headings, split by 1px dividers. One section
 * opens at a time; pass `multiple` to allow more. Tab moves between headings, Enter and Space open
 * and close them.
 */
function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col divide-y divide-border', className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={className} {...props} />;
}

/** The heading row that opens and closes its section. Renders an `<h3>` around a button. */
function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="flex py-1">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger flex min-h-10 flex-1 items-start justify-between gap-3 rounded-lg px-2 py-2.5 text-start text-body font-medium text-foreground',
          'transition-[background-color] duration-instant hover:not-data-disabled:bg-accent active:not-data-disabled:bg-accent',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          'data-disabled:cursor-not-allowed data-disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
        {/* Turns over as the section opens; under reduced motion the down and up chevrons cross-fade instead. */}
        <span aria-hidden className="relative size-5 shrink-0 text-muted-foreground *:absolute *:inset-0.5 *:size-4">
          <ChevronDown
            className={cn(
              'transition-[rotate,opacity] duration-fast ease-power3-out group-data-panel-open/accordion-trigger:duration-slow',
              'motion-safe:group-data-panel-open/accordion-trigger:rotate-180 motion-safe:group-data-panel-open/accordion-trigger:ease-smooth-in-out',
              'motion-reduce:group-data-panel-open/accordion-trigger:opacity-0',
            )}
          />
          <ChevronUp className="opacity-0 transition-[opacity] duration-fast motion-reduce:group-data-panel-open/accordion-trigger:opacity-100" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * The section body. It grows to its height as it opens (300ms) and shrinks back faster as it closes
 * (150ms); under reduced motion it fades in and out instead.
 */
function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        'h-(--accordion-panel-height) overflow-hidden duration-fast ease-power3-out data-open:duration-slow',
        'motion-safe:transition-[height] motion-safe:data-open:ease-smooth-in-out motion-safe:data-ending-style:h-0 motion-safe:data-starting-style:h-0',
        'motion-reduce:transition-[opacity] motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:opacity-0',
      )}
      {...props}
    >
      <div className={cn('px-2 pb-3 text-body text-pretty text-muted-foreground', className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
