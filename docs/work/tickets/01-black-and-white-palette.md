# 01: Black and white palette

**What to build:** Το default palette γίνεται αληθινά γκρι σε light και dark, όπως ορίζει το ADR 0009: ink primary, focus σε ink με κενό, flat κάρτες με shadow ring και μαλακές σκιές μόνο στα overlays, mono ramp στα charts. Οι τωρινές τιμές (ADR 0007) κρατιούνται ως preset `Warm` για το 03. Το `kosmos-style` και το `tokens.md` περιγράφουν τους νέους κανόνες. Στο ίδιο PR μπαίνουν το ADR 0009, η σήμανση του 0007 ως superseded και οι όροι Preset, Accent, Brand colour και Presets page στο `GLOSSARY.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Κανένα token του default δεν έχει chroma πάνω από 0, εκτός από status και destructive
- [ ] Κείμενο 4.5:1 και focus 3:1 σε κάθε επιφάνεια, light και dark, με test
- [ ] Οι κάρτες δεν έχουν μαλακή σκιά, τα overlays έχουν
- [ ] Το `chart-1..5` είναι mono ramp
- [ ] Οι τιμές του ADR 0007 υπάρχουν αυτούσιες ως `Warm`
- [ ] Νέα baselines, εγκεκριμένα από τον Θάνο
- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build` περνούν
