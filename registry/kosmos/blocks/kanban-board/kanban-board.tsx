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
import { CalendarDays, Circle, CircleCheck, CircleDashed, CircleDot, Plus, ThumbsUp, type LucideIcon } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/registry/kosmos/lib/cn';
import { duration, ease } from '@/registry/kosmos/lib/motion';
import { Avatar, AvatarFallback } from '@/registry/kosmos/ui/avatar';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';

type KanbanTone = 'muted' | 'success' | 'warning' | 'destructive';

type KanbanColumn = {
  /** Matched by each item's `column`. */
  id: string;
  title: string;
  /** The stage glyph beside the title. Without one, a dot. */
  icon?: LucideIcon;
  /** Colors the glyph or the dot, like a status badge. */
  tone?: KanbanTone;
};

type KanbanPerson = { name: string; initials: string };

/** A category on the card, shown as a tag in one of the Badge hues. */
type KanbanTag = { label: string; hue: 'orange' | 'blue' | 'amber' | 'magenta' | 'green' | 'red' };

/** One card: a roadmap item. */
type KanbanItem = {
  id: string;
  title: string;
  /** The column the card sits in: a column's `id`. */
  column: string;
  /** The part of the product it belongs to. */
  area?: KanbanTag;
  /** How many customers asked for it. */
  votes?: number;
  /** Who builds it. */
  assignee?: KanbanPerson;
  /** When it should ship, such as `Q4 2026`. */
  target?: string;
};

// Sample data: replace it with your columns and records.
const lena = { name: 'Lena Park', initials: 'LP' };
const tomas = { name: 'Tomás Ortega', initials: 'TO' };
const ama = { name: 'Ama Mensah', initials: 'AM' };
const kai = { name: 'Kai Nakamura', initials: 'KN' };

const insights: KanbanTag = { label: 'Insights', hue: 'amber' };
const ingestion: KanbanTag = { label: 'Ingestion', hue: 'green' };
const billing: KanbanTag = { label: 'Billing', hue: 'red' };
const platform: KanbanTag = { label: 'Platform', hue: 'blue' };

const sampleColumns: KanbanColumn[] = [
  { id: 'ideas', title: 'Ideas', icon: CircleDashed, tone: 'muted' },
  { id: 'planned', title: 'Planned', icon: Circle, tone: 'muted' },
  { id: 'in-progress', title: 'In progress', icon: CircleDot, tone: 'warning' },
  { id: 'shipped', title: 'Shipped', icon: CircleCheck, tone: 'success' },
];

const sampleRoadmapItems: KanbanItem[] = [
  { id: 'slack-alerts', title: 'Slack alerts for traffic drops', column: 'ideas', area: platform, votes: 64 },
  { id: 'usage-invoices', title: 'Usage-based invoices', column: 'ideas', area: billing, votes: 27 },
  { id: 'shareable-links', title: 'Shareable dashboard links', column: 'ideas', area: insights, votes: 51 },
  { id: 'retention-cohorts', title: 'Retention cohorts by plan', column: 'planned', area: insights, votes: 88, assignee: kai, target: 'Q1 2027' },
  { id: 'saml-sso', title: 'SAML single sign-on', column: 'planned', area: platform, votes: 73, assignee: tomas, target: 'Q1 2027' },
  { id: 'mobile-sdk', title: 'Mobile SDK 3.0', column: 'planned', area: ingestion, votes: 39, assignee: tomas, target: 'Q4 2026' },
  { id: 'funnel-comparisons', title: 'Funnel comparisons', column: 'in-progress', area: insights, votes: 112, assignee: ama, target: 'Q4 2026' },
  { id: 'server-batching', title: 'Server-side batching', column: 'in-progress', area: ingestion, votes: 45, assignee: tomas, target: 'Q4 2026' },
  { id: 'eu-region', title: 'EU data region', column: 'shipped', area: ingestion, votes: 97, assignee: tomas, target: 'Q3 2026' },
  { id: 'annual-billing', title: 'Annual billing', column: 'shipped', area: billing, votes: 58, assignee: lena, target: 'Q3 2026' },
];

const toneText: Record<KanbanTone, string> = {
  muted: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
};

