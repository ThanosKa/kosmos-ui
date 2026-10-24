# 06: Presets page και preset picker

**What to build:** Ο developer ανοίγει την Presets page από το nav του site. Διαλέγει preset, accent, radius και light/dark, και βλέπει components, ένα dashboard και forms να αλλάζουν live. Το chrome του site δεν αλλάζει. Το preset ζει στο URL, οπότε μοιράζεται με ένα link. Ένα «Get code» δίνει το CSS, την εντολή registry και το DESIGN.md του preset. Στο κινητό τα controls ανοίγουν σε bottom sheet. Ο ίδιος preset picker μπαίνει στο dashboard της landing, στη θέση των controls για accent και radius.

**Blocked by:** 04, 05

**Status:** ready-for-agent

- [ ] Ένα URL ανοίγει ακριβώς το ίδιο preset
- [ ] Το CSS που αντιγράφεται, μέσα σε ένα project, δίνει την ίδια εικόνα με το preview
- [ ] Menus, dialogs και toasts του preview παίρνουν το preset
- [ ] Το DESIGN.md δεν ονομάζει κανένα προϊόν
- [ ] Δουλεύει με πληκτρολόγιο και στα 375px
- [ ] Το dashboard της landing έχει τον ίδιο picker και η αλλαγή φτάνει στο iframe
- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build` περνούν
