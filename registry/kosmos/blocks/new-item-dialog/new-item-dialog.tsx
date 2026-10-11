'use client';

import { CircleCheck, CircleDashed, Plus } from 'lucide-react';
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
import { Field, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';
import { Switch } from '@/registry/kosmos/ui/switch';
import { Textarea } from '@/registry/kosmos/ui/textarea';

type NewItemStatus = 'trial' | 'active' | 'at-risk' | 'churned';
type NewItemPerson = { id: string; name: string; initials: string };

/** What `onCreate` receives. Shaped like an account in the data table block. */
type NewItemValues = {
  name: string;
  /** Lowercase, or an empty string. */
  domain: string;
  status: NewItemStatus;
  /** The `id` of a person in `people`, or `null` for no owner. */
  owner: string | null;
  /** Annual recurring revenue in dollars, or `null` when left blank. */
  arr: number | null;
  notes: string;
};

/** The form's own state: the text fields as typed. */
type FormValues = Omit<NewItemValues, 'arr'> & { arr: string };

// Sample data: replace it with your workspace's people.
const samplePeople: NewItemPerson[] = [
  { id: 'maya', name: 'Maya Chen', initials: 'MC' },
  { id: 'jonas', name: 'Jonas Weber', initials: 'JW' },
  { id: 'priya', name: 'Priya Raman', initials: 'PR' },
];

const statuses: Record<NewItemStatus, { label: string; dot: string }> = {
  trial: { label: 'Trial', dot: 'bg-muted-foreground' },
  active: { label: 'Active', dot: 'bg-success' },
  'at-risk': { label: 'At risk', dot: 'bg-warning' },
  churned: { label: 'Churned', dot: 'bg-destructive' },
};
const statusItems = Object.fromEntries(Object.entries(statuses).map(([key, value]) => [key, value.label]));

const emptyValues: FormValues = { name: '', domain: '', status: 'trial', owner: null, arr: '', notes: '' };

/** A hostname with at least one dot and no spaces or scheme, such as `northwind.example`. */
const domainPattern = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

function StatusLabel({ status }: { status: NewItemStatus }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span aria-hidden className={cn('size-2 shrink-0 rounded-full', statuses[status].dot)} />
      <span className="truncate">{statuses[status].label}</span>
    </span>
  );
}

function PersonLabel({ person }: { person: NewItemPerson | undefined }) {
  if (!person) {
    return (
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <CircleDashed aria-hidden className="size-4 shrink-0" />
        <span className="truncate">No owner</span>
      </span>
    );
  }
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar size="sm" className="size-5" aria-hidden>
        <AvatarFallback>{person.initials}</AvatarFallback>
      </Avatar>
      <span className="truncate">{person.name}</span>
    </span>
  );
}

type NewItemDialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Called with the form values when the record is created. */
  onCreate?: (values: NewItemValues) => void;
  /** The people who can own the record. */
  people?: NewItemPerson[];
  /** Values to start the form with each time it opens, such as the status of the board column it was opened from. */
  defaultValues?: Partial<NewItemValues>;
  /** The element that opens the dialog. Defaults to a "New account" button; pass `null` to open it only through `open`. */
  trigger?: React.ReactElement | null;
  /** Shows the validation errors from the start, as after a failed submit. For previews. */
  defaultSubmitted?: boolean;
  /** Blocks the page behind the dialog. Defaults to `true`. */
  modal?: boolean;
  /** The element the dialog renders into. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof DialogContent>['container'];
  /** Where focus goes when the dialog opens. Defaults to the name field. */
  initialFocus?: React.ComponentProps<typeof DialogContent>['initialFocus'];
};

function toForm(values: Partial<NewItemValues> | undefined): FormValues {
  const { arr, ...rest } = values ?? {};
  return { ...emptyValues, ...rest, arr: arr == null ? '' : String(arr) };
}

/**
 * A dialog with the form for a new record (a sample account): name, domain, status, owner, ARR and
 * notes. The name is required and the domain is checked; submitting with an error shows it and
 * moves focus to the field. With "Create more" on, the form clears and stays open for the next one.
 */
function NewItemDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onCreate,
  people = samplePeople,
  defaultValues,
  trigger,
  defaultSubmitted = false,
  modal = true,
  container,
  initialFocus,
}: NewItemDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const [values, setValues] = React.useState(() => toForm(defaultValues));
  const [submitted, setSubmitted] = React.useState(defaultSubmitted);
  const [createMore, setCreateMore] = React.useState(false);
  // The last record made while "Create more" kept the dialog open, confirmed in a live region.
  const [lastCreated, setLastCreated] = React.useState<string | null>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const domainRef = React.useRef<HTMLInputElement>(null);

  // A fresh form each time the dialog opens, however it was closed, with the current `defaultValues`.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValues(toForm(defaultValues));
      setSubmitted(false);
      setLastCreated(null);
    }
  }

  const nameMissing = values.name.trim() === '';
  const domain = values.domain.trim().toLowerCase();
  const domainInvalid = domain !== '' && !domainPattern.test(domain);

  function setOpen(next: boolean) {
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  function setField<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (nameMissing) return nameRef.current?.focus();
    if (domainInvalid) return domainRef.current?.focus();
    const name = values.name.trim();
    const arr = values.arr.trim() === '' ? null : Math.max(0, Math.round(Number(values.arr)));
    onCreate?.({ ...values, name, domain, arr: Number.isFinite(arr) ? arr : null, notes: values.notes.trim() });
    if (createMore) {
      // Keep status and owner for the next record in the same batch.
      setValues((current) => ({ ...current, name: '', domain: '', arr: '', notes: '' }));
      setSubmitted(false);
      setLastCreated(name);
      nameRef.current?.focus();
    } else {
      setOpen(false);
    }
  }

  const owner = people.find((person) => person.id === values.owner);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={modal}>
      {trigger === null ? null : trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger render={<Button variant="primary" />}>
          <Plus aria-hidden data-icon="inline-start" />
          New account
        </DialogTrigger>
      )}
      <DialogContent container={container} initialFocus={initialFocus ?? nameRef} className="max-w-[34rem]">
        <form noValidate onSubmit={submit} className="@container/form flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>New account</DialogTitle>
            <DialogDescription>Add a customer to the workspace. Only the name is required.</DialogDescription>
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
          <DialogBody className="flex flex-col gap-4 pb-1">
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 @md/form:grid-cols-2">
              <Field invalid={submitted && nameMissing}>
                <FieldLabel>Name</FieldLabel>
                <Input
                  ref={nameRef}
                  name="name"
                  required
                  autoComplete="organization"
                  placeholder="Northwind Traders"
                  value={values.name}
                  onValueChange={(value) => setField('name', value)}
                />
                <FieldError>Enter the account’s name.</FieldError>
              </Field>
              <Field invalid={submitted && domainInvalid}>
                <FieldLabel>Domain</FieldLabel>
                <Input
                  ref={domainRef}
                  name="domain"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="northwind.example"
                  value={values.domain}
                  onValueChange={(value) => setField('domain', value)}
                />
                <FieldError>Enter a domain without https://, such as northwind.example.</FieldError>
              </Field>
              <Field>
                <FieldLabel nativeLabel={false} render={<div />}>
                  Status
                </FieldLabel>
                <Select value={values.status} onValueChange={(value) => setField('status', value as NewItemStatus)} items={statusItems}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{() => <StatusLabel status={values.status} />}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(statuses) as NewItemStatus[]).map((value) => (
                      <SelectItem key={value} value={value}>
                        <StatusLabel status={value} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel nativeLabel={false} render={<div />}>
                  Owner
                </FieldLabel>
                <Select
                  value={values.owner}
                  onValueChange={(value) => setField('owner', value as string | null)}
                  items={[{ value: null, label: 'No owner' }, ...people.map((person) => ({ value: person.id, label: person.name }))]}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{() => <PersonLabel person={owner} />}</SelectValue>
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
                <FieldLabel>ARR</FieldLabel>
                <Input
                  type="number"
                  name="arr"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  placeholder="0"
                  className="tabular-nums"
                  value={values.arr}
                  onValueChange={(value) => setField('arr', value)}
                />
                <FieldDescription>Annual recurring revenue, in dollars.</FieldDescription>
              </Field>
            </div>
            <Field>
              <FieldLabel>Notes</FieldLabel>
              <Textarea
                name="notes"
                placeholder="Who you talked to, what they need, next steps"
                className="max-h-40"
                value={values.notes}
                onValueChange={(value) => setField('notes', String(value))}
              />
            </Field>
          </DialogBody>
          <DialogFooter className="mt-4 flex-row flex-wrap items-center justify-end">
            <label className="flex w-full items-center gap-2 py-1 text-body text-muted-foreground @sm/form:me-auto @sm/form:w-auto">
              <Switch checked={createMore} onCheckedChange={setCreateMore} />
              Create more
            </label>
            <DialogClose render={<Button variant="secondary" />}>Cancel</DialogClose>
            <Button type="submit" variant="primary">
              Create account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { NewItemDialog, type NewItemDialogProps, type NewItemPerson, type NewItemStatus, type NewItemValues };
