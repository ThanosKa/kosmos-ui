# 03: Status tints και Alert

**What to build:** Ο developer δείχνει την κατάσταση ενός πράγματος με dot και λέξη, έναν κωδικό (HTTP status, method) με tinted pill, και ειδοποιεί τον χρήστη με ένα νέο Alert (info, success, warning, destructive, neutral). Έξι status hues (gray, blue, green, teal, orange, red) με fill, border, κείμενο, link, dot και, για green, blue, orange και red, solid, με τιμές και κανόνες από το issue #34. Τα callouts των docs παίρνουν το Alert. Το Radix MIT notice ταξιδεύει μαζί με τα tints. Το μωβ brand και ο κανόνας του app surface του #34 δεν μπαίνουν.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Pure test: κείμενο και link κάθε tint 4.5:1 πάνω στο fill του, και το solid 4.5:1 με λευκό κείμενο, light και dark
- [ ] Το Status δείχνει dot με λέξη, το Badge έχει tinted variants χωρίς border
- [ ] Το Alert και τα callouts των docs παίρνουν fill, border, κείμενο και link από το tint του tone τους
- [ ] Ο έλεγχος του registry επιβεβαιώνει ότι το Radix notice συνοδεύει τα tints
- [ ] Περνά τον κύκλο `build-component`, με τα screenshots του review στο black and white palette (μετά το 02)
- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build` περνούν
