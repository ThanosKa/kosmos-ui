'use client';

import {
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Plus,
  SignalHigh,
  SignalLow,
  SignalMedium,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
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

type NewItemStatus = 'backlog' | 'todo' | 'in-progress' | 'done';
type NewItemPriority = 'low' | 'medium' | 'high' | 'urgent';
type NewItemPerson = { id: string; name: string; initials: string };

type NewItemValues = {
  title: string;
  description: string;
  status: NewItemStatus;
  priority: NewItemPriority;
  /** The `id` of a person in `people`, or `null` when unassigned. */
  assignee: string | null;
  /** `YYYY-MM-DD`, or an empty string. */
  due: string;
};

type Option = { label: string; icon: LucideIcon; className: string };

const statuses: Record<NewItemStatus, Option> = {
  backlog: { label: 'Backlog', icon: CircleDashed, className: 'text-muted-foreground' },
  todo: { label: 'To do', icon: Circle, className: 'text-foreground' },
  'in-progress': { label: 'In progress', icon: CircleDot, className: 'text-warning' },
  done: { label: 'Done', icon: CircleCheck, className: 'text-success' },
};

const priorities: Record<NewItemPriority, Option> = {
  low: { label: 'Low', icon: SignalLow, className: 'text-muted-foreground' },
  medium: { label: 'Medium', icon: SignalMedium, className: 'text-muted-foreground' },
  high: { label: 'High', icon: SignalHigh, className: 'text-foreground' },
  urgent: { label: 'Urgent', icon: TriangleAlert, className: 'text-destructive' },
};

const defaultPeople: NewItemPerson[] = [
  { id: 'maya', name: 'Maya Chen', initials: 'MC' },
  { id: 'leo', name: 'Leo Park', initials: 'LP' },
  { id: 'sam', name: 'Sam Rivera', initials: 'SR' },
];

const emptyValues: NewItemValues = { title: '', description: '', status: 'todo', priority: 'medium', assignee: null, due: '' };

function OptionLabel({ icon: Icon, className, label }: Option) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon aria-hidden className={cn('size-4 shrink-0', className)} />
      <span className="truncate">{label}</span>
    </span>
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
      <Avatar size="sm" className="size-5">
        <AvatarFallback>{person.initials}</AvatarFallback>
      </Avatar>
      <span className="truncate">{person.name}</span>
    </span>
  );
}

function OptionSelect<Value extends string>({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: Value;
  onValueChange: (value: Value) => void;
  options: Record<Value, Option>;
}) {
  const entries = Object.entries(options) as [Value, Option][];
  return (
    <Field>
      <FieldLabel nativeLabel={false} render={<div />}>
        {label}
      </FieldLabel>
      <Select
        value={value}
        onValueChange={(next) => onValueChange(next as Value)}
        items={Object.fromEntries(entries.map(([key, option]) => [key, option.label]))}
      >
        <SelectTrigger className="w-full">
          <SelectValue>{() => <OptionLabel {...options[value]} />}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {entries.map(([key, option]) => (
            <SelectItem key={key} value={key}>
              <OptionLabel {...option} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

type NewItemDialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called with the form values when the task is created. */
  onCreate?: (values: NewItemValues) => void;
  /** The people the task can be assigned to. */
  people?: NewItemPerson[];
  /** Values to start the form with, such as the status of the column it was opened from. */
  defaultValues?: Partial<NewItemValues>;
  /** The element that opens the dialog. Defaults to a "New task" button; pass `null` to open it only through `open`. */
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

/**
 * A dialog with the form for a new task: title, description, status, priority, assignee and due
 * date. The title is required; submitting without one shows the error and moves focus to it.
 * With "Create more" on, the form clears and stays open for the next task.
 */
function NewItemDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onCreate,
  people = defaultPeople,
  defaultValues,
  trigger,
  defaultSubmitted = false,
  modal = true,
  container,
  initialFocus,
}: NewItemDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const start = React.useMemo(() => ({ ...emptyValues, ...defaultValues }), [defaultValues]);
  const [values, setValues] = React.useState(start);
  const [submitted, setSubmitted] = React.useState(defaultSubmitted);
  const [createMore, setCreateMore] = React.useState(false);
  // The last task made while "Create more" kept the dialog open, confirmed in a live region.
  const [lastCreated, setLastCreated] = React.useState<string | null>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);
  const titleMissing = values.title.trim() === '';

  function setOpen(next: boolean) {
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
    if (!next) {
      setValues(start);
      setSubmitted(false);
      setLastCreated(null);
    }
  }

  function set<Key extends keyof NewItemValues>(key: Key, value: NewItemValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (titleMissing) {
      titleRef.current?.focus();
      return;
    }
    const title = values.title.trim();
    onCreate?.({ ...values, title, description: values.description.trim() });
    if (createMore) {
      setLastCreated(title);
      // Keep status, priority and assignee for the next task in the same batch.
      setValues((current) => ({ ...current, title: '', description: '' }));
      setSubmitted(false);
      titleRef.current?.focus();
    } else {
      setOpen(false);
    }
  }

  const assignee = people.find((person) => person.id === values.assignee);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={modal}>
      {trigger === null ? null : trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger render={<Button variant="primary" />}>
          <Plus aria-hidden data-icon="inline-start" />
          New task
        </DialogTrigger>
      )}
      <DialogContent container={container} initialFocus={initialFocus ?? titleRef} className="max-w-[34rem]">
        <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>Add a task to the board. Only the title is required.</DialogDescription>
            <p role="status" className="flex min-w-0 items-center gap-1.5 text-small text-foreground empty:hidden">
              {lastCreated ? (
                <>
                  <CircleCheck aria-hidden className="size-3.5 shrink-0 text-success" />
                  <span className="min-w-0 truncate">Created “{lastCreated}”</span>
                </>
              ) : null}
            </p>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4 pb-1">
            <Field invalid={submitted && titleMissing}>
              <FieldLabel>Title</FieldLabel>
              <Input
                ref={titleRef}
                name="title"
                required
                autoComplete="off"
                placeholder="What needs to be done?"
                value={values.title}
                onValueChange={(value) => set('title', value)}
              />
              <FieldError>Enter a title for the task.</FieldError>
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                name="description"
                placeholder="Add details, steps or links"
                className="max-h-40"
                value={values.description}
                onValueChange={(value) => set('description', String(value))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4">
              <OptionSelect label="Status" value={values.status} onValueChange={(value) => set('status', value)} options={statuses} />
              <OptionSelect
                label="Priority"
                value={values.priority}
                onValueChange={(value) => set('priority', value)}
                options={priorities}
              />
              <Field>
                <FieldLabel nativeLabel={false} render={<div />}>
                  Assignee
                </FieldLabel>
                <Select
                  value={values.assignee}
                  onValueChange={(value) => set('assignee', value as string | null)}
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
                <FieldLabel>Due date</FieldLabel>
                <Input type="date" name="due" value={values.due} onValueChange={(value) => set('due', value)} />
              </Field>
            </div>
          </DialogBody>
          <DialogFooter className="mt-4 flex-row flex-wrap items-center justify-end">
            <label className="flex items-center gap-2 py-1 me-auto text-body text-muted-foreground">
              <Switch checked={createMore} onCheckedChange={setCreateMore} />
              Create more
            </label>
            <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
            <Button type="submit" variant="primary">
              Create task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { NewItemDialog, type NewItemDialogProps, type NewItemPerson, type NewItemPriority, type NewItemStatus, type NewItemValues };
