# Backlog

Ό,τι μένει να γίνει πριν και μετά το launch. Κάθε γραμμή σβήνεται στο PR που την κλείνει.

## Πριν το launch

1. **Ταυτότητα των blocks:** τα 8 blocks παίρνουν νέα demo δεδομένα σε κόσμο SaaS analytics (χρήστες, έσοδα, events, projects· το kanban γίνεται roadmap του product) και δική μας εμφάνιση, ώστε να μη θυμίζουν τα προϊόντα που μελετήσαμε.
2. **Accordion:** όταν ανοίγει ένα item και κλείνει άλλο, το ύψος «χοροπηδάει», γιατί το άνοιγμα παίρνει 300ms και το κλείσιμο 150ms.
3. **Textarea και Input:** σύγκριση του focus με το shadcn· η λεπτή γραμμή εμφανίζεται απότομα ενώ η λάμψη κάνει fade.
4. **Sidebar icon mode:** στο collapse μένει στενή στήλη με εικονίδια και tooltip, αντί να κρύβεται τελείως.
5. **Πορτοκαλί στο ενεργό link:** νέο σκούρο πορτοκαλί για κείμενο (C1) στο ενεργό στοιχείο του nav. Θέλει αλλαγή στο ADR 0007 και στο `kosmos-style`.
6. **Landing page:** νέα σελίδα με ιδέες από τις landing pages άλλων design systems.
7. **Μικρές αποφάσεις** (τις παίρνει ο Claude και δείχνει το αποτέλεσμα): μέγεθος τίτλου στα docs, aliases του shadcn στο Button, τα pills μόνο στις κλειστές ομάδες, χρώματα για sidebar handle, Meter, scroll thumb και overflow cue.
8. **Μικροπράγματα:** ο νεκρός κώδικας για table rows στο `components/site/search-dialog.tsx`, τα `href="#…"` στα examples του Badge και του Button, το αχρησιμοποίητο `tall` στο `ComponentPreview`.
9. **Domain:** αγορά domain και `NEXT_PUBLIC_SITE_URL`, ώστε να δουλεύουν οι εντολές install.
10. **Έγκριση και launch.**

## Μετά το launch

- **Block categories** με πολλές εκδοχές η καθεμία, πρώτα Auth (sign up, log in, OTP, forgot password), Settings και Dashboards.
- Components που θα ζητήσει ο κόσμος (Card, Breadcrumb, Pagination κ.λπ.).

## Αποφασισμένα

- Το command palette μένει χωρίς animation (κανόνας του `kosmos-style`).
