# Spec: Black and white, presets και τα blocks που λείπουν

Label: ready-for-agent
Status: open
Ημερομηνία: 2026-10-24

Τα tickets αυτού του spec ζουν στο `docs/work/tickets/`. Κάθε ticket σβήνεται στο PR που το κλείνει, και όταν κλείσουν όλα σβήνεται και το spec. Το research με ονόματα προϊόντων είναι στο `.scratch/research/industry/` (εκτός git, ADR 0004). Για τη landing, αυτό το spec αντικαθιστά την ενότητα «Landing» του `spec.md`.

## Problem Statement

- **Το Kosmos δεν μοιάζει με τα dev tools που φτιάχνουν οι χρήστες του.** Το ζεστό κρεμ με το πορτοκαλί (ADR 0007) ξεχωρίζει, αλλά τα καλύτερα SaaS dev tools είναι black and white.
- **Δεν έχουμε δική μας ταυτότητα** ως προϊόν, ξεχωριστή από το palette των components.
- **Ο χρήστης δεν μπορεί να αλλάξει την εμφάνιση** και να πάρει τον κώδικα. Τα controls υπάρχουν μόνο μέσα στο dashboard της landing.
- **Η landing δεν μοιάζει με SaaS landing:** δεν έχει navbar block, marquee, pricing, FAQ ή CTA.
- **Λείπουν components και blocks** που έχει κάθε dashboard: breadcrumb, submenus στο sidebar, stat και chart cards, pagination, φίλτρα πίνακα, form controls, settings.

## Solution

1. **Black and white default** με αληθινά γκρι, flat κάρτες και mono charts (ADR 0009). Το παλιό palette γίνεται το preset `Warm`.
2. **Status tints** από το issue #34: έξι hues, dot για states, pill για κωδικούς, tints σε ένα νέο Alert και στα callouts των docs.
3. **Presets** (palette και radius μόνο): Default, Warm, Soft, Console, Night. Τα τρία τελευταία παίρνουν από το issue #33 μόνο palette και radius.
4. **Presets page** στο nav του site, και ο ίδιος picker στο dashboard της landing.
5. **Brand colour** για το site: ένα σκέτο χρώμα σε logo, σημάδια Pro και text selection, που το διαλέγει ο Θάνος με το μάτι ανάμεσα σε 4 υποψήφια.
6. **Τα blocks σε τρία κύματα**, με τη landing ξαναχτισμένη μόνο από blocks.

## User Stories

1. Ως developer, εγκαθιστώ το Kosmos και παίρνω black and white UI που ταιριάζει με ένα σύγχρονο dev tool.
2. Ως developer, διαλέγω preset στη Presets page, βλέπω components, dashboard και forms να αλλάζουν live, και αντιγράφω CSS, εντολή registry ή DESIGN.md.
3. Ως developer, μοιράζομαι ένα preset στέλνοντας το URL.
4. Ως developer, δίνω DESIGN.md σε έναν agent και χτίζει στο στυλ του preset μου.
5. Ως επισκέπτης της landing, βλέπω navbar, hero, το stack, ένα live dashboard, features, inventory, pricing, FAQ και CTA, και κάθε section είναι block που μπορώ να εγκαταστήσω.
6. Ως επισκέπτης, αναγνωρίζω το Kosmos από το brand colour, ενώ τα components μένουν ουδέτερα.
7. Ως developer, βρίσκω έτοιμα breadcrumb, sidebar submenus, workspace switcher, user menu, stat card, chart card, pagination και φίλτρα πίνακα.
8. Ως developer, βρίσκω form controls (input group, combobox, radio cards, date picker, tags, number) και settings blocks.

## Implementation Decisions

### Palette και style

