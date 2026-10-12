# 05: Ένα overflow cue παντού

**What to build:** Το περιεχόμενο που κόβεται και κάνει scroll δείχνεται με τον ίδιο τρόπο παντού: το fade του ScrollArea. Το παίρνουν το Dialog, το Drawer, το Dropdown menu, το Popover και η tab list όταν ξεχειλίζει, αντί για ό,τι έχει το καθένα σήμερα.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Και τα πέντε δείχνουν fade μόνο στην πλευρά που έχει κρυμμένο περιεχόμενο, και το fade φεύγει στο τέλος του scroll
- [ ] Το review preview κάθε component έχει περίπτωση με περιεχόμενο που ξεχειλίζει
- [ ] Ο κανόνας γράφεται μία φορά στο `kosmos-style`
- [ ] Κύκλος `build-component` για κάθε component που αλλάζει, και changelog entry
