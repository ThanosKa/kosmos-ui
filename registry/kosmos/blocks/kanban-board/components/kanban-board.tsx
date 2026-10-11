'use client';

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Circle, CircleCheck, CircleDashed, CircleDot, MessageSquare, Plus, type LucideIcon } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/registry/kosmos/lib/cn';
import { duration, ease } from '@/registry/kosmos/lib/motion';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';

type KanbanTone = 'muted' | 'neutral' | 'warning' | 'success';

type KanbanColumn = {
  id: string;
  title: string;
  /** The status icon beside the title. */
  icon?: LucideIcon;
  /** Colors the icon: `warning` and `success` for work under way and done, the rest stay neutral. */
  tone?: KanbanTone;
};

type KanbanPerson = { name: string; initials: string };

type KanbanTask = {
  id: string;
  /** The column the task sits in. */
  columnId: string;
  title: string;
  labels?: string[];
  /** Already formatted for display, such as "Oct 14". */
  due?: string;
  assignee?: KanbanPerson;
  comments?: number;
};

const toneClass: Record<KanbanTone, string> = {
  muted: 'text-muted-foreground',
  neutral: 'text-foreground',
  warning: 'text-warning',
  success: 'text-success',
};

const defaultColumns: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', icon: CircleDashed, tone: 'muted' },
  { id: 'todo', title: 'To do', icon: Circle, tone: 'neutral' },
  { id: 'in-progress', title: 'In progress', icon: CircleDot, tone: 'warning' },
  { id: 'done', title: 'Done', icon: CircleCheck, tone: 'success' },
];

const maya = { name: 'Maya Chen', initials: 'MC' };
const leo = { name: 'Leo Park', initials: 'LP' };
const sam = { name: 'Sam Rivera', initials: 'SR' };

const defaultTasks: KanbanTask[] = [
  { id: 'KOS-118', columnId: 'backlog', title: 'Audit color contrast on the settings pages', labels: ['Design'], assignee: maya },
  { id: 'KOS-121', columnId: 'backlog', title: 'Add CSV export to the reports table', labels: ['Feature'], due: 'Oct 28' },
  { id: 'KOS-125', columnId: 'backlog', title: 'Write the migration guide for v2', labels: ['Docs'] },
  { id: 'KOS-131', columnId: 'todo', title: 'Rate-limit the public search endpoint', labels: ['Backend'], due: 'Oct 18', assignee: sam, comments: 3 },
  { id: 'KOS-134', columnId: 'todo', title: 'Empty state for the projects list', labels: ['Design'], assignee: maya },
  { id: 'KOS-137', columnId: 'todo', title: 'Upgrade the charting library', labels: ['Chore'], assignee: leo },
  { id: 'KOS-140', columnId: 'in-progress', title: 'Redesign the onboarding checklist', labels: ['Design', 'Feature'], due: 'Oct 16', assignee: maya, comments: 5 },
  { id: 'KOS-142', columnId: 'in-progress', title: 'Fix the billing date in the invoice email', labels: ['Bug'], due: 'Oct 14', assignee: leo, comments: 2 },
  { id: 'KOS-109', columnId: 'done', title: 'Ship dark mode for the dashboard', labels: ['Feature'], assignee: sam, comments: 8 },
  { id: 'KOS-112', columnId: 'done', title: 'Remove the legacy login page', labels: ['Chore'], assignee: leo },
];

/** Sibling cards slide aside with the Kosmos base duration and curve. */
const sortTransition = { duration: duration.base * 1000, easing: `cubic-bezier(${ease.power3Out.join(', ')})` };
const dropAnimation: DropAnimation = { duration: duration.base * 1000, easing: sortTransition.easing };

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const noop = () => () => {};

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
}