const toneDot: Record<KanbanTone, string> = {
  muted: 'bg-muted-foreground',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

// A fixed locale, so the server and the browser render the same text.
const count = new Intl.NumberFormat('en-US');
const votesLabel = (votes: number) => `${count.format(votes)} ${votes === 1 ? 'vote' : 'votes'}`;

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
    item.title,
    item.area?.label,
    item.votes !== undefined ? votesLabel(item.votes) : null,
    item.target ? `target ${item.target}` : null,
    item.assignee ? `assigned to ${item.assignee.name}` : 'unassigned',
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

/** One roadmap item: its area and title, then its votes, target quarter and assignee. */
function KanbanCard({ item, lifted = false, placeholder = false, className, ...props }: KanbanCardProps) {
  const hasMeta = item.votes !== undefined || Boolean(item.target) || Boolean(item.assignee);
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
      <div className="flex flex-col items-start gap-2 p-3">
        {item.area ? (
          <Badge variant={item.area.hue} className="max-w-full">
            <span className="truncate">{item.area.label}</span>
          </Badge>
        ) : null}
        <p className="line-clamp-3 text-body font-medium text-pretty wrap-break-word">{item.title}</p>
      </div>
      {hasMeta ? (
        <div className="flex min-h-10 items-center gap-3 px-3 py-2">
          {item.votes !== undefined ? (
            <span className="flex shrink-0 items-center gap-1 text-caption text-muted-foreground tabular-nums">
              <ThumbsUp aria-hidden className="size-3.5" />
              <span className="font-medium text-foreground">{count.format(item.votes)}</span>
            </span>
          ) : null}
          {item.target ? (
            <span className="flex min-w-0 items-center gap-1 text-caption text-muted-foreground tabular-nums">
              <CalendarDays aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">{item.target}</span>
            </span>
          ) : null}
          {item.assignee ? (
            <Avatar size="sm" title={item.assignee.name} className="ms-auto">
              <AvatarFallback>{item.assignee.initials}</AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      ) : null}
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
  const tone = column.tone ?? 'muted';
  const Icon = column.icon;
  return (
    <section data-slot="kanban-column" aria-labelledby={headingId} className="flex max-h-full w-72 shrink-0 flex-col">
      {/* `relative` anchors the `sr-only` labels here, so they cannot escape the board's scroll clip. */}
      <header className="relative flex h-11 shrink-0 items-center gap-2 ps-3.5 pe-2">
        {Icon ? (
          <Icon aria-hidden className={cn('size-3.5 shrink-0', toneText[tone])} />
        ) : (
          <span aria-hidden className={cn('size-2 shrink-0 rounded-full', toneDot[tone])} />
        )}
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
        {onAdd ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ms-auto text-muted-foreground"
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
  /** The columns, in order. Defaults to the roadmap stages: Ideas, Planned, In progress, Shipped. */
  columns?: KanbanColumn[];
  /** The cards, controlled. Each names its column in `column`; their order is the order on the board. */
  items?: KanbanItem[];
  /** The cards to start with when `items` is not controlled. Defaults to a sample roadmap. */
  defaultItems?: KanbanItem[];
  /** Called once per move, when a card is dropped in a new place, with every card in the new order. */
  onItemsChange?: (items: KanbanItem[]) => void;
  /** Shows only cards whose title, area or assignee contains this text. */
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
  defaultItems = sampleRoadmapItems,
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
    !needle || [item.title, item.area?.label, item.assignee?.name].some((text) => text?.toLowerCase().includes(needle));
  const visibleIn = (columnId: string, list = latestItems.current) =>
    list.filter((item) => item.column === columnId && matches(item));

  const columnOf = (id: UniqueIdentifier, list = latestItems.current) =>
    columns.some((column) => column.id === id) ? String(id) : list.find((item) => item.id === id)?.column;
  const columnTitle = (id: string | undefined) => columns.find((column) => column.id === id)?.title ?? 'no column';
  const position = (id: UniqueIdentifier) => {
    const columnId = columnOf(id);
    const inColumn = columnId ? visibleIn(columnId) : [];
    return `${columnTitle(columnId)}, position ${inColumn.findIndex((item) => item.id === id) + 1} of ${inColumn.length}`;
  };
  const titleOf = (id: UniqueIdentifier) => latestItems.current.find((item) => item.id === id)?.title ?? String(id);

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${titleOf(active.id)}, in ${position(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${titleOf(active.id)} is now in ${position(active.id)}.` : undefined),
    onDragEnd: ({ active }) => `Dropped ${titleOf(active.id)} in ${position(active.id)}.`,
    // Runs after the cancel has put every card back, so the position is the original one.
    onDragCancel: ({ active }) => `Move cancelled. ${titleOf(active.id)} is back in ${position(active.id)}.`,
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
      const lastInColumn = rest.findLastIndex((item) => item.column === to);
      index = lastInColumn >= 0 ? lastInColumn + 1 : rest.length;
    }
    rest.splice(index, 0, { ...moving, column: to });
    preview(rest);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    let list = latestItems.current;
    if (over && active.id !== over.id) {
      const from = list.findIndex((item) => item.id === active.id);
      const to = list.findIndex((item) => item.id === over.id);
      if (from >= 0 && to >= 0 && list[from].column === list[to].column) list = arrayMove(list, from, to);
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
                items={items.filter((item) => item.column === column.id && matches(item))}
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

export {
  KanbanBoard,
  KanbanCard,
  sampleRoadmapItems,
  type KanbanBoardProps,
  type KanbanCardProps,
  type KanbanColumn,
  type KanbanItem,
  type KanbanPerson,
  type KanbanTag,
};
