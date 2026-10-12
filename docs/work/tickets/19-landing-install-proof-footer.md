# 19: Landing με install και agents, αποδείξεις και footer

**What to build:** Η landing κλείνει με τρία κομμάτια. Μια ενότητα δείχνει την εντολή του shadcn CLI όπως τρέχει και την υποστήριξη για agents (llms.txt, σελίδες `.md`). Οι αποδείξεις δείχνουν τα stars του GitHub και την ημερομηνία του τελευταίου update, τραβηγμένα από πραγματικά δεδομένα. Ακολουθεί το footer. Το footer γίνεται η δωρεάν εκδοχή της Marketing κατηγορίας Footer, με δική του σελίδα στα docs.

**Blocked by:** 17

**Status:** ready-for-agent

- [ ] Τα stars και η ημερομηνία έρχονται από το GitHub με cache, και η σελίδα δείχνει κάτι λογικό αν το request αποτύχει
- [ ] Το Footer block υπάρχει στο registry ως Marketing, Free, με docs και κύκλο `build-component`
- [ ] Κάθε ενότητα έχει την ετικέτα του block της
- [ ] Screenshots της landing σε light και dark, 375 και 1280, με agent visual review
