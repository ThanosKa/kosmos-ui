# 01: Το module των presets

**What to build:** Τα tokens του Kosmos βγαίνουν από ένα module presets: η λίστα των presets, το CSS ενός preset για light και dark, και το DESIGN.md του. Στην αρχή έχει μόνο ένα preset, το Warm, με τις σημερινές τιμές του ADR 0007, και αυτό μένει default. Όποιος εγκαθιστά το Kosmos δεν βλέπει καμία διαφορά. Από εδώ και πέρα όμως κάθε preset ελέγχεται αυτόματα για contrast.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Τα screenshots είναι ίδια με πριν
- [ ] Το CSS του Warm δίνει ακριβώς τις τιμές του ADR 0007
- [ ] Pure tests για κάθε preset, light και dark: κείμενο 4.5:1 σε κάθε επιφάνεια, focus και chart marks 3:1
- [ ] Το CSS που βγάζει ένα preset ξαναδιαβάζεται και δίνει τις ίδιες τιμές
- [ ] Το DESIGN.md ενός preset περιέχει κάθε τιμή του
- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build` περνούν
