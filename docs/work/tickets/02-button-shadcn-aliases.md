# 02: Button με τα ονόματα του shadcn ως aliases

**What to build:** Ένας developer που αντικαθιστά το Button του shadcn με το Kosmos Button δεν σπάει τα Dialog, Alert Dialog και Pagination του shadcn. Το Button δέχεται τα ονόματα του shadcn ως aliases: variant `default`→`primary`, `outline`→`secondary`, `link`, και size `default`→`md`, `xs`→`sm`, `icon-xs`→`icon-sm`. Μέσα στον κώδικα του Kosmos τα aliases απαγορεύονται από κανόνα ESLint. Ο κανόνας «a variant nothing uses is deleted» στο `kosmos-style` αποκτά αυτή την εξαίρεση.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Κάθε alias αποδίδει ακριβώς ό,τι το Kosmos όνομα στο οποίο αντιστοιχεί, και φαίνεται στο review preview
- [ ] Ένας κανόνας ESLint απορρίπτει τα aliases μέσα στο registry, στα components και στο content του site
- [ ] Το registry smoke έχει περίπτωση: καθαρό shadcn app, το Button του shadcn αντικαθίσταται με το δικό μας, τα Dialog, Alert Dialog και Pagination του shadcn μπαίνουν και το app κάνει build
- [ ] Το `kosmos-style` γράφει την εξαίρεση, και τα docs του Button αναφέρουν τα aliases
- [ ] Κύκλος `build-component` και changelog entry
