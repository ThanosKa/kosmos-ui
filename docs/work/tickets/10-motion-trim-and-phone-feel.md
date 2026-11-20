# 10: Motion trim and phone feel

**What to build:** Across the whole app, motion with no purpose is gone and the app feels right on a phone. Emil's `remove-animations` removes motion on keyboard actions, high-frequency surfaces and pure decoration; `mobile-native` fixes the phone details (sticky hover, tap highlight, inputs that zoom, safe areas, viewport height). Spec: `docs/work/audit-spec.md`.

**Blocked by:** 33 (Worst-case leftovers).

**Model:** Opus

**Status:** ready-for-agent

- [ ] `remove-animations` runs over every component, block and site page; each removal is listed in the PR with its reason.
- [ ] `mobile-native` runs over the same scope; each fix is listed in the PR.
- [ ] The style skill's motion values win any disagreement; a disagreement is listed as "Kosmos style" and left alone.
- [ ] Reduced motion still cross-fades where motion remains.
- [ ] Emil's `review-animations` reviews the diff before the PR opens.
- [ ] The site check (ticket 01) passes.
- [ ] A changelog entry for each change a user installs.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check` pass.
