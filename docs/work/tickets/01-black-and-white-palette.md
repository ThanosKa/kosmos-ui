# 01: Black and white palette

**What to build:** Όποιος εγκαθιστά το Kosmos παίρνει black and white UI: αληθινά γκρι σε light και dark, ink primary, ink focus με κενό, mono ramp στα charts. Οι κάρτες κρατούν τις layered σκιές και το rim στο dark, γιατί αλλάζει μόνο το palette και όχι το style (ADR 0009). Οι τωρινές τιμές κρατιούνται για το preset Warm. Το style skill περιγράφει τους νέους κανόνες χρώματος. Στο ίδιο PR μπαίνουν το ADR 0009, η σήμανση του ADR 0007 ως superseded και οι όροι Preset, Accent, Brand colour και Presets page στο glossary.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Κανένα token του default δεν έχει chroma, εκτός από status και destructive
- [ ] Κείμενο 4.5:1 και focus 3:1 σε κάθε επιφάνεια, light και dark, με pure test
- [ ] Οι κάρτες έχουν τις ίδιες layered σκιές και το ίδιο rim με πριν
- [ ] Τα πέντε chart series είναι mono ramp
- [ ] Οι τιμές του ADR 0007 υπάρχουν αυτούσιες για το Warm
- [ ] Νέα baselines, εγκεκριμένα από τον Θάνο
- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build` περνούν
