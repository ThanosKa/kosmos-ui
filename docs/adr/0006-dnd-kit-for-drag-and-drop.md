# dnd-kit for drag and drop

The Kanban board block moves cards with dnd-kit (`@dnd-kit/core` 6, `@dnd-kit/sortable` 10, `@dnd-kit/utilities` 3) rather than native HTML drag and drop, Motion's `Reorder` or a hand-written pointer handler. The shadcn ecosystem's kanban and sortable examples use dnd-kit. It ships the parts a board needs that the alternatives leave out. It has a keyboard sensor (Space picks up, arrows move, Space drops, Escape cancels). It also has screen-reader instructions and live announcements, touch and mouse sensors with activation constraints, auto-scroll inside scroll containers, and a drag overlay. Native drag and drop has no keyboard or touch support. Motion's `Reorder` handles one list, not more than one column.

The block uses the stable `@dnd-kit/core` line instead of the newer `@dnd-kit/react`, which is still 0.x.

_Decided without the user (2026-10-11), pending confirmation._

## Consequences

- `@kosmos/kanban-board` declares the three dnd-kit packages as dependencies. No component (only this block) depends on them.
- dnd-kit positions cards with inline `transform` and `transition` styles. The block passes them as CSS variables (`--kanban-card-transform`, `--kanban-card-transition`), so inline `style` still carries only variables.
- Sibling cards slide with the `base` duration (200ms) and the `power3-out` curve from `@kosmos/motion`. Under reduced motion the slide and the drop animation are off and the dragged card does not tilt.
- Left and Right move a card to the same position in the next column through a custom keyboard coordinate getter. Up and Down use dnd-kit's sortable default.
- The drag overlay renders into `document.body`, so a transformed ancestor (such as a preview stage) cannot offset it.
