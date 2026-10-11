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
import { Clock, Plus } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/registry/kosmos/lib/cn';
import { duration, ease } from '@/registry/kosmos/lib/motion';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
import { Button } from '@/registry/kosmos/ui/button';
import { Meter, MeterSegments, MeterValue } from '@/registry/kosmos/ui/meter';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';

type KanbanTone = 'muted' | 'success' | 'warning' | 'destructive';

type KanbanColumn = {
  /** Matched by each item's `status`. */
  id: string;
  title: string;
  /** Colors the dot beside the title, like a status badge. */
  tone?: KanbanTone;
};

type KanbanPerson = { name: string; initials: string };

/** One card. Shaped like an account in the data table block, so one array can feed both. */
type KanbanItem = {
  id: string;
  name: string;
  domain?: string;
  /** The column the card sits in: a column's `id`. */
  status: string;
  owner?: KanbanPerson;
  /** Annual recurring revenue, in dollars. */
  arr?: number;
  /** Health score from 0 to 100. */
  health?: number;
  /** The day of the last activity, as an ISO date (`2026-10-09`). */
  lastActivity?: string;
};

// Sample data: replace it with your columns and records.
const maya = { name: 'Maya Chen', initials: 'MC' };
const jonas = { name: 'Jonas Weber', initials: 'JW' };
const priya = { name: 'Priya Raman', initials: 'PR' };

const sampleColumns: KanbanColumn[] = [
  { id: 'trial', title: 'Trial', tone: 'muted' },
  { id: 'active', title: 'Active', tone: 'success' },
  { id: 'at-risk', title: 'At risk', tone: 'warning' },
  { id: 'churned', title: 'Churned', tone: 'destructive' },
];

const sampleItems: KanbanItem[] = [
  { id: 'lumen', name: 'Lumen Health', domain: 'lumenhealth.example', status: 'trial', owner: maya, arr: 0, health: 55, lastActivity: '2026-10-11' },
  { id: 'northwind', name: 'Northwind Traders', domain: 'northwind.example', status: 'active', owner: maya, arr: 184000, health: 86, lastActivity: '2026-10-10' },
  { id: 'orbit', name: 'Orbit Freight', domain: 'orbitfreight.example', status: 'active', owner: jonas, arr: 238000, health: 91, lastActivity: '2026-10-09' },
  { id: 'cedar', name: 'Cedar & Pine', domain: 'cedarpine.example', status: 'active', owner: priya, arr: 42000, health: 74, lastActivity: '2026-10-08' },
  { id: 'vela', name: 'Vela Robotics', domain: 'vela.example', status: 'active', owner: priya, arr: 127000, health: 68, lastActivity: '2026-10-06' },
  { id: 'bluebird', name: 'Bluebird Labs', domain: 'bluebird.example', status: 'at-risk', owner: jonas, arr: 96500, health: 38, lastActivity: '2026-09-21' },
  { id: 'quill', name: 'Quill Studio', domain: 'quill.example', status: 'at-risk', owner: maya, arr: 18400, health: 41, lastActivity: '2026-09-28' },
  { id: 'harbor', name: 'Harbor Savings Bank', domain: 'harborbank.example', status: 'churned', owner: priya, arr: 0, health: 12, lastActivity: '2026-08-30' },
];

const toneDot: Record<KanbanTone, string> = {
  muted: 'bg-muted-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

// Fixed locale and time zone, so the server and the browser render the same text.
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usdCompact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const formatDay = (iso: string) => day.format(new Date(`${iso}T00:00:00Z`));

/** Sibling cards slide aside with the Kosmos base duration and curve. */
const sortTransition = { duration: duration.base * 1000, easing: `cubic-bezier(${ease.power3Out.join(', ')})` };
const dropAnimation: DropAnimation = { duration: duration.base * 1000, easing: sortTransition.easing };
/** Under reduced motion the lifted copy fades out where it was dropped, instead of flying into place. */
const fadeDropAnimation: DropAnimation = {
  duration: duration.fast * 1000,
  easing: sortTransition.easing,
  keyframes: () => [{ opacity: 1 }, { opacity: 0 }],
};

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
/** For values that never change after hydration: nothing to subscribe to. */
const subscribeNever = () => () => {};

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
    subscribeNever,
    () => true,
    () => false,
  );
}

function itemLabel(item: KanbanItem) {
  return [
    item.name,
    item.domain,
    item.owner ? `owned by ${item.owner.name}` : 'no owner',
    item.arr ? `${usd.format(item.arr)} ARR` : null,
    item.health !== undefined ? `health ${item.health}` : null,
    item.lastActivity ? `last activity ${formatDay(item.lastActivity)}` : null,
  ]
    .filter(Boolean)
    .join(', ');
}

