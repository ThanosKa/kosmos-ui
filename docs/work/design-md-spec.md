# Spec: DESIGN.md in the Google Labs format

Status: ready-for-agent
Date: 2026-11-15

## Problem Statement

The maintainer gives away a DESIGN.md with every preset, so that a user's agent (Claude, Cursor, Copilot) builds new screens in that preset. Today that file is a Kosmos-only layout: palette tables, Accent, Radius and size, Style, Focus, Do and Don't. It does not follow the DESIGN.md format published by Google Labs (`google-labs-code/design.md`), which agents and tools now read: no YAML token block, and no Typography, Layout, Elevation & Depth, Shapes or Components sections. Fonts, type roles, shadows, layout rules and component values live only in the `kosmos-style` skill, which a user never gets.

The repo itself has no DESIGN.md. An agent or a person opening the Kosmos UI repo finds no single file that describes the design of the project in the format other tools understand.

The file is also built on the spot in the browser when a visitor opens "Get code", so it has no address of its own: it cannot be linked, handed to an agent by URL, or shipped by the registry later.

## Solution

Every DESIGN.md Kosmos UI produces follows the Google Labs format: a YAML token block between `---` fences (`version`, `name`, `description`, `colors`, `typography`, `rounded`, `spacing`, `components`), then the sections in the format's order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts, plus a Motion section the format allows as an extra heading.

There are two kinds:

- **A preset DESIGN.md** for every choice on the Presets page (preset, accent on or off, radius, size). The build writes each one as a static file with a stable address beside its registry item. The "Get code" dialog shows that file and its Download button gives it. It never holds the brand color.
- **The site DESIGN.md** at the root of the repo: the design of Kosmos UI as it is, which is the Default preset plus the site's brand color and the rules for where the brand color appears. The build writes it, the same way it already writes the Default preset into `tokens.css`.

Both come from the one existing generator in `lib/presets`, so a new preset or a changed token reaches every DESIGN.md on the next build, with no file edited by hand. Each one passes Google's own linter with no errors.

## User Stories

