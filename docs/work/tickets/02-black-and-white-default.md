# 02: Black and white Default

**What to build:** Όποιος εγκαθιστά το Kosmos παίρνει black and white UI: αληθινά γκρι σε light και dark, ink primary, ink focus με κενό, mono ramp στα charts. Οι κάρτες κρατούν τις layered σκιές και το rim στο dark, γιατί αλλάζει μόνο το palette και όχι το style (ADR 0009). Το Warm μένει διαθέσιμο ως preset. Το style skill περιγράφει τους νέους κανόνες χρώματος. Στο ίδιο PR μπαίνουν το ADR 0009, η σήμανση του ADR 0007 ως superseded και οι όροι Preset, Accent, Brand colour και Presets page στο glossary.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Το Default δεν έχει chroma, εκτός από status και destructive, με pure test
- [ ] Οι κάρτες έχουν τις ίδιες layered σκιές και το ίδιο rim με πριν
- [ ] Τα πέντε chart series είναι mono ramp
- [ ] Το Default περνά τα contrast tests του 01
- [ ] Νέα baselines, εγκεκριμένα από τον Θάνο
- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build` περνούν