type KanbanCardProps = React.ComponentProps<'div'> & {
  item: KanbanItem;
  /** The copy that follows the pointer while the card is dragged. */
  lifted?: boolean;
  /** The empty slot the card leaves in its column while it is dragged. */
  placeholder?: boolean;
};

/** One record: its name, domain, owner, ARR, health and last activity. */
function KanbanCard({ item, lifted = false, placeholder = false, className, ...props }: KanbanCardProps) {
  return (
    <div
      data-slot="kanban-card"
      data-lifted={lifted ? '' : undefined}
      data-placeholder={placeholder ? '' : undefined}
      className={cn(
        'flex w-full cursor-grab touch-manipulation flex-col divide-y divide-border rounded-2xl border border-transparent bg-card text-start text-card-foreground shadow-card select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'data-lifted:cursor-grabbing data-lifted:shadow-lift motion-safe:data-lifted:-rotate-2',
        // The slot keeps its size but shows nothing; while it holds focus, the lifted card's ring marks the card.
        'data-placeholder:bg-accent data-placeholder:shadow-none data-placeholder:outline-none data-placeholder:*:invisible',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-2 p-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="line-clamp-2 text-body font-medium text-pretty wrap-break-word">{item.name}</p>
          {item.domain ? <p className="truncate text-caption text-muted-foreground">{item.domain}</p> : null}
        </div>
        {item.owner ? (
          <Avatar size="sm" title={item.owner.name}>
            <AvatarFallback>{item.owner.initials}</AvatarFallback>
          </Avatar>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5">
        {item.arr !== undefined ? (
          <span className="text-caption text-muted-foreground tabular-nums">
            <span className="font-medium text-foreground">{item.arr ? usdCompact.format(item.arr) : '$0'}</span> ARR
          </span>
        ) : null}
        {item.lastActivity ? (
          <span className="flex items-center gap-1 text-caption text-muted-foreground tabular-nums">
            <Clock aria-hidden className="size-3.5" />
            {formatDay(item.lastActivity)}
          </span>
        ) : null}
        {item.health !== undefined ? (
          <Meter
            value={item.health}
            tone="auto"
            aria-hidden
            className="ms-auto w-20 grid-cols-[minmax(0,1fr)_1.5rem] items-center gap-x-2 gap-y-0"
          >
            <MeterSegments count={10} className="col-span-1 h-2" />
            <MeterValue className="row-start-1 text-end text-caption" />
          </Meter>
        ) : null}
      </div>
    </div>
  );
}

function SortableCard({
  item,
  reducedMotion,
  dragging,
  onOpen,
}: {
  item: KanbanItem;
  reducedMotion: boolean;
  dragging: boolean;
  onOpen?: (item: KanbanItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'item' },
    transition: reducedMotion ? null : sortTransition,
  });
  return (
    <KanbanCard
      ref={setNodeRef}
      item={item}
      placeholder={isDragging}
      style={
        {
          '--kanban-card-transform': CSS.Translate.toString(transform) ?? 'none',
          '--kanban-card-transition': transition ?? 'none',
        } as React.CSSProperties
      }
      className="[transform:var(--kanban-card-transform)] [transition:var(--kanban-card-transition)]"
      {...attributes}
      aria-roledescription="draggable card"
      aria-label={itemLabel(item)}
      {...listeners}
      onClick={() => onOpen?.(item)}
      onKeyDown={(event) => {
        // Space picks the card up (the keyboard sensor); Enter opens it.
        if (event.key === 'Enter' && !dragging) {
          event.preventDefault();
          onOpen?.(item);
          return;
        }
        listeners?.onKeyDown?.(event);
      }}
    />
  );
}

function KanbanColumnView({
  column,
  items,
  loading,
  reducedMotion,
  dragging,
  onOpen,
  onAdd,
}: {
  column: KanbanColumn;
  items: KanbanItem[];
  loading: boolean;
  reducedMotion: boolean;
  dragging: boolean;
  onOpen?: (item: KanbanItem) => void;
  onAdd?: (columnId: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: column.id, data: { type: 'column' } });
  const headingId = React.useId();
  const total = items.reduce((sum, item) => sum + (item.arr ?? 0), 0);
  return (
    <section
      data-slot="kanban-column"
      aria-labelledby={headingId}
      className="flex max-h-full w-72 shrink-0 flex-col"
    >
      {/* `relative` anchors the `sr-only` labels here, so they cannot escape the board's scroll clip. */}
      <header className="relative flex h-11 shrink-0 items-center gap-2 ps-3.5 pe-2">
        <span aria-hidden className={cn('size-2 shrink-0 rounded-full', toneDot[column.tone ?? 'muted'])} />
        <h3 id={headingId} className="truncate text-body font-medium">
          {column.title}
        </h3>
        {loading ? (
          <Skeleton className="h-3 w-4" />
        ) : (
          <span className="text-caption text-muted-foreground tabular-nums">
            {items.length}
            <span className="sr-only">{items.length === 1 ? ' card' : ' cards'}</span>
          </span>
        )}
        {!loading && total > 0 ? (
          <span className="ms-auto text-caption text-muted-foreground tabular-nums">
            {usdCompact.format(total)}
            <span className="sr-only"> ARR</span>
          </span>
        ) : null}
        {onAdd ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn('text-muted-foreground', (loading || total === 0) && 'ms-auto')}
            aria-label={`Add to ${column.title}`}
            onClick={() => onAdd(column.id)}
          >
            <Plus aria-hidden />
          </Button>
        ) : null}
      </header>
      {/*
        Native scrolling: the cards that pass through a column while a card is dragged change its height
        faster than Scroll area re-measures, which left a stale scrollbar gutter after the drag. The 4px
        inset leaves room for the card ring and focus outline, which the scroll container would clip.
      */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin] dark:scheme-dark">
        <SortableContext id={column.id} items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="flex min-h-20 flex-col gap-2 px-3 py-1">
            {loading ? (
              <>
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </>
            ) : items.length === 0 ? (
              <p className="flex min-h-20 flex-1 items-center justify-center px-4 text-center text-small text-muted-foreground">
                {dragging ? 'Drop here' : 'Nothing here'}
              </p>
            ) : (
              items.map((item) => (
                <SortableCard key={item.id} item={item} reducedMotion={reducedMotion} dragging={dragging} onOpen={onOpen} />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </section>
  );
}

type KanbanBoardProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** The columns, in order. Defaults to the account statuses: Trial, Active, At risk, Churned. */
  columns?: KanbanColumn[];
  /** The cards, controlled. Each names its column in `status`; their order is the order on the board. */
  items?: KanbanItem[];
  /** The cards to start with when `items` is not controlled. Defaults to sample accounts. */
  defaultItems?: KanbanItem[];
  /** Called once per move, when a card is dropped in a new place, with every card in the new order. */
  onItemsChange?: (items: KanbanItem[]) => void;
  /** Shows only cards whose name, domain or owner contains this text. */
  query?: string;
  /** Called when a card is clicked or opened with Enter. */
  onOpen?: (item: KanbanItem) => void;
  /** Shows a + button in each column header that calls this with the column's id. */
  onAdd?: (columnId: string) => void;
  /** Shows placeholder cards while the data loads. */
  loading?: boolean;
};

/**
 * Columns of cards that scroll sideways inside their container. Cards move by drag and drop, or
 * from the keyboard: Space picks a card up, the arrow keys move it, Space drops it and Escape puts
 * it back. Every move is announced to screen readers.
 */
function KanbanBoard({
  columns = sampleColumns,
  items: itemsProp,
  defaultItems = sampleItems,
  onItemsChange,
  query = '',
  onOpen,
  onAdd,
  loading = false,
  className,
  ...props
}: KanbanBoardProps) {
  const [uncontrolledItems, setUncontrolledItems] = React.useState(defaultItems);
  const committed = itemsProp ?? uncontrolledItems;
  // While a card is dragged, the order lives here, so `onItemsChange` fires once, on drop.
  const [dragItems, setDragItems] = React.useState<KanbanItem[] | null>(null);
  const items = dragItems ?? committed;
  // The newest order, read by drag handlers that fire again before the next render.
  const latestItems = React.useRef(items);
  React.useLayoutEffect(() => {
    latestItems.current = items;
  }, [items]);

  function preview(next: KanbanItem[]) {
    latestItems.current = next;
    setDragItems(next);
  }

  function commit(next: KanbanItem[]) {
    latestItems.current = next;
    setDragItems(null);
    if (itemsProp === undefined) setUncontrolledItems(next);
    onItemsChange?.(next);
  }

  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const mounted = useMounted();
  const reducedMotion = usePrefersReducedMotion();

  const needle = query.trim().toLowerCase();
  const matches = (item: KanbanItem) =>
    !needle || [item.name, item.domain, item.owner?.name].some((text) => text?.toLowerCase().includes(needle));
  const visibleIn = (columnId: string, list = latestItems.current) =>
    list.filter((item) => item.status === columnId && matches(item));

  const columnOf = (id: UniqueIdentifier, list = latestItems.current) =>
    columns.some((column) => column.id === id) ? String(id) : list.find((item) => item.id === id)?.status;
  const columnTitle = (id: string | undefined) => columns.find((column) => column.id === id)?.title ?? 'no column';
  const position = (id: UniqueIdentifier) => {
    const columnId = columnOf(id);
    const inColumn = columnId ? visibleIn(columnId) : [];
    return `${columnTitle(columnId)}, position ${inColumn.findIndex((item) => item.id === id) + 1} of ${inColumn.length}`;
  };
  const nameOf = (id: UniqueIdentifier) => latestItems.current.find((item) => item.id === id)?.name ?? String(id);

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}, in ${position(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${nameOf(active.id)} is now in ${position(active.id)}.` : undefined),
    onDragEnd: ({ active }) => `Dropped ${nameOf(active.id)} in ${position(active.id)}.`,
    // Runs after the cancel has put every card back, so the position is the original one.
    onDragCancel: ({ active }) => `Move cancelled. ${nameOf(active.id)} is back in ${position(active.id)}.`,
  };

  // Up and Down move within a column (the sortable default); Left and Right jump to the same
  // position in the next column, or the end of it, so a card never needs a long trip of arrows.
  const coordinateGetter: KeyboardCoordinateGetter = (event, args) => {
    const { active, droppableRects } = args.context;
    if ((event.code !== 'ArrowLeft' && event.code !== 'ArrowRight') || !active) {
      return sortableKeyboardCoordinates(event, args);
    }
    event.preventDefault();
    const from = columnOf(active.id);
    const target = columns[columns.findIndex((column) => column.id === from) + (event.code === 'ArrowRight' ? 1 : -1)];
    if (!from || !target) return undefined;
    const index = visibleIn(from).findIndex((item) => item.id === active.id);
    const inTarget = visibleIn(target.id);
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

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id);
  }

  // Moving into another column happens while dragging, so the cards there make room.
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const from = columnOf(active.id);
    const to = columnOf(over.id);
    if (!from || !to || from === to) return;
    const list = latestItems.current;
    const moving = list.find((item) => item.id === active.id);
    if (!moving) return;
    const rest = list.filter((item) => item.id !== active.id);
    const overIndex = rest.findIndex((item) => item.id === over.id);
    let index: number;
    if (overIndex >= 0) {
      const activeRect = active.rect.current.translated;
      const below = activeRect ? activeRect.top > over.rect.top + over.rect.height / 2 : false;
      index = overIndex + (below ? 1 : 0);
    } else {
      // Over the column itself: after its last card, or at the end of the list.
      const lastInColumn = rest.findLastIndex((item) => item.status === to);
      index = lastInColumn >= 0 ? lastInColumn + 1 : rest.length;
    }
    rest.splice(index, 0, { ...moving, status: to });
    preview(rest);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    let list = latestItems.current;
    if (over && active.id !== over.id) {
      const from = list.findIndex((item) => item.id === active.id);
      const to = list.findIndex((item) => item.id === over.id);
      if (from >= 0 && to >= 0 && list[from].status === list[to].status) list = arrayMove(list, from, to);
    }
    if (list === committed) setDragItems(null);
    else commit(list);
  }

  function handleDragCancel() {
    latestItems.current = committed;
    setDragItems(null);
    setActiveId(null);
  }

  const activeItem = activeId ? items.find((item) => item.id === activeId) : undefined;
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
            draggable: `${onOpen ? 'Press Enter to open. ' : ''}To move the card, press Space, use the arrow keys to choose a place, then press Space to drop it or Escape to cancel.`,
          },
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <ScrollArea className="min-h-0 flex-1 rounded-3xl" viewportClassName="[&>[data-slot=scroll-area-content]]:h-full">
          <div className="flex h-full w-max items-stretch divide-x divide-border">
            {columns.map((column) => (
              <KanbanColumnView
                key={column.id}
                column={column}
                items={items.filter((item) => item.status === column.id && matches(item))}
                loading={loading}
                reducedMotion={reducedMotion}
                dragging={activeId !== null}
                onOpen={onOpen}
                onAdd={onAdd}
              />
            ))}
          </div>
        </ScrollArea>
        {mounted
          ? createPortal(
              <DragOverlay dropAnimation={reducedMotion ? fadeDropAnimation : dropAnimation}>
                {activeItem ? <KanbanCard item={activeItem} lifted /> : null}
              </DragOverlay>,
              document.body,
            )
          : null}
      </DndContext>
    </div>
  );
}

export { KanbanBoard, KanbanCard, type KanbanBoardProps, type KanbanCardProps, type KanbanColumn, type KanbanItem, type KanbanPerson };
