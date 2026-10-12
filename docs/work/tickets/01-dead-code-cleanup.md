# 01: Καθάρισμα νεκρού κώδικα και παλιών branches

**What to build:** Το repo κρατά μόνο κώδικα που χρησιμοποιείται. Φεύγουν ο κλάδος για table rows στο site search, τα `href="#…"` στα examples του Badge και του Button (γίνονται αληθινά links ή αλλάζει το example), και το αχρησιμοποίητο prop `tall` του ComponentPreview. Σβήνονται τα remote branches που έχουν ήδη μπει στο `dev` ή έχουν μείνει πίσω χωρίς ανοιχτό PR (σήμερα το `docs/spec-ideas`), αφού ελεγχθεί ότι δεν κρατούν commits που λείπουν από το `dev`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Το site search δεν έχει πια κώδικα για table rows και βρίσκει ό,τι έβρισκε πριν
- [ ] Κανένα example δεν έχει `href="#…"`
- [ ] Το ComponentPreview δεν έχει prop `tall`
- [ ] Κάθε remote branch που σβήστηκε αναφέρεται στο PR, μαζί με το γιατί ήταν ασφαλές
- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build` περνούν
