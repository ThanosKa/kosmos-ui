# 04: Accent μέσα στα presets

**What to build:** Ένα preset μπορεί να έχει accent, που χρωματίζει το focus, το τρέχον item της πλοήγησης, το meter και το πρώτο chart series. Τα accent swatches του dashboard της landing γίνονται presets με accent, και τα components που σήμερα παίρνουν το χρώμα της πλοήγησης και του meter από δικά τους tokens το παίρνουν από το accent. Στο τέλος ο παλιός μηχανισμός σβήνεται.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Το Warm έχει το πορτοκαλί ως accent και δείχνει ίδιο με πριν
- [ ] Τα contrast tests καλύπτουν το accent: focus 3:1, κείμενο πλοήγησης 4.5:1
- [ ] Κανένα component δεν χρησιμοποιεί πια τα παλιά tokens για πλοήγηση και meter
- [ ] Τα accent swatches δεν υπάρχουν πια ως ξεχωριστός μηχανισμός
- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build` περνούν
