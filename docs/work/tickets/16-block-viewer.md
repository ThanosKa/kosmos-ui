# 16: Block viewer

**What to build:** Κάθε εκδοχή μιας block category φαίνεται σε δικό της block viewer, σε όλο το πλάτος του περιεχομένου, ώστε το block να μην κόβεται ποτέ από στενή στήλη. Η γραμμή εργαλείων έχει: όνομα, badge Free ή Pro, Preview και Code, desktop, tablet και phone, άνοιγμα σε νέα καρτέλα, και εντολή install με αντιγραφή. Το preview τρέχει μέσα σε iframe, ώστε τα container queries του block να απαντούν στο πλάτος που διαλέγει ο επισκέπτης. Η καρτέλα Code δείχνει όλα τα αρχεία του block. Μια Pro εκδοχή δείχνει κλειδωμένη την καρτέλα Code με link προς το Pro, αλλά Pro εκδοχές θα υπάρξουν από το ticket 22.

**Blocked by:** 15

**Status:** ready-for-agent

- [ ] Τα τρία πλάτη αλλάζουν το πλάτος του iframe, και το block απαντά με τη διάταξή του
- [ ] Το Code δείχνει κάθε αρχείο του registry item με το path εγκατάστασής του
- [ ] Το «άνοιγμα σε νέα καρτέλα» ανοίγει το block μόνο του σε όλη τη σελίδα
- [ ] Ο viewer δουλεύει με πληκτρολόγιο και έχει accessible names σε κάθε κουμπί
- [ ] Ο viewer ξέρει να δείξει μια Pro εκδοχή (badge, κλειδωμένο Code) από τα δεδομένα του registry
- [ ] Playwright φωτογραφίζει μια σελίδα κατηγορίας στα τρία πλάτη του viewer
- [ ] Ο όρος block viewer χρησιμοποιείται όπως στο `GLOSSARY.md`
