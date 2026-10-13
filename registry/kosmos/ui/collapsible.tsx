'use client';

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button, type ButtonProps } from '@/registry/kosmos/ui/button';
import { cn } from '@/registry/kosmos/lib/cn';

/** One panel that opens and closes under its trigger. For a stack of sections under headings, use Accordion. */
function Collapsible({ className, ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" className={className} {...props} />;
}

type CollapsibleTriggerProps = Omit<CollapsiblePrimitive.Trigger.Props, 'render' | 'className'> &
  Pick<Extract<ButtonProps, { href?: undefined }>, 'variant' | 'size' | 'className'>;

/** The Button that opens and closes the panel. Put a `CollapsibleChevron` inside it. */
function CollapsibleTrigger({ variant = 'ghost', size = 'md', className, ...props }: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      render={<Button variant={variant} size={size} />}
      className={cn('group/collapsible', className)}
      {...props}
    />
  );
}

/**
 * The chevron of a trigger: it turns over as the panel opens, and under reduced motion the down and up
 * chevrons cross-fade. `md` is 16px for 36px rows, `sm` is 12px for small buttons.
 */
function CollapsibleChevron({ size = 'md', className }: { size?: 'md' | 'sm'; className?: string }) {
  const icon = cn('absolute', size === 'md' ? 'inset-0.5 size-4' : 'inset-0 size-3');
  return (
    <span
      aria-hidden
      data-slot="collapsible-chevron"
      className={cn('relative shrink-0 text-muted-foreground', size === 'md' ? 'size-5' : 'size-3', className)}
    >
      <ChevronDown
        className={cn(
          icon,
          'transition-[rotate,opacity] duration-fast ease-power3-out group-data-panel-open/collapsible:duration-slow',
          'motion-safe:group-data-panel-open/collapsible:rotate-180 motion-safe:group-data-panel-open/collapsible:ease-smooth-in-out',
          'motion-reduce:group-data-panel-open/collapsible:opacity-0',
        )}
      />
      <ChevronUp
        className={cn(icon, 'opacity-0 transition-[opacity] duration-fast motion-reduce:group-data-panel-open/collapsible:opacity-100')}
      />
    </span>
  );
}

/** The panel. It grows to its height as it opens (300ms) and shrinks back faster (150ms); under reduced motion it fades. */
function CollapsibleContent({ className, ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        'h-(--collapsible-panel-height) overflow-hidden duration-fast ease-power3-out data-open:duration-slow',
        'motion-safe:transition-[height] motion-safe:data-open:ease-smooth-in-out motion-safe:data-ending-style:h-0 motion-safe:data-starting-style:h-0',
        'motion-reduce:transition-[opacity] motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleChevron, CollapsibleContent, type CollapsibleTriggerProps };
