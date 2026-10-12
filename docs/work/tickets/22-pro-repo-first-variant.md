# 22: Ιδιωτικό repo και πρώτη Pro εκδοχή

**What to build:** Ξεκινά το Pro. Δημιουργείται το ιδιωτικό repo `kosmos-pro`. Είναι δικό του Next.js app που εγκαθιστά τα δωρεάν components από το `@kosmos` registry όπως κάθε χρήστης, με τα δικά του review previews και το δικό του registry smoke. Η πρώτη Pro εκδοχή είναι μια δεύτερη εκδοχή της κατηγορίας Auth. Στο δημόσιο site εμφανίζεται στη σελίδα της κατηγορίας με badge Pro. Τρέχει live μέσα σε iframe από το deployment του ιδιωτικού app, που ορίζεται με env var, και η καρτέλα Code είναι κλειδωμένη. Ο κώδικας του Pro δεν μπαίνει ποτέ στο δημόσιο repo. Το ADR 0003 αποκτά ενότητα για τον διαχωρισμό free/Pro ανά block category και για τα Pro previews μέσα σε iframe.

**Blocked by:** 20, 21

**Status:** ready-for-agent

- [ ] Το `kosmos-pro` υπάρχει ως ιδιωτικό repo στον λογαριασμό του Θάνου και κάνει build
- [ ] Το δημόσιο repo έχει μόνο τα metadata της Pro εκδοχής (όνομα, κατηγορία, URL preview), όχι κώδικα
- [ ] Χωρίς το env var του Pro deployment, οι Pro εκδοχές δεν φαίνονται και τίποτα δεν σπάει
- [ ] Ο αριθμός εκδοχών στο sidebar μετρά και τις Pro
- [ ] Το ADR 0003 και το `GLOSSARY.md` ενημερώνονται
- [ ] Το PR λέει στον Θάνο πώς συνδέεται το deployment του `kosmos-pro`
