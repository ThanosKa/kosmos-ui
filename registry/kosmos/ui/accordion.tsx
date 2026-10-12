'use client';

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';

type HeadingLevel = 2 | 3 | 4 | 5 | 6;

const HeadingLevelContext = React.createContext<HeadingLevel>(3);

type AccordionProps = AccordionPrimitive.Root.Props & {
  /** The level of every section heading, so it fits the page's outline. Defaults to `3` (`<h3>`). */
  headingLevel?: HeadingLevel;
};

/**
 * A stack of sections that open and close under their headings, split by 1px dividers. One section
 * opens at a time; pass `multiple` to allow more. Tab moves between headings, Enter and Space open
 * and close them.
 */
function Accordion({ className, headingLevel = 3, ...props }: AccordionProps) {
  return (
    <HeadingLevelContext.Provider value={headingLevel}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        className={cn('flex w-full flex-col divide-y divide-border', className)}
        {...props}
      />
    </HeadingLevelContext.Provider>
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={className} {...props} />;
}

/** The heading row that opens and closes its section. Renders a heading (`<h3>` unless the Accordion sets `headingLevel`) around a button. */
function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  const Heading = `h${React.useContext(HeadingLevelContext)}` as const;
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" render={<Heading />} className="flex py-1">
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
 * The section body. It grows to its height as it opens and shrinks back as it closes, both in 300ms on
 * the same curve, so when one section opens as another closes the content below holds still. Under
 * reduced motion the height changes at once and the opening section fades in.
 */
function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        'h-(--accordion-panel-height) overflow-hidden duration-slow',
        'motion-safe:transition-[height] motion-safe:ease-smooth-in-out motion-safe:data-ending-style:h-0 motion-safe:data-starting-style:h-0',
        'motion-reduce:transition-[opacity] motion-reduce:data-closed:h-0 motion-reduce:data-starting-style:opacity-0',
      )}
      {...props}
    >
      <div className={cn('px-2 pb-3 text-body text-pretty text-muted-foreground', className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
