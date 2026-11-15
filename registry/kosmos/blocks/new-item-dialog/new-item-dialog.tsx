'use client';

import { CalendarDays, Circle, CircleCheck, CircleDashed, CircleDot, Plus, type LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/kosmos/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';
import { Switch } from '@/registry/kosmos/ui/switch';
import { Textarea } from '@/registry/kosmos/ui/textarea';

type NewItemPerson = { id: string; name: string; initials: string; avatarUrl?: string };

/** A stage of the roadmap: a column of the board the item lands in. */
type NewItemStage = {
  value: string;
  label: string;
  /** The stage glyph. Without one, a dot. */
  icon?: LucideIcon;
  /** Colors the glyph or the dot. */
  tone?: 'muted' | 'success' | 'warning' | 'destructive';
};

/** A part of the product, shown as a tag in one of the Badge hues. */
type NewItemArea = { value: string; label: string; hue: 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet' };

/** The form, and what `onCreate` receives. */
type NewItemValues = {
  title: string;
  description: string;
  /** The `value` of a stage in `stages`. */
  stage: string;
  /** The `value` of an area in `areas`, or `null` for none. */
  area: string | null;
  /** The `id` of a person in `people`, or `null` for nobody yet. */
  assignee: string | null;
  /** One of `targets`, or `null` for no target. */
  target: string | null;
};

// Sample data: replace it with your roadmap's stages, areas, quarters and team.
const sampleStages: NewItemStage[] = [
  { value: 'ideas', label: 'Ideas', icon: CircleDashed, tone: 'muted' },
  { value: 'planned', label: 'Planned', icon: Circle, tone: 'muted' },
  { value: 'in-progress', label: 'In progress', icon: CircleDot, tone: 'warning' },
  { value: 'shipped', label: 'Shipped', icon: CircleCheck, tone: 'success' },
];

const sampleAreas: NewItemArea[] = [
  { value: 'insights', label: 'Insights', hue: 'amber' },
  { value: 'ingestion', label: 'Ingestion', hue: 'green' },
  { value: 'billing', label: 'Billing', hue: 'red' },
  { value: 'platform', label: 'Platform', hue: 'blue' },
];

const sampleTargets = ['Q4 2026', 'Q1 2027', 'Q2 2027', 'Q3 2027'];

const samplePeople: NewItemPerson[] = [
  { id: 'lena', name: 'Lena Park', initials: 'LP', avatarUrl: '/avatars/lena.jpg' },
  { id: 'tomas', name: 'Tomás Ortega', initials: 'TO', avatarUrl: '/avatars/tomas.jpg' },
  { id: 'ama', name: 'Ama Mensah', initials: 'AM', avatarUrl: '/avatars/ama.jpg' },
  { id: 'kai', name: 'Kai Nakamura', initials: 'KN', avatarUrl: '/avatars/kai.jpg' },
];

const toneText = {
  muted: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
} satisfies Record<NonNullable<NewItemStage['tone']>, string>;

const toneDot = {
  muted: 'bg-muted-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
} satisfies Record<NonNullable<NewItemStage['tone']>, string>;

function StageLabel({ stage }: { stage: NewItemStage | undefined }) {
  if (!stage) return null;
  const tone = stage.tone ?? 'muted';
  const Icon = stage.icon;
  return (
    <span className="flex min-w-0 items-center gap-2">
      {Icon ? (
        <Icon aria-hidden className={cn('size-3.5 shrink-0', toneText[tone])} />
      ) : (
        <span aria-hidden className={cn('size-2 shrink-0 rounded-full', toneDot[tone])} />
      )}
      <span className="truncate">{stage.label}</span>
    </span>
  );
}

function AreaLabel({ area }: { area: NewItemArea | undefined }) {
  if (!area) return <span className="truncate text-muted-foreground">No area</span>;
  return (
    <Badge variant={area.hue} className="max-w-full">
      <span className="truncate">{area.label}</span>
    </Badge>
  );
}

function PersonLabel({ person }: { person: NewItemPerson | undefined }) {
  if (!person) {
    return (
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <CircleDashed aria-hidden className="size-4 shrink-0" />
        <span className="truncate">Unassigned</span>
      </span>
    );
  }
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar size="sm" className="size-5" aria-hidden>
        {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt="" /> : null}
        <AvatarFallback>{person.initials}</AvatarFallback>
      </Avatar>
      <span className="truncate">{person.name}</span>
    </span>
  );
}

function TargetLabel({ target }: { target: string | null }) {
  return (
    <span className={cn('flex min-w-0 items-center gap-2 tabular-nums', !target && 'text-muted-foreground')}>
      <CalendarDays aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{target ?? 'No target'}</span>
    </span>
  );
}

type NewItemDialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called with the form values when the item is created. */
  onCreate?: (values: NewItemValues) => void;
  /** The stages, in board order. The first is the default. */
  stages?: NewItemStage[];
  /** The areas an item can belong to. */
  areas?: NewItemArea[];
  /** The quarters an item can target. */
  targets?: string[];
  /** The people who can be assigned. */
  people?: NewItemPerson[];
  /** Values to start the form with each time it opens, such as the stage of the board column it was opened from. */
  defaultValues?: Partial<NewItemValues>;
  /**
   * The form as it stands, controlled. Use with `onValuesChange`. A controlled form is not cleared
   * when the dialog opens; reset it yourself, for example in `onOpenChange`.
   */
  values?: NewItemValues;
  /** Called with the whole form each time a field changes, and when "Create more" clears it. */
  onValuesChange?: (values: NewItemValues) => void;
  /** The element that opens the dialog. Defaults to a "New item" button; pass `null` to open it only through `open`. */
  trigger?: React.ReactElement | null;
  /** Shows the validation errors from the start, as after a failed submit. For previews. */
  defaultSubmitted?: boolean;
  /** Blocks the page behind the dialog. Defaults to `true`. */
  modal?: boolean;
  /** The element the dialog renders into. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof DialogContent>['container'];
  /** Where focus goes when the dialog opens. Defaults to the title field. */
  initialFocus?: React.ComponentProps<typeof DialogContent>['initialFocus'];
};

