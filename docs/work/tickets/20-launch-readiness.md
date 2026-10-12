# 20: Έτοιμο για launch

**What to build:** Το `dev` είναι έτοιμο να βγει δωρεάν, χωρίς λογαριασμούς, πληρωμές ή «coming soon». Ο agent περνά όλο το site και κλείνει ό,τι βρει: metadata και OG images, sitemap, robots, llms.txt, σελίδες `.md`, links, 404, search, το site URL από το env. Σβήνει τα παλιά audit και redesign αρχεία στο `.scratch/` που τα ευρήματά τους έκλεισαν. Γράφει στο PR μια λίστα για τον Θάνο με όσα θέλουν λογαριασμό του: domain, DNS, env vars στο hosting και το release PR από το `dev` στο `main`.

**Blocked by:** 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19

**Status:** ready-for-agent

- [ ] `pnpm types:check`, `pnpm lint`, `pnpm build`, `pnpm registry:check` και `pnpm registry:smoke` περνούν για όλα τα items
- [ ] Κανένα broken link στο site (ελεγμένο με crawl του production build)
- [ ] Κάθε σελίδα έχει τίτλο, περιγραφή και OG image
- [ ] Το PR έχει τη λίστα με τα βήματα του Θάνου για το launch
