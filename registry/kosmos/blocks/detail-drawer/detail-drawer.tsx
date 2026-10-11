'use client';

import { Copy, CopyPlus, MoreHorizontal, Trash2, XIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from '@/registry/kosmos/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { Meter, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';
import { Separator } from '@/registry/kosmos/ui/separator';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
import { Textarea } from '@/registry/kosmos/ui/textarea';

type DetailStatus = 'trial' | 'active' | 'at-risk' | 'churned';
type DetailPerson = { name: string; initials: string };
type DetailAction = 'copy-link' | 'duplicate' | 'delete';

type DetailActivity = {
  id: string;
  author: DetailPerson;
  /** What happened, after the author's name: "changed the status to At risk". Leave out for a note. */
  action?: string;
  /** The note's text. */
  body?: string;
  /** Already formatted for display, such as "2h ago". */
  time: string;
};

/** Shaped like an account in the data table block, plus the fields only the drawer shows. */
type DetailAccount = {
  id: string;
  name: string;
  domain?: string;
  status: DetailStatus;
  owner?: DetailPerson;
  /** Annual recurring revenue, in dollars. */
  arr?: number;
  /** Health score from 0 to 100. */
  health?: number;
  /** The day of the last activity, as an ISO date (`2026-10-09`). */
  lastActivity?: string;
  /** A line under the name, such as the plan and how long they have been a customer. */
  meta?: string;
  labels?: string[];
  notes?: string;
  /** Changes and notes, oldest first. */
  activity?: DetailActivity[];
};

// Sample data: replace it with the record your page opens.
const maya = { name: 'Maya Chen', initials: 'MC' };
const jonas = { name: 'Jonas Weber', initials: 'JW' };

const sampleAccount: DetailAccount = {
  id: 'bluebird',
  name: 'Bluebird Labs',
  domain: 'bluebird.example',
  status: 'at-risk',
  owner: jonas,
  arr: 96500,
  health: 38,
  lastActivity: '2026-09-21',
  meta: 'Business plan · customer since March 2024',
  labels: ['Enterprise', 'Renewal in Q1'],
  notes: 'Usage dropped by a third after their team moved to a new data warehouse. The renewal is due in January.',
  activity: [
    { id: 'a1', author: maya, action: 'changed the status to At risk', time: 'Sep 21' },
    { id: 'a2', author: jonas, body: 'Booked a call with their head of data for Thursday to plan the migration.', time: 'Sep 22' },
    { id: 'a3', author: maya, action: 'assigned the account to Jonas Weber', time: 'Sep 23' },
  ],
};

const statuses: Record<DetailStatus, { label: string; dot: string }> = {
  trial: { label: 'Trial', dot: 'bg-muted-foreground' },
  active: { label: 'Active', dot: 'bg-success' },
  'at-risk': { label: 'At risk', dot: 'bg-warning' },
  churned: { label: 'Churned', dot: 'bg-destructive' },
};
const statusItems = Object.fromEntries(Object.entries(statuses).map(([key, value]) => [key, value.label]));

// Fixed locale and time zone, so the server and the browser render the same text.
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const formatDay = (iso: string) => day.format(new Date(`${iso}T00:00:00Z`));

type MenuProps = Omit<React.ComponentProps<typeof DropdownMenu>, 'children'>;

function PersonAvatar({ person }: { person: DetailPerson }) {
  return (
    // The name is always beside it, so the initials stay out of the accessibility tree.
    <Avatar size="sm" aria-hidden>
      <AvatarFallback>{person.initials}</AvatarFallback>
    </Avatar>
  );
}

function StatusLabel({ status }: { status: DetailStatus }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span aria-hidden className={cn('size-2 shrink-0 rounded-full', statuses[status].dot)} />
      <span className="truncate">{statuses[status].label}</span>
    </span>
  );
}

function Property({ label, labelId, children }: { label: string; labelId?: string; children: React.ReactNode }) {
  return (
    <div className="contents">
      <dt id={labelId} className="flex h-7.5 items-center text-muted-foreground">
        {label}
      </dt>
      <dd className="flex min-h-7.5 min-w-0 flex-wrap items-center gap-1.5">{children}</dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-caption font-medium tracking-[0.05em] text-muted-foreground uppercase">{children}</h3>;
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 pb-5" aria-hidden>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <div className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <React.Fragment key={index}>
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-32" />
          </React.Fragment>
        ))}
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

