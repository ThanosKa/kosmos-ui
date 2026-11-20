# 13: Site check in CI

**What to build:** A pull request from `dev` into `main` cannot merge while the site check finds a page that scrolls sideways, a clipped focus ring or a console error. Daily PRs into `dev` stay as fast as today. Spec: `docs/work/audit-spec.md`.

**Blocked by:** 01 (Site check command), 10 (Motion trim and phone feel), 11 (Motion plans), the motion fix tickets 34 (Icon swaps and small marks), 35 (Chart motion) and 36 (Copy icon swaps), and every fix ticket created by 07.

**Model:** Sonnet

**Status:** ready-for-agent

- [ ] The site check passes on `dev` with only reasoned entries on its known-exceptions list.
- [ ] CI runs it on pull requests into `main` only: it builds the site, serves it, and runs the check.
- [ ] The existing CI job (lint, types, tests, build) still runs on every PR and on pushes to `dev`, unchanged.
- [ ] A failing run names the route, theme, width and check in its log.
- [ ] `AGENTS.md` says the release PR runs the site check, and how to run it locally.
- [ ] Delete `docs/work/audit-spec.md`, `docs/work/audit.md` and this tickets folder in this PR if every other ticket is done.