/** False on the server and in the first client render, so portals into `document.body` wait for hydration. */
function useMounted() {
  return React.useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

function taskLabel(task: KanbanTask) {
  return [
    task.title,
    task.id,
    task.assignee ? `assigned to ${task.assignee.name}` : 'unassigned',
    task.due ? `due ${task.due}` : null,
    task.comments ? `${task.comments} comments` : null,
  ]
    .filter(Boolean)
    .join(', ');
}

type KanbanCardProps = React.ComponentProps<'div'> & {
  task: KanbanTask;
  /** The copy that follows the pointer while the card is dragged. */
  lifted?: boolean;
  /** The empty slot the card leaves in its column while it is dragged. */
  placeholder?: boolean;
};

/** One task: its ID, title, labels, due date, comment count and assignee. */
function KanbanCard({ task, lifted = false, placeholder = false, className, ...props }: KanbanCardProps) {
  return (
    <div
      data-slot="kanban-card"
      data-lifted={lifted ? '' : undefined}
      data-placeholder={placeholder ? '' : undefined}
      className={cn(
        'flex w-full cursor-grab touch-manipulation flex-col gap-2 rounded-2xl border border-transparent bg-card p-3 text-start text-card-foreground shadow-card select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'data-lifted:cursor-grabbing data-lifted:shadow-lift motion-safe:data-lifted:-rotate-2',
        'data-placeholder:bg-accent data-placeholder:shadow-none data-placeholder:outline-none data-placeholder:*:invisible',
        className,
      )}
      {...props}
    >
      <div className="flex min-h-6 items-center justify-between gap-2">
        <span className="font-mono text-caption text-muted-foreground tabular-nums">{task.id}</span>
        {task.assignee ? (
          <Avatar size="sm" title={task.assignee.name}>
            <AvatarFallback>{task.assignee.initials}</AvatarFallback>
          </Avatar>
        ) : null}
      </div>
      <p className="line-clamp-3 text-body font-medium text-pretty wrap-break-word">{task.title}</p>
      {task.labels?.length || task.due || task.comments ? (
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          {task.labels?.map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
          {task.due ? (
            <span className="flex items-center gap-1 text-caption text-muted-foreground tabular-nums">
              <Calendar aria-hidden className="size-3.5" />
              {task.due}
            </span>
          ) : null}
          {task.comments ? (
            <span className="flex items-center gap-1 text-caption text-muted-foreground tabular-nums">
              <MessageSquare aria-hidden className="size-3.5" />
              {task.comments}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SortableCard({
  task,
  reducedMotion,
  dragging,
  onOpen,
}: {
  task: KanbanTask;
  reducedMotion: boolean;
  dragging: boolean;
  onOpen?: (task: KanbanTask) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task' },
    transition: reducedMotion ? null : sortTransition,
  });
  return (
    <KanbanCard
      ref={setNodeRef}
      task={task}
      placeholder={isDragging}
      style={
        {
          '--kanban-card-transform': CSS.Translate.toString(transform) ?? 'none',
          '--kanban-card-transition': transition ?? 'none',
        } as React.CSSProperties
      }
      className="[transform:var(--kanban-card-transform)] [transition:var(--kanban-card-transition)]"
      {...attributes}
      aria-roledescription="draggable task"
      aria-label={taskLabel(task)}
      {...listeners}
      onClick={() => onOpen?.(task)}
      onKeyDown={(event) => {
        // Space picks the card up (the keyboard sensor); Enter opens it.
        if (event.key === 'Enter' && !dragging) {
          event.preventDefault();
          onOpen?.(task);
          return;
        }
        listeners?.onKeyDown?.(event);
      }}
    />
  );
}

function KanbanColumnView({
  column,
  tasks,
  loading,
  reducedMotion,
  dragging,
  onTaskOpen,
  onAddTask,
}: {
  column: KanbanColumn;
  tasks: KanbanTask[];
  loading: boolean;
  reducedMotion: boolean;
  dragging: boolean;
  onTaskOpen?: (task: KanbanTask) => void;
  onAddTask?: (columnId: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: column.id, data: { type: 'column' } });
  const Icon = column.icon;
  const headingId = React.useId();
  return (
    <section
      data-slot="kanban-column"
      aria-labelledby={headingId}
      className="flex max-h-full w-72 shrink-0 flex-col rounded-3xl bg-accent"
    >
      <header className="flex h-10 shrink-0 items-center gap-2 ps-4 pe-2.5 pt-1">
        {Icon ? <Icon aria-hidden className={cn('size-4 shrink-0', toneClass[column.tone ?? 'muted'])} /> : null}
        <h3 id={headingId} className="truncate text-body font-medium">
          {column.title}
        </h3>
        {loading ? (
          <Skeleton className="h-3 w-4" />
        ) : (
          <span className="text-caption text-muted-foreground tabular-nums">
            {tasks.length}
            <span className="sr-only"> tasks</span>
          </span>
        )}
        {onAddTask ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ms-auto text-muted-foreground"
            aria-label={`Add task to ${column.title}`}
            onClick={() => onAddTask(column.id)}
          >
            <Plus aria-hidden />
          </Button>
        ) : null}
      </header>
      {/* The 4px inset leaves room for the card ring and focus outline, which the scroll viewport would clip. */}
      <ScrollArea className="min-h-0 flex-1 rounded-3xl" fade={false}>
        <SortableContext id={column.id} items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="flex min-h-20 flex-col gap-2 p-1">
            {loading ? (
              <>
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </>
            ) : tasks.length === 0 ? (
              <p className="flex min-h-20 flex-1 items-center justify-center px-4 text-center text-small text-muted-foreground">
                {dragging ? 'Drop here' : 'No tasks'}
              </p>
            ) : (
              tasks.map((task) => (
                <SortableCard key={task.id} task={task} reducedMotion={reducedMotion} dragging={dragging} onOpen={onTaskOpen} />
              ))
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </section>
  );
}

type KanbanBoardProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The columns, in order. Defaults to Backlog, To do, In progress and Done. */
  columns?: KanbanColumn[];
  /** The tasks, controlled. Each names its column in `columnId`; their order is the order on the board. */
  tasks?: KanbanTask[];
  /** The tasks to start with when `tasks` is not controlled. Defaults to sample tasks. */
  defaultTasks?: KanbanTask[];
  /** Called with every task, in their new order, after a card moves. */
  onTasksChange?: (tasks: KanbanTask[]) => void;
  /** Called when a card is clicked or opened with Enter. */
  onTaskOpen?: (task: KanbanTask) => void;
  /** Shows a + button in each column header that calls this with the column's id. */
  onAddTask?: (columnId: string) => void;
  /** Shows placeholder cards while the tasks load. */
  loading?: boolean;
};

/**
 * Columns of task cards that scroll sideways inside their container. Cards move by drag and drop,
 * or from the keyboard: Space picks a card up, the arrow keys move it, Space drops it and Escape
 * puts it back. Every move is announced to screen readers.
 */
function KanbanBoard({
  columns = defaultColumns,
  tasks: tasksProp,
  defaultTasks: defaultTasksProp = defaultTasks,
  onTasksChange,
  onTaskOpen,
  onAddTask,
  loading = false,
  className,
  ...props
}: KanbanBoardProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultTasksProp);
  const tasks = tasksProp ?? uncontrolled;
  // The newest order, read by drag handlers that fire again before the next render.
  const latest = React.useRef(tasks);
  React.useLayoutEffect(() => {
    latest.current = tasks;
  }, [tasks]);
  const setTasks = (next: KanbanTask[]) => {
    latest.current = next;
    if (tasksProp === undefined) setUncontrolled(next);
    onTasksChange?.(next);
  };

  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const mounted = useMounted();
  const reducedMotion = usePrefersReducedMotion();
  // The order before the drag, so Escape can put every card back.
  const snapshot = React.useRef<KanbanTask[] | null>(null);

  // Up and Down move within a column (the sortable default); Left and Right jump to the same
  // position in the next column, or the end of it, so a card never needs a long trip of arrows.
  const coordinateGetter: KeyboardCoordinateGetter = (event, args) => {
    const { active, droppableRects } = args.context;
    if ((event.code !== 'ArrowLeft' && event.code !== 'ArrowRight') || !active) {
      return sortableKeyboardCoordinates(event, args);
    }
    event.preventDefault();
    const list = latest.current;
    const from = columnOf(active.id, list);
    const target = columns[columns.findIndex((column) => column.id === from) + (event.code === 'ArrowRight' ? 1 : -1)];
    if (!target) return undefined;
    const index = list.filter((task) => task.columnId === from).findIndex((task) => task.id === active.id);
    const inTarget = list.filter((task) => task.columnId === target.id);
    const rect = droppableRects.get(inTarget[Math.min(index, inTarget.length - 1)]?.id ?? target.id);
    return rect ? { x: rect.left, y: rect.top } : undefined;
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter'] },
    }),
  );

  const columnOf = (id: UniqueIdentifier, list = latest.current) =>
    columns.some((column) => column.id === id) ? String(id) : list.find((task) => task.id === id)?.columnId;
  const columnTitle = (id: string | undefined) => columns.find((column) => column.id === id)?.title ?? 'no column';
  const position = (id: UniqueIdentifier) => {
    const list = latest.current;
    const columnId = columnOf(id, list);
    const inColumn = list.filter((task) => task.columnId === columnId);
    return `${columnTitle(columnId)}, position ${inColumn.findIndex((task) => task.id === id) + 1} of ${inColumn.length}`;
  };
  const titleOf = (id: UniqueIdentifier) => latest.current.find((task) => task.id === id)?.title ?? String(id);

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${titleOf(active.id)}, in ${position(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${titleOf(active.id)} is now in ${position(active.id)}.` : undefined),
    onDragEnd: ({ active, over }) =>
      over ? `Dropped ${titleOf(active.id)} in ${position(active.id)}.` : `Dropped ${titleOf(active.id)}.`,
    // Runs after the cancel handler has put every card back, so the position is the original one.
    onDragCancel: ({ active }) => `Move cancelled. ${titleOf(active.id)} is back in ${position(active.id)}.`,
  };

  function handleDragStart({ active }: DragStartEvent) {
    snapshot.current = tasks;
    setActiveId(active.id);
  }

  // Moving into another column happens while dragging, so the cards there make room.
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const from = columnOf(active.id);
    const to = columnOf(over.id);
    if (!from || !to || from === to) return;
    const list = latest.current;
    const moving = list.find((task) => task.id === active.id);
    if (!moving) return;
    const rest = list.filter((task) => task.id !== active.id);
    const overIndex = rest.findIndex((task) => task.id === over.id);
    let index: number;
    if (overIndex >= 0) {
      const activeRect = active.rect.current.translated;
      const below = activeRect ? activeRect.top > over.rect.top + over.rect.height / 2 : false;
      index = overIndex + (below ? 1 : 0);
    } else {
      // Over the column itself: after its last card, or where the column's cards would start.
      const lastInColumn = rest.findLastIndex((task) => task.columnId === to);
      index = lastInColumn >= 0 ? lastInColumn + 1 : rest.length;
    }
    rest.splice(index, 0, { ...moving, columnId: to });
    setTasks(rest);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    snapshot.current = null;
    if (!over || active.id === over.id) return;
    const list = latest.current;
    const from = list.findIndex((task) => task.id === active.id);
    const to = list.findIndex((task) => task.id === over.id);
    if (from < 0 || to < 0 || list[from].columnId !== list[to].columnId) return;
    setTasks(arrayMove(list, from, to));
  }

  function handleDragCancel() {
    if (snapshot.current) setTasks(snapshot.current);
    snapshot.current = null;
    setActiveId(null);
  }

  const activeTask = activeId ? tasks.find((task) => task.id === activeId) : undefined;
  const dndId = React.useId();

  return (
    <div
      data-slot="kanban-board"
      aria-busy={loading || undefined}
      className={cn('flex min-h-0 w-full min-w-0 flex-col', className)}
      {...props}
    >
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCorners}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable:
              'Press Enter to open the task. To move it, press Space, use the arrow keys to choose a place, then press Space to drop it or Escape to cancel.',
          },
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <ScrollArea className="min-h-0 flex-1 rounded-3xl" viewportClassName="[&>[data-slot=scroll-area-content]]:h-full">
          <div className="flex h-full w-max items-start gap-3">
            {columns.map((column) => (
              <KanbanColumnView
                key={column.id}
                column={column}
                tasks={tasks.filter((task) => task.columnId === column.id)}
                loading={loading}
                reducedMotion={reducedMotion}
                dragging={activeId !== null}
                onTaskOpen={onTaskOpen}
                onAddTask={onAddTask}
              />
            ))}
          </div>
        </ScrollArea>
        {mounted
          ? createPortal(
              <DragOverlay dropAnimation={reducedMotion ? null : dropAnimation}>
                {activeTask ? <KanbanCard task={activeTask} lifted /> : null}
              </DragOverlay>,
              document.body,
            )
          : null}
      </DndContext>
    </div>
  );
}

export { KanbanBoard, KanbanCard, type KanbanBoardProps, type KanbanCardProps, type KanbanColumn, type KanbanPerson, type KanbanTask };
