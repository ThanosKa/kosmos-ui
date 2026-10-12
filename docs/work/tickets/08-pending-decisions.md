# 08: Κλείσιμο των αποφάσεων «pending confirmation»

**What to build:** Το `kosmos-style` και το `build-component` δεν έχουν πια σημειώσεις «Decided without the user, pending confirmation». Ο agent ξανακοιτάει κάθε μία με τα σημερινά screenshots και την κρατά ή την αλλάζει, και η σημείωση φεύγει. Αποφασίζει επίσης για το blurred header του site: είτε γράφεται κανόνας στο `kosmos-style` είτε το header γίνεται solid. Ο Θάνος βλέπει τις αποφάσεις στο τέλος, πάνω στο `dev`.

**Blocked by:** 03, 04, 05, 06, 07

**Status:** ready-for-agent

- [ ] Καμία σημείωση «pending confirmation» στα tracked skills
- [ ] Το PR έχει πίνακα: απόφαση, κρατήθηκε ή άλλαξε, μία γραμμή γιατί
- [ ] Κάθε απόφαση που άλλαξε περνά από τον κύκλο `build-component` για τα components που αγγίζει, με changelog entry
- [ ] Το header του site έχει κανόνα στο `kosmos-style` ή είναι solid