function toForm(values: Partial<NewItemValues> | undefined, stages: NewItemStage[]): NewItemValues {
  return { title: '', description: '', stage: stages[0]?.value ?? '', area: null, assignee: null, target: null, ...values };
}

/**
 * A dialog with the form for a new roadmap item: its title and description, then its stage, area,
 * assignee and target quarter. The title is required; submitting without one shows the error and
 * moves focus to it. With "Create more" on, the form clears and stays open for the next one.
 */
function NewItemDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onCreate,
  stages = sampleStages,
  areas = sampleAreas,
  targets = sampleTargets,
  people = samplePeople,
  defaultValues,
  values: valuesProp,
  onValuesChange,
  trigger,
  defaultSubmitted = false,
  modal = true,
  container,
  initialFocus,
}: NewItemDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const [uncontrolledValues, setUncontrolledValues] = React.useState(() => toForm(defaultValues, stages));
  const values = valuesProp ?? uncontrolledValues;
  const setValues = (next: NewItemValues) => {
    if (valuesProp === undefined) setUncontrolledValues(next);
    onValuesChange?.(next);
  };
  const [submitted, setSubmitted] = React.useState(defaultSubmitted);
  const [createMore, setCreateMore] = React.useState(false);
  // The last item made while "Create more" kept the dialog open, confirmed in a live region.
  const [lastCreated, setLastCreated] = React.useState<string | null>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);

  // A fresh form each time the dialog opens, however it was closed, with the current `defaultValues`.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      if (valuesProp === undefined) setUncontrolledValues(toForm(defaultValues, stages));
      setSubmitted(false);
      setLastCreated(null);
    }
  }

  const titleMissing = values.title.trim() === '';

  function setOpen(next: boolean) {
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  function setField<Key extends keyof NewItemValues>(key: Key, value: NewItemValues[Key]) {
    setValues({ ...values, [key]: value });
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (titleMissing) return titleRef.current?.focus();
    const title = values.title.trim();
    onCreate?.({ ...values, title, description: values.description.trim() });
    if (createMore) {
      // Keep the stage, area, assignee and target for the next item in the same batch.
      setValues({ ...values, title: '', description: '' });
      setSubmitted(false);
      setLastCreated(title);
      titleRef.current?.focus();
    } else {
      setOpen(false);
    }
  }

  const stage = stages.find((option) => option.value === values.stage);
  const area = areas.find((option) => option.value === values.area);
  const assignee = people.find((person) => person.id === values.assignee);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={modal}>
      {trigger === null ? null : trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger render={<Button variant="primary" />}>
          <Plus aria-hidden data-icon="inline-start" />
          New item
        </DialogTrigger>
      )}
      <DialogContent container={container} initialFocus={initialFocus ?? titleRef} className="max-w-[34rem]">
        <form noValidate onSubmit={submit} className="@container/form flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>New roadmap item</DialogTitle>
            <DialogDescription>Add a feature to the roadmap. Only the title is required.</DialogDescription>
            {/* Stays in the accessibility tree while empty, so the first confirmation is announced. */}
            <p role="status" className="flex min-w-0 items-center gap-1.5 text-small text-foreground empty:sr-only">
              {lastCreated ? (
                <>
                  <CircleCheck aria-hidden className="size-3.5 shrink-0 text-success" />
                  <span className="min-w-0 truncate">Created {lastCreated}</span>
                </>
              ) : null}
            </p>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <Field invalid={submitted && titleMissing}>
              <FieldLabel>Title</FieldLabel>
              <Input
                ref={titleRef}
                name="title"
                required
                autoComplete="off"
                placeholder="Shareable dashboard links"
                value={values.title}
                onValueChange={(value) => setField('title', value)}
              />
              <FieldError>Enter a title for the item.</FieldError>
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                name="description"
                placeholder="What customers asked for, and why it matters"
                className="max-h-40"
                value={values.description}
                onValueChange={(value) => setField('description', String(value))}
              />
            </Field>
            <div className="grid grid-cols-1 gap-x-3 gap-y-4 border-t border-border pt-4 @xs/form:grid-cols-2">
              <Field>
                <FieldLabel nativeLabel={false} render={<div />}>
                  Stage
                </FieldLabel>
                <Select
                  value={values.stage}
                  onValueChange={(value) => setField('stage', value as string)}
                  items={stages.map((option) => ({ value: option.value, label: option.label }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{() => <StageLabel stage={stage} />}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <StageLabel stage={option} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel nativeLabel={false} render={<div />}>
                  Area
                </FieldLabel>
                <Select
                  value={values.area}
                  onValueChange={(value) => setField('area', value as string | null)}
                  items={[{ value: null, label: 'No area' }, ...areas.map((option) => ({ value: option.value, label: option.label }))]}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{() => <AreaLabel area={area} />}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>
                      <AreaLabel area={undefined} />
                    </SelectItem>
                    {areas.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <AreaLabel area={option} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel nativeLabel={false} render={<div />}>
                  Assignee
                </FieldLabel>
                <Select
                  value={values.assignee}
                  onValueChange={(value) => setField('assignee', value as string | null)}
                  items={[{ value: null, label: 'Unassigned' }, ...people.map((person) => ({ value: person.id, label: person.name }))]}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{() => <PersonLabel person={assignee} />}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>
                      <PersonLabel person={undefined} />
                    </SelectItem>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        <PersonLabel person={person} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel nativeLabel={false} render={<div />}>
                  Target
                </FieldLabel>
                <Select
                  value={values.target}
                  onValueChange={(value) => setField('target', value as string | null)}
                  items={[{ value: null, label: 'No target' }, ...targets.map((target) => ({ value: target, label: target }))]}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{() => <TargetLabel target={values.target} />}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>
                      <TargetLabel target={null} />
                    </SelectItem>
                    {targets.map((target) => (
                      <SelectItem key={target} value={target}>
                        <TargetLabel target={target} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </DialogBody>
          <DialogFooter className="mt-4 flex-row flex-wrap items-center justify-end">
            <label className="flex w-full items-center gap-2 py-1 text-body text-muted-foreground @sm/form:me-auto @sm/form:w-auto">
              <Switch checked={createMore} onCheckedChange={setCreateMore} />
              Create more
            </label>
            <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
            <Button type="submit" variant="primary">
              Create item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export {
  NewItemDialog,
  type NewItemArea,
  type NewItemDialogProps,
  type NewItemPerson,
  type NewItemStage,
  type NewItemValues,
};
