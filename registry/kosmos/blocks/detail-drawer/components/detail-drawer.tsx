'use client';

import {
  Calendar,
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Copy,
  CopyPlus,
  MoreHorizontal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Trash2,
  TriangleAlert,
  XIcon,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/registry/kosmos/ui/drawer';
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

type DetailStatus = 'backlog' | 'todo' | 'in-progress' | 'done';
type DetailPriority = 'low' | 'medium' | 'high' | 'urgent';
type DetailPerson = { name: string; initials: string };

type DetailActivity = {
  id: string;
  author: DetailPerson;
  /** What happened, after the author's name: "changed the status to In progress". Leave out for a comment. */
  action?: string;
  /** The comment text. */
  body?: string;
  /** Already formatted for display, such as "2h ago". */
  time: string;
};

type DetailTask = {
  id: string;
  title: string;
  /** Shown under the title, such as the project and who created the task. */
  meta?: string;
  status: DetailStatus;
  priority: DetailPriority;
  assignee?: DetailPerson;
  /** Already formatted for display, such as "Oct 14". */
  due?: string;
  labels?: string[];
  description?: string;
  activity?: DetailActivity[];
};

const statuses: Record<DetailStatus, { label: string; icon: LucideIcon; className: string }> = {
  backlog: { label: 'Backlog', icon: CircleDashed, className: 'text-muted-foreground' },
  todo: { label: 'To do', icon: Circle, className: 'text-foreground' },
  'in-progress': { label: 'In progress', icon: CircleDot, className: 'text-warning' },
  done: { label: 'Done', icon: CircleCheck, className: 'text-success' },
};

const priorities: Record<DetailPriority, { label: string; icon: LucideIcon; className: string }> = {
  low: { label: 'Low', icon: SignalLow, className: 'text-muted-foreground' },
  medium: { label: 'Medium', icon: SignalMedium, className: 'text-muted-foreground' },
  high: { label: 'High', icon: SignalHigh, className: 'text-foreground' },
  urgent: { label: 'Urgent', icon: TriangleAlert, className: 'text-destructive' },
};

const maya = { name: 'Maya Chen', initials: 'MC' };
const leo = { name: 'Leo Park', initials: 'LP' };

const sampleTask: DetailTask = {
  id: 'KOS-142',
  title: 'Fix the billing date in the invoice email',
  meta: 'Billing · created by Maya Chen on Oct 2',
  status: 'in-progress',
  priority: 'high',
  assignee: leo,
  due: 'Oct 14',
  labels: ['Bug', 'Email'],
  description:
    'Invoices sent on the last day of the month show the next month’s date. The email template formats the date in UTC instead of the workspace time zone.',
  activity: [
    { id: 'a1', author: maya, action: 'created the task', time: 'Oct 2' },
    { id: 'a2', author: leo, action: 'changed the status to In progress', time: 'Yesterday' },
    { id: 'a3', author: leo, body: 'Found it: the template calls toISOString(). A fix is up for review.', time: '2h ago' },
  ],
};

function PersonAvatar({ person }: { person: DetailPerson }) {
  return (
    <Avatar size="sm">
      <AvatarFallback>{person.initials}</AvatarFallback>
    </Avatar>
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

function OptionLabel({ icon: Icon, className, label }: { icon: LucideIcon; className: string; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon aria-hidden className={cn('size-4 shrink-0', className)} />
      <span className="truncate">{label}</span>
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-caption font-medium tracking-[0.05em] text-muted-foreground uppercase">{children}</h3>;
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-5" aria-hidden>
      <Skeleton className="h-3 w-16" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-3">
        {Array.from({ length: 4 }, (_, index) => (
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
  /** The task to show. Defaults to a sample task. */
  task?: DetailTask;
  /** Shows placeholders while the task loads. */
  loading?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The element that opens the drawer. Defaults to an "Open task" button; pass `null` to open it only through `open`. */
  trigger?: React.ReactElement | null;
  /** Called when the status or priority changes in the drawer. */
  onTaskChange?: (task: DetailTask) => void;
  /** Called with the text of a new comment. The comment is added to the activity either way. */
  onComment?: (body: string) => void;
  /** Called by the Delete item of the more menu. */
  onDelete?: (task: DetailTask) => void;
  /** Blocks the page behind the drawer. Defaults to `true`. */
  modal?: boolean;
  /** The element the drawer renders into. Defaults to `document.body`. */
  container?: React.ComponentProps<typeof DrawerContent>['container'];
  /** Where focus goes when the drawer opens. Defaults to the drawer itself. */
  initialFocus?: React.ComponentProps<typeof DrawerContent>['initialFocus'];
};

/**
 * A side panel with the details of one task: its status and priority (editable), assignee, due
 * date, labels, description and activity, with a field to add a comment. It slides in from the
 * end edge and closes with Escape, a click outside, a swipe or the close button.
 */
function DetailDrawer({
  task: taskProp = sampleTask,
  loading = false,
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  onTaskChange,
  onComment,
  onDelete,
  modal = true,
  container,
  initialFocus,
}: DetailDrawerProps) {
  const [task, setTask] = React.useState(taskProp);
  const [comment, setComment] = React.useState('');
  // A new task from the parent replaces local edits.
  const [shown, setShown] = React.useState(taskProp);
  if (shown !== taskProp) {
    setShown(taskProp);
    setTask(taskProp);
  }
  const statusLabelId = React.useId();
  const priorityLabelId = React.useId();
  const commentId = React.useId();

  function update(next: DetailTask) {
    setTask(next);
    onTaskChange?.(next);
  }

  function submitComment(event: React.FormEvent) {
    event.preventDefault();
    const body = comment.trim();
    if (!body) return;
    onComment?.(body);
    setTask({
      ...task,
      activity: [...(task.activity ?? []), { id: `comment-${Date.now()}`, author: { name: 'You', initials: 'YO' }, body, time: 'Just now' }],
    });
    setComment('');
  }

  const status = statuses[task.status];
  const priority = priorities[task.priority];

  return (
    <Drawer open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      {trigger === null ? null : trigger ? (
        <DrawerTrigger render={trigger} />
      ) : (
        <DrawerTrigger render={<Button variant="secondary" />}>Open task</DrawerTrigger>
      )}
      <DrawerContent
        container={container}
        initialFocus={initialFocus}
        showCloseButton={false}
        className="sm:data-[swipe-direction=left]:w-[28rem] sm:data-[swipe-direction=right]:w-[28rem]"
      >
        <div className="flex h-12 shrink-0 items-center gap-1 ps-5 pe-3">
          {loading ? (
            <DrawerTitle className="sr-only">Loading task</DrawerTitle>
          ) : (
            <span className="font-mono text-caption text-muted-foreground tabular-nums">{task.id}</span>
          )}
          <div className="ms-auto flex items-center gap-1">
            {loading ? null : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="More actions" />}
                >
                  <MoreHorizontal aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" container={container}>
                  <DropdownMenuItem>
                    <Copy aria-hidden />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CopyPlus aria-hidden />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(task)}>
                    <Trash2 aria-hidden />
                    Delete task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <DrawerClose
              aria-label="Close"
              render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground after:absolute after:-inset-1.5" />}
            >
              <XIcon aria-hidden />
            </DrawerClose>
          </div>
        </div>

        {loading ? (
          <DetailSkeleton />
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="flex flex-col gap-1 px-5">
                <DrawerTitle className="wrap-break-word">{task.title}</DrawerTitle>
                {task.meta ? <DrawerDescription>{task.meta}</DrawerDescription> : null}
              </div>

              <dl className="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 px-5 pt-5 text-body">
                <Property label="Status" labelId={statusLabelId}>
                  <Select
                    value={task.status}
                    onValueChange={(value) => update({ ...task, status: value as DetailStatus })}
                    items={Object.fromEntries(Object.entries(statuses).map(([key, value]) => [key, value.label]))}
                  >
                    <SelectTrigger aria-labelledby={statusLabelId} className="min-w-36">
                      <SelectValue>{() => <OptionLabel {...status} />}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statuses).map(([value, option]) => (
                        <SelectItem key={value} value={value}>
                          <OptionLabel {...option} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Property>
                <Property label="Priority" labelId={priorityLabelId}>
                  <Select
                    value={task.priority}
                    onValueChange={(value) => update({ ...task, priority: value as DetailPriority })}
                    items={Object.fromEntries(Object.entries(priorities).map(([key, value]) => [key, value.label]))}
                  >
                    <SelectTrigger aria-labelledby={priorityLabelId} className="min-w-36">
                      <SelectValue>{() => <OptionLabel {...priority} />}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorities).map(([value, option]) => (
                        <SelectItem key={value} value={value}>
                          <OptionLabel {...option} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Property>
                <Property label="Assignee">
                  {task.assignee ? (
                    <span className="flex min-w-0 items-center gap-2">
                      <PersonAvatar person={task.assignee} />
                      <span className="truncate">{task.assignee.name}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </Property>
                <Property label="Due date">
                  {task.due ? (
                    <span className="flex items-center gap-2 tabular-nums">
                      <Calendar aria-hidden className="size-4 text-muted-foreground" />
                      {task.due}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No due date</span>
                  )}
                </Property>
                <Property label="Labels">
                  {task.labels?.length ? (
                    task.labels.map((label) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </Property>
              </dl>

              <div className="p-5"><Separator /></div>

              <section className="flex flex-col gap-2 px-5">
                <SectionHeading>Description</SectionHeading>
                {task.description ? (
                  <p className="text-body text-pretty wrap-break-word">{task.description}</p>
                ) : (
                  <p className="text-body text-muted-foreground">No description.</p>
                )}
              </section>

              <div className="p-5"><Separator /></div>

              <section className="flex flex-col gap-3 px-5 pb-5">
                <SectionHeading>Activity</SectionHeading>
                {task.activity?.length ? (
                  <ol className="flex flex-col gap-4">
                    {task.activity.map((entry) => (
                      <li key={entry.id} className="flex gap-3">
                        <PersonAvatar person={entry.author} />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <p className="text-small text-muted-foreground">
                            <span className="font-medium text-foreground">{entry.author.name}</span>
                            {entry.action ? ` ${entry.action}` : null}
                            <span aria-hidden> · </span>
                            <span className="sr-only">, </span>
                            <span className="tabular-nums">{entry.time}</span>
                          </p>
                          {entry.body ? (
                            <p className="rounded-xl bg-accent px-3 py-2 text-body text-pretty wrap-break-word">{entry.body}</p>
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

            <form onSubmit={submitComment} className="flex shrink-0 items-end gap-2 border-t border-border px-5 py-4">
              <label htmlFor={commentId} className="sr-only">
                Add a comment
              </label>
              <Textarea
                id={commentId}
                value={comment}
                onValueChange={(value) => setComment(String(value))}
                placeholder="Add a comment…"
                className="max-h-32 min-h-7.5 resize-none py-[5px]"
                onKeyDown={(event) => {
                  // ⌘Enter or Ctrl+Enter sends, as in most comment fields.
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <Button type="submit" variant="primary" disabled={!comment.trim()}>
                Comment
              </Button>
            </form>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export { DetailDrawer, type DetailActivity, type DetailDrawerProps, type DetailPerson, type DetailPriority, type DetailStatus, type DetailTask };
