# 06: Focus στα text fields δίπλα στο shadcn

**What to build:** Το focus των Input, Textarea και Select trigger δεν φαίνεται πιο απότομο από του shadcn. Ο agent βάζει δίπλα δίπλα τα δύο (screenshots και `agent-browser`, σε light και dark). Αν το δικό μας είναι πιο απότομο, η λεπτή γραμμή αποκτά το ίδιο fade με τη λάμψη. Το outline πρέπει να μένει ορατό σε forced-colors mode. Αν δεν φαίνεται πιο απότομο, το ticket κλείνει με τη σύγκριση γραμμένη στο PR.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Η σύγκριση με τα screenshots είναι στο PR, και η απόφαση γράφεται στην ενότητα Focus του `kosmos-style`
- [ ] Αν αλλάξει το focus: fade στη γραμμή και στη λάμψη με τα ίδια duration και easing tokens, και το outline φαίνεται σε forced-colors emulation
- [ ] Το invalid state κρατά το νόημά του όσο έχει focus
- [ ] Κύκλος `build-component` για τα τρία fields, και changelog entry αν αλλάξει κάτι