1. As a Kosmos user, I want the DESIGN.md I download to follow the Google Labs format, so that any agent or tool that reads that format understands it.
2. As a Kosmos user, I want the DESIGN.md to match exactly the preset, accent, radius and size I picked, so that my agent builds in the look I chose.
3. As a Kosmos user, I want every color in light and in dark, so that my agent builds dark mode correctly too.
4. As a Kosmos user, I want the colors named as the Kosmos tokens (the shadcn names: `background`, `card`, `primary-foreground`), so that my agent writes `bg-card` and not a name that exists nowhere in my code.
5. As a Kosmos user, I want each dark color named as its light token plus `-dark` (`card-dark`), so that I can tell at a glance which value belongs to which mode.
6. As a Kosmos user, I want the colors in their exact `oklch` values, so that nothing is lost to a conversion.
7. As a Kosmos user, I want a Typography section with every type role (caption, small, body, title, heading, display, hero, lead) and its size, line height, weight and tracking, so that my agent sets text the Kosmos way.
8. As a Kosmos user, I want the fonts named (Geist Sans, Geist Mono), so that my agent does not fall back to a default font.
9. As a Kosmos user, I want the radius ladder (control, overlay, card, checkbox) in the `rounded` tokens, so that my agent rounds each surface correctly.
10. As a Kosmos user, I want the spacing unit and the heights it gives (a 30px button, a 34px text field) in the `spacing` tokens and the Layout section, so that my agent sizes controls the Kosmos way.
11. As a Kosmos user, I want the size I picked (Compact, Default, Comfortable) reflected in the spacing unit, so that the file matches the size I installed.
12. As a Kosmos user, I want an Elevation & Depth section that says surfaces draw their edge with a layered shadow, never a depth border, and names the shadow for each surface, so that my agent does not add borders to cards.
13. As a Kosmos user, I want the dark-mode shadow rule (a dark outer ring and a 1px inner rim of light) stated, so that my agent keeps the Kosmos signature in dark.
14. As a Kosmos user, I want a Components section with YAML entries for the core components (primary, secondary, ghost and destructive buttons with their hover, text field, card, popover, dialog, badge, sidebar item idle and current, tabs), so that my agent has exact values for what it builds most.
15. As a Kosmos user, I want every component entry in light and in `-dark`, so that the linter checks the contrast of each pair in both modes.
16. As a Kosmos user, I want the focus rule (a 2px offset outline, and the text field's own ring) in the Components section, so that my agent keeps focus visible.
17. As a Kosmos user, I want the accent rule (what the accent fills, and that nothing else takes it) in the Colors section, so that my agent does not spread the accent over links and text.
18. As a Kosmos user, I want to know when my preset has no accent, so that my agent keeps everything in ink.
19. As a Kosmos user of Soft, Console, Night or Iris, I want the preset's own style (shadows, weights, motion, and its `data-slot` CSS rules) in Elevation & Depth and Shapes, so that my agent builds in that style and keeps the rules outside any `@layer`.
20. As a Kosmos user, I want a Motion section with the easings and durations, so that my agent animates at the Kosmos speeds.
21. As a Kosmos user, I want the Do's and Don'ts, so that my agent avoids the mistakes the Kosmos style rules out.
22. As a Kosmos user, I want each DESIGN.md at a stable address, so that I can hand the link to an agent or share it without opening the site.
23. As a Kosmos user, I want the Download button to keep working as today, so that getting the file stays one click.
24. As a Kosmos user, I want the code view in "Get code" to show the same file I download, so that what I read is what I get.
25. As a Kosmos user, I want the file to name no product other than Kosmos and its tools, so that it reads as the Kosmos design and not a copy of another app.
26. As the maintainer, I want the repo to hold a DESIGN.md that describes Kosmos UI itself, so that anyone opening the repo, and any agent working in it, gets the design in a standard format.
27. As the maintainer, I want the site DESIGN.md to include the brand color and say it appears only on the site, so that it describes the project as it really looks.
28. As the maintainer, I want the brand color never to reach a preset DESIGN.md, so that what I give away matches what users install.
29. As the maintainer, I want the build to fail if a preset DESIGN.md holds the brand color, as it already fails for a registry item, so that the rule cannot slip.
30. As the maintainer, I want to add a new preset by writing only its palette, so that all its DESIGN.md files appear on the next build.
31. As the maintainer, I want a token change to reach every DESIGN.md on the next build, so that I never edit one by hand.
32. As the maintainer, I want every DESIGN.md checked by Google's linter in `pnpm test`, so that a broken token reference or a failing contrast pair fails before it ships.
33. As the maintainer, I want the site DESIGN.md rewritten by `pnpm dev` and `pnpm build`, so that a stale copy shows up as a git change.
34. As the maintainer, I want the `kosmos-style` skill to stay the source of truth for agents in this repo, so that the site DESIGN.md never overrules it.
35. As an agent working in this repo, I want the site DESIGN.md to agree with the `kosmos-style` skill and `tokens.css`, so that I do not get two answers.
36. As a tool that reads the Google format, I want a `primary` color, resolvable token references and sections in the canonical order, so that I parse the file without errors.

## Implementation Decisions

- **One generator.** The existing preset DESIGN.md generator in `lib/presets` is rewritten to emit the Google Labs format. It keeps its public role: given a preset choice, return the DESIGN.md text. A variant of the same function produces the site DESIGN.md (the Default preset plus a brand section), so both kinds share every value and rule.
- **Token block.** `version: alpha`, `name`, a one-sentence `description` (the preset's existing description), then:
  - `colors`: every palette token under its Kosmos (shadcn) name for light, and the same name plus `-dark` for dark. Values stay in the exact `oklch` notation the palette uses, alpha included. The format accepts any CSS color, and Google's linter converts them itself for the contrast check (verified by running it on a sample).
  - `typography`: one entry per type role, with `fontFamily`, `fontSize`, `fontWeight`, `lineHeight` and `letterSpacing` read from the tokens, and a mono entry.
  - `rounded`: the radius ladder resolved for the chosen radius.
  - `spacing`: the spacing unit for the chosen size, and the control heights it gives.
  - `components`: the core set listed in user story 14, each with a `-dark` twin, using the valid properties only (`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `height`), referencing tokens as `{colors.card}`.
- **Sections in order.** Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts, with Motion after Components. Today's content moves rather than disappears: the palette uses and the accent rule go to Colors; Radius and size to Shapes and Layout; a preset's style to Elevation & Depth and Shapes; Focus to Components; Do and Don't to Do's and Don'ts. Shadows have no token type in the format, so they are named in prose and in a table in Elevation & Depth.
- **Static files.** `pnpm registry:build` writes one preset DESIGN.md per preset choice, at a stable address beside that choice's registry item under the built registry output, and writes the site DESIGN.md at the repo root. The build's existing brand-color check also covers the preset DESIGN.md files.
- **Dialog.** The "Get code" dialog shows the preset DESIGN.md and its Download button gives the built file at its address, instead of a `data:` URL made in the browser.
- **Brand color.** Only the site DESIGN.md holds it, read from its one source, with the rule that it appears only on the site and never in the tokens a user installs.
- **No new ADR.** Adopting the Google format is a change of output, easy to reverse, and does not overturn an ADR. ADR 0014 (presets carry a style) still applies: the DESIGN.md says a preset's rules win over utility classes.
- **Glossary.** `GLOSSARY.md` gains the terms the two kinds of file need (preset DESIGN.md, site DESIGN.md), in the PR that adds them.

## Testing Decisions

- **One seam: the DESIGN.md text the generator returns.** Tests call the generator for a choice (and for the site) and check the text, never its internals. The static files are that same text written to disk, so they need no separate test.
- **Google's linter is the independent check.** A test runs the linter from `@google/design.md` (its `lint` library export, added as a dev dependency) on the DESIGN.md of every preset choice and on the site DESIGN.md, and fails on any error and on any `contrast-ratio` or `section-order` warning. `orphaned-tokens` warnings are allowed for tokens that have no component pair (rings, the scrim, the scrollbar thumb, the chart series), since adding components only to reference them would be filler.
- **Existing tests stay, adapted to the new layout.** Every value appears, light and dark, each on its token's own line; a DESIGN.md names no product; the accent rule says what the accent colors, or that the preset has none. These read the generator's text and check facts from the palette, not a copy of the generator's logic.
- **A brand-color test.** No preset DESIGN.md holds the brand color; the site DESIGN.md does.
- **Prior art:** `lib/presets/presets.test.mts` and `lib/presets/choice.test.mts` (node's test runner, `pnpm test`), which already test the generator's output this way.
- **Not tested:** a comparison of the committed site DESIGN.md with the generator's output. It would compare the code with itself; the build rewrites the file, and a stale copy shows as a git change.

## Out of Scope

- Shipping the DESIGN.md through `shadcn add` (a `registry:file` with a `~/DESIGN.md` target in each preset item). The static file makes it easy to add later.
- Google's `export` (Tailwind or DTCG output) and `diff` commands.
- Replacing or shortening the `kosmos-style` skill. It stays the source of truth for agents in this repo.
- YAML entries for components beyond the core set (charts, tables, marketing blocks). The Components prose covers them.
- Hex values beside the `oklch` ones.
- New presets, or changes to any palette, radius or size value.

## Further Notes

- The format's reference repo is `google-labs-code/design.md`; its skeleton and the "Paws and Paths" example were the model. Section aliases (Brand & Style, Layout & Spacing, Elevation) exist, but the canonical names are used.
- About 150 preset choices exist (six presets, accent on and off where a preset has one, the radii and the three sizes), which is why the files come from the generator and not from hand.
- A sample run of the linter on Kosmos token names and `oklch` values accepted both, reported a broken `{colors.…}` reference as an error, flagged a 1.04:1 pair as a contrast warning, and flagged unused colors as `orphaned-tokens` warnings.
