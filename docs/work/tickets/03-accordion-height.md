# 03: Accordion χωρίς «χοροπήδημα»

**What to build:** Όταν στο Accordion ανοίγει μια ενότητα και ταυτόχρονα κλείνει μια άλλη, τα δύο ύψη κινούνται με την ίδια διάρκεια και καμπύλη, ώστε το συνολικό ύψος να μένει σταθερό και η σελίδα να μη χοροπηδάει. Είναι εξαίρεση στον κανόνα «exits run faster» και γράφεται στο `kosmos-style`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Σε accordion με ένα ανοιχτό item, το άνοιγμα ενός άλλου κρατά το περιεχόμενο κάτω από το accordion ακίνητο σε όλη την κίνηση (ελεγμένο με `agent-browser`)
- [ ] Με reduced motion η αλλαγή γίνεται χωρίς κίνηση ύψους
- [ ] Η εξαίρεση γράφεται στην ενότητα Motion του `kosmos-style`
- [ ] Κύκλος `build-component` και changelog entry