- Αληθινά γκρι (chroma 0) σε light και dark. Οι τιμές ξεκινούν από το `.scratch/research/industry/presets/README.md` και ελέγχονται για contrast.
- Primary κουμπί: ink σε light, το αντίστροφο σε dark. Focus: ink με μειωμένο alpha και κενό στο χρώμα της σελίδας, τουλάχιστον 3:1.
- Flat κάρτες με shadow ring. Οι μαλακές σκιές μένουν στα overlays. Είναι αλλαγή στο **style**, οπότε ενημερώνεται και το `kosmos-style`.
- Charts: mono ramp (ink και μετά γκρι βήματα). Χρώμα μόνο από status hue ή από το accent ενός preset.
- Status hues: gray, blue, green, teal, orange, red, με τιμές και κανόνες από το #34 και το Radix MIT notice δίπλα στα tokens. Το μωβ brand και ο κανόνας του app surface του #34 δεν μπαίνουν.

### Presets

- Ένα preset αλλάζει μόνο palette (με προαιρετικό **accent**) και radius, ποτέ font ή density.
- Πρώτη έκδοση: Default (χωρίς accent), Warm (το palette του ADR 0007), Soft, Console, Night.
- Τα `[data-accent]` swatches, το `active-foreground` και το `meter-primary` περνούν στο μηχανισμό των presets.
- Η Presets page: controls αριστερά (preset, accent, radius, light/dark, reset), preview δεξιά με tabs Components, Dashboard, Forms, state στο URL, ένα κουμπί «Get code» με CSS, εντολή registry και DESIGN.md. Βασίζεται στο περιεχόμενο της Gallery.

### Brand colour

- Ζει μόνο στο site, ποτέ στα tokens του registry. Σκέτο χρώμα, όχι gradient, και όχι το ροζ-βιολετί που έχει ήδη άλλο προϊόν.

### Landing

Σειρά: navbar, hero, marquee με το stack (Base UI, Tailwind CSS, React, Next.js, shadcn CLI), live dashboard με preset picker, bento, inventory, pricing (Free και Pro), FAQ, CTA, footer. Κάθε section είναι block του registry. Testimonials block φτιάχνεται, αλλά δεν μπαίνει στη landing μέχρι να υπάρχουν αληθινά.

### Κύματα blocks

- **Κύμα 1:** navbar, logo marquee, feature section, pricing, FAQ, CTA, testimonials, announcement pill, code tabs, breadcrumb, sidebar submenus, workspace switcher, user menu, stat card, chart card, pagination, faceted filters, bulk-action bar και column menu στον πίνακα.
- **Κύμα 2:** input group με copy/secret field, combobox, radio group και radio cards, calendar και date picker, tags input, number input, settings section, settings page, members και invites.
- **Κύμα 3** (tickets αργότερα): resource list με item primitives, activity feed, integrations grid, onboarding checklist, empty variants, notifications popover, KPI tabs, ranked bar list, heatmap, JSON viewer, key-value list, changelog.
- **Pro** (στο `kosmos-pro`, ADR 0003): log viewer, diff view, inbox, mobile tab bar, analytics funnels και retention, πλήρης σελίδα pricing με σύγκριση.

### Τρόπος δουλειάς

- Τα tickets τρέχουν παράλληλα όπου δεν αγγίζουν τα ίδια αρχεία. Τα blocks χτίζονται από τώρα, αλλά τα screenshots του review περιμένουν το ticket 01, για να μην εγκριθεί το παλιό palette.
- Κάθε component και block περνά τον κύκλο `build-component`.

## Testing Decisions

- Contrast tests πάνω στα tokens: κείμενο 4.5:1, focus και chart marks 3:1, σε light και dark, για κάθε preset.
- Τα tests του #34 για τα tints: κείμενο και link πάνω στο fill τους, 4.5:1.
- Τα tokens που εγκαθιστά ο χρήστης δεν περιέχουν το brand colour.
- Νέα baselines μετά το ticket 01, αφού τα εγκρίνει ο Θάνος.

## Out of Scope

- Font και density ανά preset.
- Billing block (το `spec.md` το βγάζει εκτός, γιατί το καλύπτει ο πάροχος πληρωμών).
- Τα υπόλοιπα designs του #33 (purple, mint, ledger, signal, kargul) ως presets.
- Το κύμα 3 μέχρι να κλείσουν τα κύματα 1 και 2.
