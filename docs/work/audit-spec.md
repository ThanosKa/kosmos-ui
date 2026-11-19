# Spec: Audit Kosmos UI and guard it with checks

Status: ready-for-agent
Date: 2026-11-19

## Problem Statement

The maintainer builds Kosmos UI mostly through agents. Agents ship small UI flaws that nobody catches until the maintainer happens to see them: a focus ring that runs into the edge of a dialog, a divider that vanishes in dark mode, a docs page that scrolls sideways on a phone. The last broad audit was a month ago, and most of its findings are still open.

The review skills (the `better-*` family and Emil Kowalski's skills) have never run over the whole app. The Emil review ran on the landing page only, and `better-interface` has not run at all.

When a flaw is fixed, nothing stops the next agent from bringing it back. The lint rules cover colors, Button variants, transitions and inline styles, but most of the mistakes agents make are guarded only by sentences in the style skill, and an agent with a full context skips sentences.

The docs say how to use each component but rarely when to pick it. Only a few pages (Meter, Gauge, Stat card, Usage meter and two charts) compare a component with the ones it is confused with, so people and agents pick a Dialog where a Drawer fits, or a Select where a Combobox fits.

## Solution

One pass over the whole repo finds the flaws, agents fix them, and every flaw a machine can detect becomes a check that fails the next time an agent makes it.

1. **Audit.** `better-interface` reviews the whole repo in four parts: components, blocks and dashboards, the docs site, and the landing page with the Presets page. It reads the code and measures the running pages in the browser, in light and dark, at 375 and 1280 wide, with the Default preset, plus one pass under each preset that carries a style (Soft, Console, Night, Iris). It takes no screenshots. The findings land in one ranked list in `docs/work/`.
2. **Fixes.** Bugs (broken behavior, keyboard, screen reader, overflow, contrast below the floor) are fixed without asking. Matters of taste (spacing, weight, emphasis) are fixed when they agree with the style skill. Each fix is a ticket, and the maintainer reviews the PRs.
3. **Worst case.** `break-ui` feeds every component and block that renders data its worst realistic data, fixes what breaks, and leaves the worst-case data in the item's review preview for good.
4. **Motion and phones.** At the end, Emil's `improve-animations`, `remove-animations` and `mobile-native` run over the whole app, and their fixes ship.
5. **Checks.** Every finding a machine can detect becomes a check. Code checks join `pnpm lint` and run on every PR. Browser checks join a new site check command that runs on the release PR from `dev` to `main` and on demand.
6. **When to pick which.** Every family of components that people confuse gets a "When to pick which" section on each member's docs page.

## User Stories

1. As the maintainer, I want one review of the whole repo, so that I know every flaw the app has today instead of the ones I happen to see.
2. As the maintainer, I want the review split into components, blocks and dashboards, the docs site, and the landing page with the Presets page, so that each part gets a full review rather than a sample.
3. As the maintainer, I want every part reviewed in light and dark, so that flaws that only show in one theme are found.
4. As the maintainer, I want every part reviewed at 375 and 1280 wide, so that phone-only flaws are found.
5. As the maintainer, I want one extra pass under each preset that carries a style, so that flaws a style introduces (a clipped ring, a changed radius, a weaker contrast) are found.
6. As the maintainer, I want the audit to read code and measure the running pages without screenshots, so that it stays fast and leaves no image files behind.
7. As the maintainer, I want the findings in one list, ranked by severity, so that I read the most important first.
8. As the maintainer, I want each finding to name where it is, what is wrong, why it matters and the fix, so that an agent can act on it without asking.
9. As the maintainer, I want each finding marked as a bug or a matter of taste, so that I only decide the ones that need my judgment.
10. As the maintainer, I want the findings list in `docs/work/` beside the tickets, so that it is deleted with them when the work is done.
11. As the maintainer, I want the open findings of the October audit checked again, so that what is still broken is in the new list and what was fixed is dropped.
12. As the maintainer, I want the style skill to win every disagreement with a review skill, so that the audit does not undo deliberate Kosmos values.
13. As the maintainer, I want a finding that disagrees with a Kosmos value reported as "Kosmos style" and left alone, so that I can see the disagreement without the code changing.
14. As the maintainer, I want bugs fixed without asking me, so that I only spend time on decisions.
15. As the maintainer, I want taste findings fixed only where they agree with the style skill, so that the look stays mine without me stopping the work.
16. As the maintainer, I want one ticket per fix or per group of fixes with one cause, so that each PR stays small and reviewable.
17. As the maintainer, I want a finding with one shared cause (a token, a base component) fixed once at that cause, so that the fix reaches every place it shows.
18. As the maintainer, I want screenshots only when I ask for them, so that agents do not spend time on images I will not look at.
19. As the maintainer, I want every component and block that renders data tested with its worst realistic data (long names, unbreakable emails, one-letter names, missing fields, huge counts, zero items, non-Latin text, emoji, extreme numbers), so that it holds up with real users' data.
20. As the maintainer, I want what breaks under worst-case data fixed without being shown to me, so that the stress test does not wait on me.
21. As the maintainer, I want the worst-case data kept in each item's review preview, so that the next change to the item is checked against it.
22. As a Kosmos user, I want the docs demos to keep their normal sample data, so that the docs stay readable.
23. As the maintainer, I want Emil's `improve-animations` run over the whole app, so that motion that feels wrong is found and planned.
24. As the maintainer, I want Emil's `remove-animations` run over the whole app, so that motion with no purpose is taken out.
25. As the maintainer, I want Emil's `mobile-native` run over the whole app, so that the app feels right on a phone.
26. As the maintainer, I want these three run after the other fixes, so that they review the app as it will ship.
27. As the maintainer, I want every finding a machine can detect turned into a check, so that an agent cannot bring the flaw back.
28. As the maintainer, I want code checks in `pnpm lint`, so that they run on every PR and in my editor.
29. As an agent, I want each lint message to name the fix and the rule it comes from, so that I can correct my code without reading the style skill.
30. As the maintainer, I want each new lint rule to have a test that shows one snippet it flags and one it allows, so that a rule that stops working is caught.
31. As the maintainer, I want a browser check command that opens every page and every review preview and fails on a page that scrolls sideways at 375, a focus ring cut by its container, or a console error, so that flaws that only show at runtime are caught.
32. As the maintainer, I want that command to take a known-exceptions list, so that a deliberate exception does not fail it.
33. As the maintainer, I want the browser check to run on the PR from `dev` to `main`, so that nothing broken reaches production while daily PRs stay fast.
34. As the maintainer, I want to run the browser check myself whenever I want, so that I can check the app before a release PR.
35. As the maintainer, I want the checks to stay on ESLint, so that the custom rules keep working without a rewrite.
36. As the maintainer, I want the style skill to mention each new check beside the rule it guards, so that the sentence and the check never disagree.
37. As a Kosmos user, I want a "When to pick which" section on each component that has look-alikes, so that I pick the right one.
38. As an agent, I want "When to pick which" to name the alternative and when to use it, so that I choose the component that fits the job.
39. As the maintainer, I want the list of component families in the PR, so that I can see which families got the section.
40. As the maintainer, I want components with no look-alike left without the section, so that the docs carry no filler.
41. As the maintainer, I want each family's section to say the same thing on every member's page, so that the advice never disagrees with itself.
42. As a Kosmos user, I want a changelog entry for every fix that changes what I install, so that I know what changed when I update a component.

## Implementation Decisions

- **Order.** Audit, then fixes, then worst case, then Emil's motion and phone pass, then the checks. The "When to pick which" work depends on none of them and can run beside them. The checks are written last so they cover the findings of every earlier step, but a check for a finding may ship in the same PR as its fix.
- **Audit skills.** `better-interface` runs the audit and loads its `better-*` domain skills itself. It runs once per part (components; blocks and dashboards; docs site; landing page and Presets page), because the skill narrows its own scope when a request is too large and would leave parts unreviewed. Each run states the scope it covered.
- **Audit evidence.** The audit reads code and measures rendered pages through the site helper the screenshot and check scripts share, which opens a page in a chosen theme, width and reduced-motion setting. Measurements cover scroll width against the viewport, focus ring boxes against every clipping ancestor, computed contrast, and console errors. No screenshots are taken.
- **Audit output.** One ranked list in `docs/work/`, each finding with location, what is wrong, why it matters, the fix, severity, and bug or taste. A cause shared by many places is one finding with all its locations. Findings that disagree with the style skill are listed separately as "Kosmos style" and are not fixed.
- **Prior audit.** The October audit's findings (clipped focus rings in dialog bodies, tab panels, collapsible triggers and the sidebar; horizontal scroll on one docs page; a console warning on the Checkbox page; color and preset inconsistencies) are re-checked and folded into the new list. Its measuring scripts in the gitignored scratch folder are prior art for the site check.
- **Known finding.** The scrolling list in a Dialog draws its focus ring outside the list, onto the dialog's edges. Kosmos style draws a ring inside where a container would cut it. It goes in the list.
- **Fixes.** Bugs and the taste findings that agree with the style skill become tickets directly; no step waits for the maintainer. Each ticket follows the style skill and passes `pnpm lint`, `pnpm types:check` and `pnpm test`, plus `pnpm registry:check` when an item's files or dependencies change. Motion changes are reviewed with Emil's `review-animations` in their PR.
- **Worst case.** `break-ui` runs on every component and block that renders user data (tables, lists, cards, stat tiles, members, inbox, sidebars, headers, charts). The worst-case dataset lives in the item's review preview (`/view/<name>`) behind the Demo data / Worst case toggle and stays there. Docs demos keep their sample data. Sample data follows the demo world of the style skill.
- **Emil's pass.** `improve-animations` is read-only and writes plans, which become tickets. `remove-animations` removes motion directly. `mobile-native` fixes directly. The style skill's motion values win any disagreement.
- **Code checks.** New rules join the existing ESLint config, written as `no-restricted-syntax` selectors where a selector can express them, as the current color, Button and transition rules are. Each message names the fix and cites the style skill. Candidates known now: a dialog or drawer body with no bottom padding, a scroll area inside an overlay whose ring is drawn outside, a sticky header with a translucent fill, an icon-only button with no accessible name, an arbitrary pixel value outside the spacing scale, a ported item without its third-party notice, and key-like strings in demo data. The audit adds more.
- **Browser checks.** A new site check command, built on the shared site helper, walks every docs and site page and every review preview at 375 and 1280, light and dark, and fails on horizontal overflow, a focus ring clipped by an ancestor, or a console error, with a known-exceptions list. CI runs it on PRs into `main` only. The existing CI job keeps running lint, types, tests and build on every PR.
- **Linter.** ESLint stays. Oxlint was considered for speed, but the lint is not slow and the custom rules would need rewriting.
- **When to pick which.** The section follows the shape the Meter page already uses: one sentence on what the family shares, then one bullet per member saying what it is for, each naming its siblings by link. The family list goes in the PR body. Candidates: Dialog, Drawer, Popover and Tooltip; Select, Combobox and Command; Toast, Sonner, Alert and Banner; Tabs and Segmented control; Checkbox, Switch and Radio group.
- **Glossary.** `GLOSSARY.md` gains the terms this work introduces (audit, code check, browser check, worst-case data) in the PR that first uses them.
- **Already done.** Dialog and Drawer footers gained a soft fill and a divider that shows in dark (#101). The audit does not reopen them.

## Testing Decisions

- A good test checks behavior a user or an agent sees, never how a rule or a check is built: a lint rule flags a snippet and allows another; the site check fails on a page that overflows and passes on one that does not.
- **Code checks** are tested by running ESLint on small snippets inside `pnpm test`: one that must be flagged with the expected message and one that must pass. This is a new test seam, at the highest point: the lint result, not the selector.
- **Browser checks** are their own test: the site check command fails on a known-bad review preview and passes once it is fixed. The worst-case data in the review previews is what it measures.
- **Fixes** are covered by the two seams above, plus the existing suites: the preset and contrast tests in `pnpm test` for color, `pnpm registry:check` for registry items.
- Prior art: the preset, token and contrast tests in `pnpm test`; the shared site helper used by `pnpm screenshots`; the October audit's focus and overflow scripts.

## Out of Scope

- A lint package for Kosmos users' own apps. It comes after Kosmos goes live.
- A docs page on connecting an agent to the registry through MCP.
- Kosmos Pro, which lives in a private repo (ADR 0003) and has not started.
- Going live: releasing `dev` to `main` and deploying.
- The code-structure findings in the system design review (`docs/work/design-review.md`).
- Screenshots in the audit, and a rule that every visual change takes screenshots. The maintainer asks for them when wanted.
- Switching to oxlint.
- Making the Dialog draggable.

## Further Notes

- The Drawer already follows a swipe toward its edge to close, and the Sidebar already resizes by dragging its edge. The audit checks that both work; it does not add dragging elsewhere.
- `better-interface` does not review a branch or a PR; that is `interface-review`, which the maintainer starts. The audit reviews the repo as it stands on `dev`.
- The review skills check; the style skill sets values. A review finding never changes a token or a Kosmos value without the maintainer's decision.
