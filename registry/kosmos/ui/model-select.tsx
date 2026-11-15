'use client';

import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button, type ButtonProps } from '@/registry/kosmos/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  type DropdownMenuContentProps,
} from '@/registry/kosmos/ui/dropdown-menu';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';

type ModelEffort = 'low' | 'medium' | 'high';

type ModelOption = {
  id: string;
  name: string;
  /** A few words on what the model is for, such as "Balanced", shown after the name. On a disabled model, say why. */
  hint?: string;
  /** The efforts this model offers, when they differ from the menu's `efforts`. An empty list means none. */
  efforts?: ModelEffort[];
  disabled?: boolean;
};

const modelEffortLabels: Record<ModelEffort, string> = { low: 'Low', medium: 'Medium', high: 'High' };

function useControllableState<Value>(controlled: Value | undefined, initial: Value, onChange?: (next: Value) => void) {
  const [inner, setInner] = React.useState(initial);
  const set = React.useCallback(
    (next: Value) => {
      setInner(next);
      onChange?.(next);
    },
    [onChange],
  );
  return [controlled ?? inner, set] as const;
}

type ModelSelectButtonProps = Omit<Extract<ButtonProps, { href?: undefined }>, 'children'> & {
  /** The chosen model, shown by name. */
  model?: ModelOption;
  /** The chosen effort, shown after the name. Leave it out when the model offers none. */
  effort?: ModelEffort;
};

/**
 * The quiet trigger: the model name and effort in muted text with a chevron, a ghost Button that lights up on hover
 * and while its menu is open. Pass it as the `render` of a menu or popover trigger.
 */
function ModelSelectButton({ model, effort, variant = 'ghost', size = 'md', className, ...props }: ModelSelectButtonProps) {
  return (
    <Button
      data-slot="model-select-button"
      variant={variant}
      size={size}
      className={cn(
        'max-w-full min-w-0 gap-1 px-2 text-muted-foreground transition-[background-color,color,scale] hover:not-data-disabled:text-foreground data-popup-open:bg-accent data-popup-open:text-foreground',
        className,
      )}
      {...props}
    >
      <span className="truncate">
        <span className="sr-only">Model: </span>
        {model?.name ?? 'Choose a model'}
        {effort ? <span className="sr-only">,</span> : null}
      </span>
      {effort ? (
        <span className="shrink-0">
          <span aria-hidden>· </span>
          {modelEffortLabels[effort]}
          <span className="sr-only"> effort</span>
        </span>
      ) : null}
      <ChevronDown aria-hidden className="size-3 text-current" />
    </Button>
  );
}

/** Keys the effort control handles itself, kept from a menu around it, which would move its highlight or close on them. */
const effortKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', ' ', 'Enter']);

type ModelSelectEffortProps = Omit<React.ComponentProps<'div'>, 'onChange'> & {
  /** Every effort the control shows, in order. */
  efforts: ModelEffort[];
  /** The efforts the chosen model offers; the rest are disabled. Defaults to all of `efforts`. */
  available?: ModelEffort[];
  value?: ModelEffort;
  onValueChange?: (effort: ModelEffort) => void;
};