type DetailDrawerProps = {
  /** The record to show. Defaults to a sample account. */
  account?: DetailAccount;
  /** Shows placeholders while the record loads. */
  loading?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The element that opens the drawer. Defaults to an "Open account" button; pass `null` to open it only through `open`. */
  trigger?: React.ReactElement | null;
  /** Called with the updated record when its status changes in the drawer. */
  onAccountChange?: (account: DetailAccount) => void;
  /**
   * Called with the text of a new note. Add it to `account.activity` yourself: with this prop set,
   * the drawer shows only the activity you pass. Without it, new notes are kept in the drawer.
   */
  onNote?: (body: string) => void;
  /** Shows the more menu (Copy link, Duplicate, Delete account) and is called by its items. Ask before deleting. */
  onAction?: (action: DetailAction, account: DetailAccount) => void;
  /** Root props for the more menu, such as `{ open: true, modal: false }` to pin it open in a preview. */
  actionsMenu?: MenuProps;
  /** Blocks the page behind the drawer. Defaults to `true`. */
  modal?: boolean;
  /** The element the drawer renders into. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof DrawerContent>['container'];
  /** Where focus goes when the drawer opens. Defaults to the drawer itself. */
  initialFocus?: React.ComponentProps<typeof DrawerContent>['initialFocus'];
};

/**
 * A side panel with the details of one record: its status (editable), owner, ARR, health, last
 * activity, labels, notes and activity, with a field to add a note and a menu of actions. It slides
 * in from the end edge and closes with Escape, a click outside, a swipe or the close button.
 */
