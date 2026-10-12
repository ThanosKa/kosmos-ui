# 21: Κατηγορία Auth με τη δωρεάν εκδοχή

**What to build:** Η πρώτη νέα Application κατηγορία. Ο agent μελετά 4–5 πραγματικά προϊόντα και φτιάχνει σελίδα σύγκρισης με screenshots στο `.scratch/`, εκτός git. Διαλέγει την κατεύθυνση και τη γράφει στο PR χωρίς ονόματα προϊόντων. Μετά χτίζει τη δωρεάν εκδοχή της κατηγορίας Auth: sign up, log in, OTP και forgot password, στον νέο demo κόσμο. Παίρνουμε μόνο ιδέες, ποτέ κώδικα (ADR 0004).

**Blocked by:** 16

**Status:** ready-for-agent

- [ ] Η σελίδα σύγκρισης υπάρχει στο `.scratch/research/` και το PR λέει πού
- [ ] Τα Auth blocks υπάρχουν στο registry ως Application, Free, και φαίνονται στη σελίδα της κατηγορίας με block viewer
- [ ] Οι φόρμες έχουν labels, errors, loading και κατάσταση επιτυχίας, και δουλεύουν με πληκτρολόγιο
- [ ] Κύκλος `build-component`, `pnpm registry:check`, docs και changelog entry
- [ ] Κανένα όνομα προϊόντος σε tracked αρχείο
