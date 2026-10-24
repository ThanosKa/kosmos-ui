# 02: Status tints

**What to build:** Έξι status hues (gray, blue, green, teal, orange, red) με τα tokens `tint-<hue>`, `-border`, `-foreground`, `-link`, `-dot` και `-solid`, με τιμές και κανόνες από το issue #34: dot με λέξη για states, tinted pill για κωδικούς, νέο Alert component (info, success, warning, destructive, neutral) με tint για κάθε tone εκτός από neutral, που το παίρνουν και τα callouts των docs. Το gray παίρνει τα βήματα του Radix `gray`. Το Radix MIT notice μπαίνει δίπλα στα tokens. Το μωβ brand και ο κανόνας του app surface του #34 δεν μπαίνουν.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Κείμενο και link κάθε tint 4.5:1 πάνω στο fill του, light και dark, με test
- [ ] Το `Status` δείχνει dot με λέξη, το `Badge` έχει tinted variants χωρίς border
- [ ] Το Alert και τα callouts των docs παίρνουν fill, border, κείμενο και link από το tint του tone τους
- [ ] Το notice του Radix είναι δίπλα στα tokens και στο registry item
- [ ] Περνά τον κύκλο `build-component`, με screenshots στο νέο palette (μετά το 01)
- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build` περνούν
