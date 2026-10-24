# 04: Presets page

**What to build:** Η Presets page στο nav του site. Αριστερά τα controls: preset, accent, radius, light/dark, reset. Δεξιά ένα live preview με tabs Components, Dashboard, Forms, από το περιεχόμενο της Gallery. Το state ζει στο URL. Ένα κουμπί «Get code» ανοίγει dialog με CSS (`:root` και `.dark`), εντολή registry και DESIGN.md του preset (palette, radius, κανόνας focus, do και don't). Στο κινητό τα controls είναι bottom sheet.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Η αλλαγή preset αλλάζει μόνο το preview, όχι το chrome του site
- [ ] Ένα URL ανοίγει ακριβώς το ίδιο preset
- [ ] Το CSS που αντιγράφεται, αν μπει σε project, δίνει την ίδια εικόνα με το preview
- [ ] Το DESIGN.md περιγράφει το preset χωρίς ονόματα προϊόντων
- [ ] Δουλεύει με πληκτρολόγιο και στα 375px
- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build` περνούν