function DetailDrawer({
  account = sampleAccount,
  loading = false,
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  onAccountChange,
  onNote,
  onAction,
  actionsMenu,
  modal = true,
  container,
  initialFocus,
}: DetailDrawerProps) {
  // Edits made in the drawer, kept until another record opens. A status edit lasts only until the
  // `account` prop brings a status of its own: a change from outside always wins.
  const [local, setLocal] = React.useState<{
    id: string;
    propStatus: DetailStatus;
    status?: DetailStatus;
    notes: DetailActivity[];
  }>({ id: account.id, propStatus: account.status, notes: [] });
  if (local.id !== account.id) setLocal({ id: account.id, propStatus: account.status, notes: [] });
  else if (local.propStatus !== account.status) setLocal({ ...local, propStatus: account.status, status: undefined });
  const [draft, setDraft] = React.useState('');
  const statusLabelId = React.useId();
  const noteId = React.useId();
  const noteRef = React.useRef<HTMLTextAreaElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  // Bring a note added here into view at the end of the activity.
  const noteCount = local.notes.length;
  React.useEffect(() => {
    if (noteCount > 0) bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [noteCount]);

  const status = local.status ?? account.status;
  const activity = [...(account.activity ?? []), ...local.notes];
  const shown = { ...account, status };

  function changeStatus(next: DetailStatus) {
    setLocal({ ...local, status: next });
    onAccountChange?.({ ...account, status: next });
  }

  function submitNote(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) {
      noteRef.current?.focus();
      return;
    }
    if (onNote) onNote(body);
    else {
      setLocal({
        ...local,
        notes: [...local.notes, { id: `note-${local.notes.length}`, author: { name: 'You', initials: 'YO' }, body, time: 'Just now' }],
      });
    }
    setDraft('');
  }

  return (
    <Drawer open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      {trigger === null ? null : trigger ? (
        <DrawerTrigger render={trigger} />
      ) : (
        <DrawerTrigger render={<Button variant="secondary" />}>Open account</DrawerTrigger>
      )}
      <DrawerContent
        container={container}
        initialFocus={initialFocus}
        showCloseButton={false}
        className="sm:data-[swipe-direction=left]:w-[28rem] sm:data-[swipe-direction=right]:w-[28rem]"
      >
        <div className="flex h-12 shrink-0 items-center gap-1 ps-5 pe-3">
          {loading ? (
            <DrawerTitle className="sr-only">Loading account</DrawerTitle>
          ) : (
            <span className="min-w-0 truncate text-caption text-muted-foreground">{account.domain}</span>
          )}
          <div className="ms-auto flex shrink-0 items-center gap-1">
            {loading || !onAction ? null : (
              <DropdownMenu {...actionsMenu}>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="More actions" />}
                >
                  <MoreHorizontal aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" container={container}>
                  <DropdownMenuItem onClick={() => onAction('copy-link', shown)}>
                    <Copy aria-hidden />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAction('duplicate', shown)}>
                    <CopyPlus aria-hidden />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onAction('delete', shown)}>
                    <Trash2 aria-hidden />
                    Delete account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <DrawerClose
              aria-label="Close"
              render={<Button variant="ghost" size="icon-sm" className="relative text-muted-foreground after:absolute after:-inset-1" />}
            >
              <XIcon aria-hidden />
            </DrawerClose>
          </div>
        </div>

        {loading ? (
          <DetailSkeleton />
        ) : (
          <>
            <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="flex flex-col gap-1 px-5">
                <DrawerTitle className="wrap-break-word">{account.name}</DrawerTitle>
                {account.meta ? <DrawerDescription>{account.meta}</DrawerDescription> : null}
              </div>

              <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 px-5 pt-5 text-body">
                <Property label="Status" labelId={statusLabelId}>
                  <Select value={status} onValueChange={(value) => changeStatus(value as DetailStatus)} items={statusItems}>
                    <SelectTrigger aria-labelledby={statusLabelId} className="min-w-36">
                      <SelectValue>{() => <StatusLabel status={status} />}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(statuses) as DetailStatus[]).map((value) => (
                        <SelectItem key={value} value={value}>
                          <StatusLabel status={value} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Property>
                <Property label="Owner">
                  {account.owner ? (
                    <span className="flex min-w-0 items-center gap-2">
                      <PersonAvatar person={account.owner} />
                      <span className="min-w-0 wrap-break-word">{account.owner.name}</span>
                    </span>
                  ) : (
                    <Empty>No owner</Empty>
                  )}
                </Property>
                <Property label="ARR">
                  {account.arr ? <span className="tabular-nums">{usd.format(account.arr)}</span> : <Empty>None yet</Empty>}
                </Property>
                <Property label="Health">
                  {account.health !== undefined ? (
                    <Meter
                      value={account.health}
                      tone="auto"
                      aria-label="Health"
                      className="w-40 grid-cols-[minmax(0,1fr)_2rem] items-center gap-y-0"
                    >
                      <MeterSegments count={10} className="col-span-1 h-3" />
                      <MeterValue className="row-start-1 text-end text-caption" />
                    </Meter>
                  ) : (
                    <Empty>Not scored</Empty>
                  )}
                </Property>
                <Property label="Last activity">
                  {account.lastActivity ? (
                    <span className="tabular-nums">{formatDay(account.lastActivity)}</span>
                  ) : (
                    <Empty>None</Empty>
                  )}
                </Property>
                <Property label="Labels">
                  {account.labels?.length ? (
                    account.labels.map((label) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    ))
                  ) : (
                    <Empty>None</Empty>
                  )}
                </Property>
              </dl>

              <div className="p-5">
                <Separator />
              </div>

              <section className="flex flex-col gap-2 px-5">
                <SectionHeading>Notes</SectionHeading>
                {account.notes ? (
                  <p className="text-body text-pretty wrap-break-word">{account.notes}</p>
                ) : (
                  <p className="text-body text-muted-foreground">No notes yet.</p>
                )}
              </section>

              <div className="p-5">
                <Separator />
              </div>

              <section className="flex flex-col gap-3 px-5 pb-5">
                <SectionHeading>Activity</SectionHeading>
                {activity.length ? (
                  <ol className="flex flex-col gap-4">
                    {activity.map((entry) => (
                      <li key={entry.id} className="flex gap-3">
                        {/* Centered on the first line of the 13px meta text. */}
                        <div className="flex h-[1lh] shrink-0 items-center text-small">
                          <PersonAvatar person={entry.author} />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <p className="text-small text-muted-foreground">
                            <span className="font-medium text-foreground">{entry.author.name}</span>
                            {entry.action ? ` ${entry.action}` : null}
                            <span aria-hidden> · </span>
                            <span className="sr-only">, </span>
                            <span className="tabular-nums">{entry.time}</span>
                          </p>
                          {entry.body ? (
                            <p className="rounded-xl bg-muted px-3 py-2 text-body text-pretty wrap-break-word">{entry.body}</p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-body text-muted-foreground">No activity yet.</p>
                )}
              </section>
            </div>

            <form onSubmit={submitNote} className="flex shrink-0 items-end gap-2 border-t border-border px-5 py-4">
              <label htmlFor={noteId} className="sr-only">
                Add a note
              </label>
              <Textarea
                id={noteId}
                ref={noteRef}
                value={draft}
                onValueChange={(value) => setDraft(String(value))}
                placeholder="Add a note…"
                className="max-h-32 min-h-7.5 resize-none py-[5px]"
                onKeyDown={(event) => {
                  // ⌘Enter or Ctrl+Enter adds the note, as in most comment fields.
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <Button type="submit" variant="primary">
                Add note
              </Button>
            </form>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export {
  DetailDrawer,
  type DetailAccount,
  type DetailAction,
  type DetailActivity,
  type DetailDrawerProps,
  type DetailPerson,
  type DetailStatus,
};
