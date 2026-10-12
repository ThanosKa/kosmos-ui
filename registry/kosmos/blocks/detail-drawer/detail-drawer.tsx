'use client';

import { Copy, Globe, Hash, MoreHorizontal, Server, Smartphone, Trash2, XIcon, type LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
import { Badge, type BadgeProps } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { Sparkline } from '@/registry/kosmos/ui/chart';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from '@/registry/kosmos/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/kosmos/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';
import { Separator } from '@/registry/kosmos/ui/separator';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';
import { Textarea } from '@/registry/kosmos/ui/textarea';

type DetailStatus = 'live' | 'trial' | 'paused';
type DetailPlan = 'free' | 'pro' | 'scale';
type DetailPlatform = 'web' | 'ios' | 'android' | 'server';
type DetailPerson = { name: string; initials: string };
type DetailAction = 'copy-link' | 'copy-id' | 'delete';

type DetailActivity = {
  id: string;
  author: DetailPerson;
  /** What happened, after the author's name: "paused the project". Leave out for a note. */
  action?: string;
  /** The note's text. */
  body?: string;
  /** Already formatted for display, such as "2h ago". */
  time: string;
};

/** Shaped like a project in the data table block, plus the fields only the drawer shows. */
type DetailProject = {
  id: string;
  name: string;
  domain?: string;
  platform?: DetailPlatform;
  plan?: DetailPlan;
  status: DetailStatus;
  /** Monthly active users. */
  users?: number;
  /** Events received in the last 30 days. */
  events?: number;
  /** Monthly recurring revenue, in dollars. */
  mrr?: number;
  /** The day of the last event, as an ISO date (`2026-10-11`). */
  lastEventAt?: string;
  /** A line under the name, such as when the project was added. */
  meta?: string;
  /** Events per day, oldest first, with each day as an ISO date. */
  trend?: { date: string; events: number }[];
  notes?: string;
  /** Changes and notes, oldest first. */
  activity?: DetailActivity[];
};

// Sample data: replace it with the record your page opens.
const kai = { name: 'Kai Nakamura', initials: 'KN' };
const tomas = { name: 'Tomás Ortega', initials: 'TO' };
const lena = { name: 'Lena Park', initials: 'LP' };

/** Events per day from September 12 to October 11, 2026: 2,391,700 in all, with a storm in early October. */
const cirrusEvents = [
  73100, 73400, 65400, 65700, 66100, 66400, 66700, 75300, 75700, 67700, 68000, 68300, 68600, 69000, 77600, 77900, 69900,
  70300, 70600, 113500, 149600, 151800, 112300, 72200, 72500, 72900, 73200, 73500, 82100, 82400,
];

const sampleProject: DetailProject = {
  id: 'cirrus',
  name: 'Cirrus Weather',
  domain: 'cirrus.example',
  platform: 'ios',
  plan: 'pro',
  status: 'live',
  users: 22560,
  events: 2391700,
  mrr: 390,
  lastEventAt: '2026-10-11',
  meta: 'Added on March 3, 2025',
  trend: cirrusEvents.map((events, index) => ({
    date: new Date(Date.UTC(2026, 8, 12 + index)).toISOString().slice(0, 10),
    events,
  })),
  notes: 'Sends events from the iOS app only. Their Android app launches in November, on the same project.',
  activity: [
    { id: 'a1', author: kai, action: 'changed the plan to Pro', time: 'Sep 2' },
    { id: 'a2', author: tomas, body: 'Events doubled during the storm on October 2. Raised their rate limit so nothing was dropped.', time: 'Oct 3' },
    { id: 'a3', author: lena, body: 'Asked them for a case study on the mobile SDK.', time: 'Oct 9' },
  ],
};

const statuses: Record<DetailStatus, { label: string; dot: string }> = {
  live: { label: 'Live', dot: 'bg-success' },
  trial: { label: 'Trial', dot: 'bg-muted-foreground' },
  paused: { label: 'Paused', dot: 'bg-warning' },
};
const statusItems = Object.fromEntries(Object.entries(statuses).map(([key, value]) => [key, value.label]));

const plans: Record<DetailPlan, { label: string; variant: BadgeProps['variant'] }> = {
  free: { label: 'Free', variant: 'blue' },
  pro: { label: 'Pro', variant: 'orange' },
  scale: { label: 'Scale', variant: 'magenta' },
};

const platforms: Record<DetailPlatform, { label: string; icon: LucideIcon }> = {
  web: { label: 'Web', icon: Globe },
  ios: { label: 'iOS', icon: Smartphone },
  android: { label: 'Android', icon: Smartphone },
  server: { label: 'Server', icon: Server },
};

// Fixed locale and time zone, so the server and the browser render the same text.
const count = new Intl.NumberFormat('en-US');
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const shortDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

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

/** A dash for a missing number, read as "None". */
function NoValue() {
  return (
    <>
      <span aria-hidden className="text-muted-foreground">–</span>
      <span className="sr-only">None</span>
    </>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-caption font-medium tracking-[0.05em] text-muted-foreground uppercase">{children}</h3>;
}

function EventsTrend({ trend }: { trend: NonNullable<DetailProject['trend']> }) {
  const first = toDate(trend[0].date);
  const last = toDate(trend[trend.length - 1].date);
  const peak = trend.reduce((top, point) => (point.events > top.events ? point : top), trend[0]);
  return (
    <figure className="m-0 flex flex-col gap-1.5">
      <Sparkline
        data={trend}
        dataKey="events"
        aria-label={`Events per day from ${shortDay.format(first)} to ${shortDay.format(last)}, highest on ${shortDay.format(toDate(peak.date))} with ${count.format(peak.events)}`}
        className="h-16 w-full"
      />
      <figcaption className="flex justify-between gap-2 text-caption text-muted-foreground tabular-nums">
        <time dateTime={trend[0].date}>{shortDay.format(first)}</time>
        <span>Events per day</span>
        <time dateTime={trend[trend.length - 1].date}>{shortDay.format(last)}</time>
      </figcaption>
    </figure>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 pb-5" aria-hidden>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <div className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <React.Fragment key={index}>
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-32" />
          </React.Fragment>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

type DetailDrawerProps = {
  /** The record to show. Defaults to a sample project. */
  project?: DetailProject;
  /** Shows placeholders while the record loads. */
  loading?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The element that opens the drawer. Defaults to an "Open project" button; pass `null` to open it only through `open`. */
  trigger?: React.ReactElement | null;
  /** Called with the updated record when its status changes in the drawer. */
  onProjectChange?: (project: DetailProject) => void;
  /**
   * Called with the text of a new note. Add it to `project.activity` yourself: with this prop set,
   * the drawer shows only the activity you pass. Without it, new notes are kept in the drawer.
   */
  onNote?: (body: string) => void;
  /** Shows the more menu (Copy link, Copy project ID, Delete project) and is called by its items. Ask before deleting. */
  onAction?: (action: DetailAction, project: DetailProject) => void;
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
 * A side panel with one project: its status (editable), plan, platform and last event, its users,
 * events and revenue over the last 30 days with an events trend, notes and the team's activity, with
 * a field to add a note and a menu of actions. It slides in from the end edge and closes with Escape,
 * a click outside, a swipe or the close button.
 */
function DetailDrawer({
  project = sampleProject,
  loading = false,
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  onProjectChange,
  onNote,
  onAction,
  actionsMenu,
  modal = true,
  container,
  initialFocus,
}: DetailDrawerProps) {
  // Edits made in the drawer, kept until another record opens. A status edit lasts only until the
  // `project` prop brings a status of its own: a change from outside always wins.
  const [local, setLocal] = React.useState<{
    id: string;
    propStatus: DetailStatus;
    status?: DetailStatus;
    notes: DetailActivity[];
  }>({ id: project.id, propStatus: project.status, notes: [] });
  if (local.id !== project.id) setLocal({ id: project.id, propStatus: project.status, notes: [] });
  else if (local.propStatus !== project.status) setLocal({ ...local, propStatus: project.status, status: undefined });
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

  const status = local.status ?? project.status;
  const activity = [...(project.activity ?? []), ...local.notes];
  const shown = { ...project, status };
  const platform = project.platform ? platforms[project.platform] : undefined;
  const usage = [
    { label: 'Active users', value: project.users === undefined ? undefined : count.format(project.users) },
    { label: 'Events', value: project.events === undefined ? undefined : count.format(project.events) },
    { label: 'MRR', value: project.mrr ? usd.format(project.mrr) : undefined },
  ];

  function changeStatus(next: DetailStatus) {
    setLocal({ ...local, status: next });
    onProjectChange?.({ ...project, status: next });
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
        <DrawerTrigger render={<Button variant="secondary" />}>Open project</DrawerTrigger>
      )}
      <DrawerContent
        container={container}
        initialFocus={initialFocus}
        showCloseButton={false}
        className="sm:data-[swipe-direction=left]:max-w-[28rem] sm:data-[swipe-direction=right]:max-w-[28rem]"
      >
        <div className="flex h-12 shrink-0 items-center gap-1 ps-5 pe-3">
          {loading ? (
            <DrawerTitle className="sr-only">Loading project</DrawerTitle>
          ) : (
            <span className="min-w-0 truncate text-caption text-muted-foreground">{project.domain}</span>
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
                  <DropdownMenuItem onClick={() => onAction('copy-id', shown)}>
                    <Hash aria-hidden />
                    Copy project ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onAction('delete', shown)}>
                    <Trash2 aria-hidden />
                    Delete project
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
                <DrawerTitle className="wrap-break-word">{project.name}</DrawerTitle>
                {project.meta ? <DrawerDescription>{project.meta}</DrawerDescription> : null}
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
                <Property label="Plan">
                  {project.plan ? (
                    <Badge variant={plans[project.plan].variant}>{plans[project.plan].label}</Badge>
                  ) : (
                    <Empty>No plan</Empty>
                  )}
                </Property>
                <Property label="Platform">
                  {platform ? (
                    <span className="flex items-center gap-2">
                      <platform.icon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                      {platform.label}
                    </span>
                  ) : (
                    <Empty>Not set</Empty>
                  )}
                </Property>
                <Property label="Last event">
                  {project.lastEventAt ? (
                    <time dateTime={project.lastEventAt} className="tabular-nums">
                      {day.format(toDate(project.lastEventAt))}
                    </time>
                  ) : (
                    <Empty>No events yet</Empty>
                  )}
                </Property>
              </dl>

              <div className="p-5">
                <Separator />
              </div>

              <section className="flex flex-col gap-3 px-5">
                <SectionHeading>Last 30 days</SectionHeading>
                <dl className="grid grid-cols-3 gap-4">
                  {usage.map((item) => (
                    <div key={item.label} className="flex min-w-0 flex-col gap-0.5">
                      <dt className="text-small text-muted-foreground">{item.label}</dt>
                      <dd className="text-title font-medium tabular-nums wrap-break-word">{item.value ?? <NoValue />}</dd>
                    </div>
                  ))}
                </dl>
                {project.trend?.length ? (
                  <EventsTrend trend={project.trend} />
                ) : (
                  <p className="text-body text-muted-foreground">No events in the last 30 days.</p>
                )}
              </section>

              <div className="p-5">
                <Separator />
              </div>

              <section className="flex flex-col gap-2 px-5">
                <SectionHeading>Notes</SectionHeading>
                {project.notes ? (
                  <p className="text-body text-pretty wrap-break-word">{project.notes}</p>
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
  sampleProject,
  type DetailAction,
  type DetailActivity,
  type DetailDrawerProps,
  type DetailPerson,
  type DetailPlan,
  type DetailPlatform,
  type DetailProject,
  type DetailStatus,
};
