# 03: Presets

**What to build:** Ένας μηχανισμός που εφαρμόζει ένα preset στο document root (ώστε να το παίρνουν και τα portals) και τα πέντε πρώτα presets: Default (χωρίς accent), Warm, Soft, Console, Night. Από το issue #33 τα Soft, Console και Night παίρνουν μόνο palette και radius. Τα `[data-accent]` swatches, το `active-foreground` και το `meter-primary` περνούν στο accent του preset.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Κάθε preset αλλάζει μόνο tokens χρωμάτων και radius
- [ ] Contrast tests (κείμενο 4.5:1, focus και chart 3:1) τρέχουν για κάθε preset, light και dark
- [ ] Menus, dialogs και toasts παίρνουν το preset
- [ ] Τα accent swatches της landing δεν υπάρχουν πια ως ξεχωριστός μηχανισμός
- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build` περνούν
