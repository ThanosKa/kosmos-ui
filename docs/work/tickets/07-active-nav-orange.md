# 07: Πορτοκαλί στο ενεργό στοιχείο της πλοήγησης

**What to build:** Ο χρήστης βλέπει με μια ματιά πού βρίσκεται. Νέο token `active-foreground`: light `oklch(0.53 0.17 38)`, dark ίσο με το `ring`. Χρωματίζει το κείμενο και το icon του ενεργού sidebar item, του ενεργού tab του header του site και του ενεργού item στο phone menu. Το raised surface του ενεργού sidebar item μένει. Τα buttons μένουν ink. Το token μπαίνει στο `tokens.css` μαζί με το Sidebar, που είναι το πρώτο component που το χρησιμοποιεί. Είναι η μόνη εξαίρεση στον κανόνα «orange never colors text» και γράφεται στο ADR 0007 και στον κανόνα χρώματος του `kosmos-style`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Το `active-foreground` περνά 4.5:1 σε page, secondary, sidebar και hover, σε light και dark (μετρημένο, με τα νούμερα στο PR)
- [ ] Ενεργό sidebar item, ενεργό header tab και ενεργό item του phone menu το χρησιμοποιούν
- [ ] Τα ADR 0007, `kosmos-style` (Color και tokens) και η σελίδα Foundations > Color δείχνουν το νέο token
- [ ] Κύκλος `build-component` για το Sidebar, και changelog entry