/** The "Effort" label and a small segmented control, for the foot of a model menu or popover. */
function ModelSelectEffort({
  efforts,
  available = efforts,
  value,
  onValueChange,
  className,
  onKeyDown,
  ...props
}: ModelSelectEffortProps) {
  const labelId = React.useId();
  return (
    <div
      data-slot="model-select-effort"
      className={cn('flex items-center justify-between gap-3', className)}
      onKeyDown={(event) => {
        if (effortKeys.has(event.key) || event.key.length === 1) event.stopPropagation();
        onKeyDown?.(event);
      }}
      {...props}
    >
      <span id={labelId} className="text-small text-muted-foreground">
        Effort
      </span>
      <SegmentedControl
        size="sm"
        aria-labelledby={labelId}
        value={value ?? ''}
        disabled={available.length === 0}
        onValueChange={(next) => onValueChange?.(next as ModelEffort)}
      >
        {efforts.map((option) => (
          <SegmentedControlItem key={option} value={option} disabled={!available.includes(option)}>
            {modelEffortLabels[option]}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  );
}

/**
 * A pointer open moves focus to the first tabbable element in the menu, which is the effort control rather than the
 * models. Send that focus to the menu, so the arrow keys move through the models; Tab from a model still reaches it.
 */
function keepOpeningFocusOnMenu(event: React.FocusEvent<HTMLElement>) {
  const menu = event.currentTarget.closest<HTMLElement>('[role="menu"]');
  if (menu && !menu.contains(event.relatedTarget as Node | null)) menu.focus();
}

type ModelSelectProps = {
  models: ModelOption[];
  /** The chosen model id. Controlled when set. */
  value?: string;
  /** The model chosen at first. Defaults to the first enabled model. */
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** The reasoning efforts to offer. Without it the menu picks the model only. */
  efforts?: ModelEffort[];
  /** The chosen effort. Controlled when set. */
  effort?: ModelEffort;
  /** The effort chosen at first. Defaults to the middle one of `efforts`. */
  defaultEffort?: ModelEffort;
  onEffortChange?: (effort: ModelEffort) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Whether the open menu locks page scroll and blocks clicks outside it. */
  modal?: boolean;
  disabled?: boolean;
  /** The element the menu renders into. Defaults to `document.body`. */
  container?: DropdownMenuContentProps['container'];
  /** Classes for the trigger. */
  className?: string;
};

/**
 * Picks the model an agent runs on, and its reasoning effort. A quiet trigger for a composer toolbar opens a menu with
 * one row per model and, when `efforts` is set, a segmented control for the effort at its foot. Picking a model closes
 * the menu; changing the effort keeps it open.
 */
function ModelSelect({
  models,
  value,
  defaultValue,
  onValueChange,
  efforts,
  effort,
  defaultEffort,
  onEffortChange,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  disabled,
  container,
  className,
}: ModelSelectProps) {
  const firstEnabled = models.find((model) => !model.disabled) ?? models[0];
  const [modelId, setModelId] = useControllableState(value, defaultValue ?? firstEnabled?.id ?? '', onValueChange);
  const [currentEffort, setEffort] = useControllableState<ModelEffort>(
    effort,
    defaultEffort ?? efforts?.[Math.floor((efforts.length - 1) / 2)] ?? 'medium',
    onEffortChange,
  );
  const selected = models.find((model) => model.id === modelId);
  const available = selected?.efforts ?? efforts ?? [];
  const shownEffort = available.includes(currentEffort) ? currentEffort : undefined;

  return (
    <DropdownMenu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <DropdownMenuTrigger
        disabled={disabled}
        render={<ModelSelectButton model={selected} effort={shownEffort} className={className} />}
      />
      <DropdownMenuContent container={container} align="start" className="w-max max-w-[min(20rem,var(--available-width))]">
        <DropdownMenuRadioGroup value={modelId} onValueChange={(next) => setModelId(next as string)} aria-label="Model">
          {models.map((model) => (
            <DropdownMenuRadioItem key={model.id} value={model.id} disabled={model.disabled} closeOnClick>
              <span className="min-w-0 break-words">{model.name}</span>
              {model.hint ? (
                <span
                  className={cn(
                    'min-w-0 truncate font-normal text-muted-foreground',
                    model.disabled ? 'shrink-0' : 'shrink-[100]',
                  )}
                >
                  {model.hint}
                </span>
              ) : null}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {efforts && efforts.length > 0 ? (
          <ModelSelectEffort
            efforts={efforts}
            available={available}
            value={shownEffort}
            onValueChange={setEffort}
            onFocus={keepOpeningFocusOnMenu}
            className="-mx-1 mt-1 -mb-1 border-t border-border py-1.5 ps-3 pe-1.5"
          />
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export {
  ModelSelect,
  ModelSelectButton,
  ModelSelectEffort,
  modelEffortLabels,
  type ModelEffort,
  type ModelOption,
  type ModelSelectButtonProps,
  type ModelSelectEffortProps,
  type ModelSelectProps,
};
