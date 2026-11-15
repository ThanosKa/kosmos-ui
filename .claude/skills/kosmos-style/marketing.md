# Marketing blocks and pages

The marketing blocks are Hero, Logo marquee, Bento, Feature section, Pricing, FAQ, CTA and Testimonials; the landing page stacks them. Every rule in SKILL.md still holds here; this file adds the page rhythm, the larger type and the motion only marketing uses.

## Page rhythm

A marketing block sets no padding around itself: the page that stacks them sets one rhythm, so two blocks never add their padding up into a gap of their own. Spacing inside a block (title to content, content to its link) stays the block's.

- Each section sits in a column with `px-4 sm:px-6` gutters and keeps space below it only: `pb-20` (80px) on phones, `md:pb-28` (112px) from 768px. The page sets it with screen breakpoints, because the rhythm belongs to the page, not to any block's width.
- The hero takes room above it, `pt-16 md:pt-24`, and less below, `pb-10 md:pb-12`, when a showcase or strip that belongs to it follows (a Showcase right under it, or a Logo marquee of the stack or of customers), so the product shows in the first screen.
- The last section before the footer keeps `pb-28 md:pb-40`, so the page ends on a pause rather than on the footer's edge.
- The text column is `max-w-5xl`; a showcase (a live app in a frame, a grid of tiles) widens to `max-w-6xl`. The FAQ keeps its own 672px column inside it.
- A block's demo and review preview wrap it in the same padding a page would give it (`px-4 py-14 sm:px-6 sm:py-20` in the demo frame).

## Section grammar

Every section follows one order: a centered title, at most two short lines split at a comma (`<br />`), then optional tabs, then the content, then at most one `secondary` link to see more. A section has no eyebrow, and a line under the title only when the title cannot carry the point alone.

## Type

Marketing blocks and the site's marketing sections are the only text above 14px: their titles, the line under them and a headline count. The roles are fixed sizes, not fluid ones: a block steps up a role with a container variant (`text-display @2xl:text-hero`), so it sizes by its own width like every block. `@2xl:` is a 672px container.

| Role | Size / line-height / weight / tracking | Marketing use |
| --- | --- | --- |
| `text-hero` | 56 / 1.1 / 600 / -0.035em | The title of a hero from `@2xl:`; a count that is the visual of a marketing tile (`tabular-nums`) |
| `text-display` at `font-semibold` | 32 / 40 | A section title from `@2xl:`; a hero title below it |
| `text-heading` | 20 / 28 / 600 / -0.01em | A section title below `@2xl:` |
| `text-lead` | 18 / 1.6 / 400 / -0.01em | The one line under a hero or section title from `@2xl:` (`text-body` below); the featured quote in Testimonials |
| `text-title` | 16 / 24 / 600 / -0.02em | A name in the Logo marquee |

`text-hero` and `text-lead` never appear in an application block.

## Motion

- Text reveal brings a title in word by word: each word takes `duration-reveal` (500ms) on `ease-power3-out`, 120ms after the one before, with the spread capped at 900ms. Under reduced motion it only fades in.
- Landing sections rise once as they scroll into view: the title, then 100ms later the content, or each pricing plan 100ms after the last (`components/site/landing-motion.tsx`).
- The drift (`@/registry/kosmos/lib/drift`) moves the Logo marquee and the Testimonials wall at a constant speed (`speed`, pixels per second), one animation frame at a time, as a `transform` on a track with `will-change-transform`.
  - A mouse or pen over it, a finger pressing it or keyboard focus inside it eases it to a stop (time constant 0.32s), and it winds back up when let go (0.7s), so ambient motion glides rather than halts.
  - It runs only while on screen, and has a pause button that is visually hidden until keyboard focus reaches it (WCAG 2.2.2).
  - Under reduced motion it does not run at all, and the content stands still in full.
