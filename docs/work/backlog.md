# Backlog: checks after the black and white release

Status: open
Date: 2026-10-25

Things the maintainer wants checked or built next. Each becomes a ticket in `docs/work/tickets/` when it is picked up.

## Checks

- [ ] **Docs writing.** Review the landing page and the docs pages with a technical-writing skill (the "pstack" skill the maintainer named; confirm which one) and fix what it finds.
- [ ] **Presets are downloadable.** Every preset a visitor picks can be taken away: the DESIGN.md downloads as a file, the CSS copies for light and dark, and the `preset-<id>` registry item installs with the shadcn CLI in a clean app.
- [ ] **Branch-wide code review.** The code review at the end of the black and white spec was skipped. Run it over the release and fix the findings.
- [ ] **Light reviews to finish.** Items that skipped the full `build-component` review (better-interface, break-ui, mobile-native): landing (15 and its revision), stat and chart cards (18), combobox and tags input (22), settings (25), members and invites (26). Also check the calendar (24) in the browser after its last fixes.
- [ ] **Hero copy logic.** The Hero block still has its own copy hook; move it onto `use-copy`.
- [ ] **Open decisions.** Go through the decisions collected during the run (`.scratch/decisions-black-and-white.md`) and settle each one.

## Build

- [ ] **Richer showcase.** The landing's Dashboard tab shows more than cards: the data table in full, with faceted filters, the bulk bar and the column menu working, in the dense pro-tool look.
- [ ] **MIT catalogue, wave A.** Port the first wave from the MIT catalogue (mockup and screenshot, device frames, marquee primitive, avatar circles, glow and section wrapper, card, spinner, progress, alert dialog and sheet, login and signup blocks).
