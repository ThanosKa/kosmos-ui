# 14: When to pick which

**What to build:** Each component that people or agents confuse with another has a "When to pick which" section on its docs page, so the right one gets picked. The maintainer approves the list of families before any section is written. Spec: `docs/work/audit-spec.md`.

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Status:** ready-for-agent (stops for the maintainer's approval of the families)

- [ ] The agent lists every family of look-alike components and blocks, starting from: Dialog, Drawer, Popover and Tooltip; Select, Combobox and Command; Toast, Sonner, Alert and Banner; Tabs and Segmented control; Checkbox, Switch and Radio group. It sends the list to the maintainer in plain words and stops until it is approved.
- [ ] Each approved family gets the section on every member's page, in the shape the Meter page uses: one sentence on what the family shares, then one bullet per member saying what it is for, linking its siblings.
- [ ] The section says the same thing on every member's page.
- [ ] Components with no look-alike get no section.
- [ ] Families that already have the section (Meter, Gauge, Donut chart, Usage meter, Stat card, Segmented gauge) are checked and left as they are unless wrong.
- [ ] Prose follows the `technical-writing` skill and `pnpm prose` passes with no errors.
- [ ] `pnpm lint`, `pnpm types:check` and `pnpm test` pass.
