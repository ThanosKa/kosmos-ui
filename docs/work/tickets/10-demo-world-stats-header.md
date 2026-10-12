# 10: Νέος demo κόσμος στο Stats overview και το Page header

**What to build:** Τα blocks παύουν να μοιάζουν με CRM. Ο νέος demo κόσμος είναι ένα φανταστικό SaaS analytics product (χρήστες, έσοδα, events, projects), και γράφεται στο `build-component` skill στη θέση του σημερινού κόσμου πωλήσεων. Το Stats overview και το Page header ξαναγίνονται για αυτόν, με δικές τους μετρικές, tabs και διάταξη, ώστε να μην αντιστοιχούν σε οθόνη προϊόντος που μελετήσαμε (ADR 0004). Η μέθοδος του στυλ μένει: σκιές αντί για borders, πυκνή τυπογραφία, γρήγορη κίνηση.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Το `build-component` περιγράφει τον νέο κόσμο (όνομα product, οντότητες, ονόματα και domains) και δεν αναφέρει πια accounts, owners ή health
- [ ] Τα δύο blocks, τα review previews, τα demos και οι σελίδες docs χρησιμοποιούν μόνο τον νέο κόσμο
- [ ] Το Page header φιλτράρει σωστά το block της λίστας που το συνοδεύει στα docs
- [ ] Κύκλος `build-component`, `pnpm registry:check` για τα δύο blocks, και changelog entry
