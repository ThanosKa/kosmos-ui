# 04: Διορθώσεις χρωμάτων στο Sidebar, το Meter και το ScrollArea

**What to build:** Τρεις μικρές διορθώσεις στην palette. Η λαβή resize του Sidebar παίρνει neutral hover, ώστε το hover να μη μοιάζει ποτέ με keyboard focus. Οι τόνοι primary και warning του Meter παίρνουν διαφορετική φωτεινότητα, ώστε να ξεχωρίζουν και χωρίς χρώμα. Το thumb του ScrollArea γίνεται πιο ελαφρύ, ώστε να μην είναι το πιο βαρύ σημάδι στην οθόνη.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Το hover της λαβής resize είναι neutral, και το focus μένει πορτοκαλί
- [ ] Οι τόνοι primary και warning του Meter ξεχωρίζουν σε grayscale screenshot, σε light και dark
- [ ] Το thumb του ScrollArea είναι ελαφρύτερο και περνά ακόμα 3:1 ως μη-κειμενικό στοιχείο όπου το απαιτεί το `kosmos-style`
- [ ] Οι τιμές μπαίνουν ως tokens και τα `kosmos-style` και ADR 0007 ενημερώνονται όπου αλλάζει κανόνας
- [ ] Κύκλος `build-component` για Sidebar, Meter και ScrollArea, και changelog entry
