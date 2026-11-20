# 32: Radix Colors notice on the tokens

**What to build:** The tokens item ships the Radix Colors notice that ADR 0010 and the status tints changelog entry say it ships. Today no `LICENSE-RADIX-COLORS` file exists and the tokens item lists none. Found by ticket 17. Spec: `docs/work/audit-spec.md`.

**Blocked by:** None (can start immediately).

**Model:** Sonnet

**Touches:** tokens registry item, a new `LICENSE-RADIX-COLORS`.

**Status:** ready-for-agent

- [ ] `LICENSE-RADIX-COLORS` holds the Radix Colors MIT license with its copyright line, beside the other notices.
- [ ] The tokens item lists it in `files` and marks itself with `meta.sources: ["radix-colors"]`, so the third-party notice test covers it.
- [ ] A changelog entry says the tokens now install the notice.
- [ ] `pnpm lint`, `pnpm types:check`, `pnpm test` and `pnpm registry:check tokens` pass.
