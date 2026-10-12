# Spec: Kosmos UI μετά το MVP (launch και Pro)

Label: ready-for-agent
Status: open
Ημερομηνία: 2026-10-13

Αυτό το spec αντικαθιστά το `docs/backlog.md`. Τα tickets που βγαίνουν από αυτό μπαίνουν στο `docs/work/tickets/`. Ό,τι ολοκληρώνεται σβήνεται από εδώ με commit, και όταν κλείσει όλο το spec σβήνεται κι αυτό.

## Problem Statement

Ο Θάνος έχει χτίσει το MVP του Kosmos UI: 30 components, 8 blocks, docs και landing. Όμως:

- **Τα blocks μοιάζουν αντίγραφο.** Η μέθοδος του στυλ ήρθε από μελέτη προϊόντων (ADR 0004). Ο κώδικας είναι γραμμένος από την αρχή, αλλά τα 8 blocks αντιστοιχούν ένα προς ένα στις οθόνες ενός CRM που μελετήσαμε, με τον ίδιο κόσμο στα demo δεδομένα (accounts, owners, health). Όποιος ξέρει την πηγή θα το αναγνωρίσει, και κανείς δεν πληρώνει για κάτι που μοιάζει αντίγραφο.
- **Δεν υπάρχει τρόπος να βγουν λεφτά.** Το repo είναι δωρεάν (MIT). Δεν έχει αποφασιστεί τι πουλάμε, πώς οργανώνεται και πού ζει ο κώδικάς του.
- **Τα docs δεν δείχνουν σωστά τα blocks.** Ένα block στριμώχνεται στη στενή στήλη της σελίδας και κόβεται. Το sidebar είναι ένα και μακρύ.
- **Η landing δεν λέει τίποτα.** Δεν δείχνει τι είναι το Kosmos, πόσα έχει ή γιατί να το διαλέξει κανείς.
- **Μένουν μικρά bugs και αποφάσεις:** το accordion «χοροπηδάει», το Sidebar κρύβεται τελείως στο collapse, το πορτοκαλί του brand δεν φαίνεται πουθενά στην πλοήγηση.
- **Τα σχέδια χάνονται.** Map, spec και tickets ζούσαν σε φάκελο που αγνοεί το git και χάθηκαν.

## Solution

Τρεις φάσεις.

1. **Καθάρισμα και launch δωρεάν.** Διορθώνουμε τα μικρά, προσθέτουμε icon mode στο Sidebar, δίνουμε στα 8 blocks δική τους ταυτότητα (νέος demo κόσμος), ξαναστήνουμε τη δομή των docs και τη landing, και βγαίνουμε δωρεάν, χωρίς λογαριασμούς και πληρωμές.
2. **Pro σε ιδιωτικό repo.** Κάθε block category έχει μία απλή εκδοχή δωρεάν στο δημόσιο repo και τουλάχιστον μία Pro εκδοχή στο ιδιωτικό. Από πάνω έρχονται ολόκληρα templates (app, marketing, AI). Τα Pro φαίνονται live στο δημόσιο site, με κλειδωμένο κώδικα.
3. **Πακετάρισμα** όταν ο Θάνος πει «ok»: τιμές, άδεια, ιδιωτικό registry με license key, πληρωμές.

Η θέση στην αγορά: **design system για dashboard apps στο Base UI**, με app, marketing και AI blocks και templates. Οι εκδοχές για apps είναι πιο σπάνιες στην αγορά από τις landing pages, και τα admin dashboards είναι η κατηγορία που αποδεδειγμένα πουλάει.

## User Stories

### Developer που χρησιμοποιεί το Kosmos UI

1. As a developer, I want every component free under MIT, so that I can use Kosmos in any project without paying.
2. As a developer, I want one free variant in every block category, so that I can judge the quality before I buy.
3. As a developer, I want to install a free block with one shadcn CLI command, so that it lands in my project with its components.
4. As a developer, I want the 8 existing blocks to show a SaaS analytics product (users, revenue, events, projects), so that they fit the app I am building and do not look like someone else's CRM.
5. As a developer, I want the blocks to share one fictional product, so that I can combine them into a single dashboard.
6. As a developer, I want the Sidebar to collapse into a narrow icon column with tooltips, so that my app keeps its navigation visible when the sidebar is closed.
7. As a developer, I want to toggle the collapsed Sidebar with a keyboard shortcut, so that I can switch fast.
8. As a developer, I want the collapsed Sidebar to remember its state, so that it stays as I left it on the next visit.
9. As a developer, I want the Sidebar on a phone to keep opening as a drawer, so that icon mode does not break small screens.
10. As a developer, I want the Accordion to open one section and close another without the page jumping, so that the motion feels smooth.
11. As a developer, I want Kosmos Button to accept shadcn's variant and size names, so that overwriting shadcn's Button with ours does not break shadcn's Dialog, Alert Dialog and Pagination.
12. As a developer, I want text fields to show focus the way I expect from shadcn, so that Kosmos does not feel abrupt next to it.
13. As a developer, I want the current page in the navigation marked in the brand orange, so that I see where I am at a glance.
14. As a developer, I want the brand orange used for text only where it passes 4.5:1, so that the navigation stays readable.
15. As a developer, I want neutral hover colors on the sidebar resize handle, so that hover never looks like keyboard focus.
16. As a developer, I want the Meter's primary and warning tones to be clearly different, so that I can tell them apart.
17. As a developer, I want a lighter ScrollArea thumb, so that the scrollbar is not the heaviest mark on the screen.
18. As a developer, I want one overflow cue across dialogs, drawers, menus, popovers and tab lists, so that scrolling content reads the same everywhere.
19. As a developer, I want the command palette to open instantly, so that a keyboard shortcut I use all day never waits on an animation.

### Επισκέπτης των docs

20. As a docs visitor, I want each header tab (Docs, Components, Blocks, Templates) to show only its own sidebar, so that I am not scrolling through everything.
21. As a docs visitor, I want the Blocks sidebar grouped into Application, Marketing and AI, so that I find a category by what I am building.
22. As a docs visitor, I want a count of variants next to every block category, so that I know how much is inside before I open it.
23. As a docs visitor, I want a block category page to show all its variants one under another, so that I compare them on one page.
24. As a docs visitor, I want each variant in a full-width block viewer, so that the block is never cut off by a narrow column.
25. As a docs visitor, I want desktop, tablet and phone buttons on the block viewer, so that I see how a block responds.
26. As a docs visitor, I want a Preview and a Code view on every free variant, with every file of the block, so that I can read what I install.
27. As a docs visitor, I want to open a block in a new tab, so that I can try it at full size.
28. As a docs visitor, I want a Free or Pro badge on every variant, so that I know what I can install now.
29. As a docs visitor, I want the Pro variants to run live with their code locked, so that I see exactly what I would buy.
30. As a docs visitor, I want a Templates page that shows every template as a large card with a live demo, so that I can try a whole app.
31. As a docs visitor, I want the page title larger than the section headings, so that the page reads with a clear hierarchy.
32. As a docs visitor, I want the count pill on a sidebar group only while the group is closed, so that an open group is not cluttered.
33. As a docs visitor, I want the component pages to keep their current shape (preview, install, examples, API), so that what already works stays.

### Επισκέπτης της landing

34. As a landing visitor, I want the hero to show a real dashboard built from Kosmos, with tabs for whole screens, so that I see the product working, not a picture of it.
35. As a landing visitor, I want to change the accent, radius and light/dark live on that dashboard, so that I see how far I can restyle it.
36. As a landing visitor, I want a bento of real dashboard components, each with one line of text, so that I understand what is inside in seconds.
37. As a landing visitor, I want an inventory with counts (components, block categories, variants, templates), so that I see the size of the library.
38. As a landing visitor, I want the install command shown as it runs, plus llms.txt and agent support, so that I know it works with my tools.
39. As a landing visitor, I want honest proof (GitHub stars, a date of the last update), so that I trust that the project is alive.
40. As a landing visitor, I want every landing section built from Kosmos blocks and labelled with its block, so that I can find any piece in the docs.
41. As a landing visitor, I want no fake testimonials, discount banners, rotating headlines or pop-ups, so that the page feels serious.
42. As a landing visitor, I want a clear path to the Pro blocks and templates once they exist, so that I know there is more.

### Αγοραστής Pro (Φάση 2)

43. As a Pro buyer, I want to pay once and get updates, so that I am not on another subscription.
44. As a Pro buyer, I want to install Pro blocks with the same shadcn CLI and a license key, so that Pro works like the free blocks.
45. As a Pro buyer, I want templates as whole apps I can run, so that I start from a finished product.
46. As a Pro buyer, I want app blocks that almost nobody sells (audit log, API keys and webhooks, roles and members, sessions and devices, notification settings, CSV import with column mapping, usage limits and trial end), so that Kosmos saves me work no other kit does.
47. As a Pro buyer, I want AI blocks for agent products (prompt composer, assistant message, tool approval, run timeline, trace waterfall, docked copilot, usage and cost cards, eval grid), so that I can build an AI product's UI.
48. As a Pro buyer, I want templates for SaaS analytics, an AI assistant workspace, project management, an agent ops console and a marketing site that matches the dashboard, so that I cover the apps I am most likely to build.

### Maintainer (Θάνος)

49. As the maintainer, I want the plans (spec, tickets, handoffs) in the repo, so that they are never lost again.
50. As the maintainer, I want finished plans deleted with a commit, so that the repo holds only open work.
51. As the maintainer, I want Pro code in a separate private repo from its first line, so that it never enters the public git history.
52. As the maintainer, I want to judge every new block category from a comparison page of real products, so that I decide by eye, not by reading research.
53. As the maintainer, I want Claude to take the small, standard decisions and show me the result, so that I only answer the questions that matter.
54. As the maintainer, I want to approve a group by looking at it and saying what bothers me, so that approval does not need technical knowledge.
55. As the maintainer, I want the stale branches, dead code and leftover notes cleaned up, so that the repo is easy to work in.
56. As the maintainer, I want the price, the license and payments decided only when blocks and templates are ready, so that I do not build a store before there is something to sell.

### Claude (agent που χτίζει)

57. As Claude, I want every decision of this spec in one tracked file, so that a new session continues without the conversation.
58. As Claude, I want the new demo world written in the `build-component` skill, so that every new block uses it.
59. As Claude, I want the active-nav orange recorded in ADR 0007 and `kosmos-style`, so that the rule "orange never colors text" has one documented exception.
60. As Claude, I want the free/Pro split per block category recorded in ADR 0003, so that nobody puts a Pro variant in the public repo.

## Implementation Decisions

### Προϊόν και διανομή

- **Free components:** όλα τα components, και μία απλή εκδοχή σε κάθε block category, στο δημόσιο repo με MIT.
- **Pro:** οι υπόλοιπες εκδοχές κάθε block category, και όλα τα templates. Ο κώδικας ζει σε ξεχωριστό ιδιωτικό repo (`kosmos-pro`), που δημιουργείται με το πρώτο Pro block. Είναι δικό του Next.js app που εγκαθιστά τα δωρεάν components από το `@kosmos` registry όπως κάθε χρήστης, και έχει δικά του review previews.
- **Pro στο δημόσιο site:** τα Pro previews τρέχουν live μέσα σε iframe από το deployment του ιδιωτικού app. Ο κώδικάς τους δεν μπαίνει ποτέ στο δημόσιο repo. Η καρτέλα Code είναι κλειδωμένη.
- **Παράδοση Pro (Φάση 3):** ιδιωτικό shadcn registry με license key, ώστε το Pro να εγκαθίσταται με την ίδια εντολή. Τα templates παραδίδονται ως πρόσβαση σε ιδιωτικό repo.
- **Τιμή:** εφάπαξ πληρωμή με updates. Ίσως δύο προϊόντα: μόνο blocks, ή blocks μαζί με templates. Τα ποσά αποφασίζονται στη Φάση 3.
- **Launch:** δωρεάν, χωρίς λογαριασμούς, πληρωμές ή «coming soon». Το Pro εμφανίζεται στο site όταν υπάρχουν Pro εκδοχές.
- Το ADR 0003 αποκτά ενότητα για τον διαχωρισμό free/Pro ανά block category και για τα Pro previews μέσα σε iframe.

### Ταυτότητα των blocks

- **Demo κόσμος:** ένα φανταστικό SaaS analytics product (χρήστες, έσοδα, events, projects). Το kanban γίνεται το roadmap του product. Αντικαθιστά τον σημερινό κόσμο πωλήσεων (accounts, owners, health) σε όλα τα blocks, στη landing και στο `build-component` skill.
- **Εμφάνιση:** η μέθοδος του στυλ μένει (σκιές αντί για borders, πυκνή τυπογραφία, γρήγορη κίνηση). Η διάταξη, οι στήλες και οι μετρικές κάθε block ξαναγίνονται για τον νέο κόσμο, ώστε κανένα block να μην αντιστοιχεί σε οθόνη προϊόντος που μελετήσαμε.
- Τα 8 blocks γίνονται οι δωρεάν εκδοχές των κατηγοριών τους.

### Στυλ και components

- **Active nav:** νέο token `active-foreground`, light `oklch(0.53 0.17 38)` (4.86–5.58:1 σε page, secondary, sidebar και hover), dark ίσο με το `ring`. Χρωματίζει το κείμενο και το icon του ενεργού header tab και του ενεργού sidebar item. Τα buttons μένουν ink. Το raised surface του ενεργού sidebar item στο component μένει. Το token μπαίνει στο `tokens.css` μαζί με το Sidebar component που το χρησιμοποιεί. Αλλαγή στο ADR 0007 και στον κανόνα χρώματος του `kosmos-style`. Το phone menu δείχνει κι αυτό το ενεργό item.
- **Command palette:** μένει χωρίς animation (σημερινός κανόνας του `kosmos-style`).
- **Accordion:** όταν μια ενότητα ανοίγει και μια άλλη κλείνει ταυτόχρονα, τα δύο ύψη κινούνται με την ίδια διάρκεια και καμπύλη, ώστε το συνολικό ύψος να μην «χοροπηδάει». Εξαίρεση στον κανόνα «exits run faster», γραμμένη στο `kosmos-style`.
- **Focus στα text fields:** σύγκριση με το shadcn. Αν το δικό μας φαίνεται πιο απότομο, η λεπτή γραμμή αποκτά το ίδιο fade με τη λάμψη, χωρίς να χαθεί το outline σε forced-colors mode.
- **Button:** δέχεται τα ονόματα του shadcn ως aliases (variant `default`→`primary`, `outline`→`secondary`, `link`, size `default`→`md`, `xs`→`sm`, `icon-xs`→`icon-sm`). Το ESLint τα απαγορεύει μέσα στον κώδικα του Kosmos. Ο κανόνας «a variant nothing uses is deleted» αποκτά αυτή την εξαίρεση.
- **Sidebar icon mode:** νέα κατάσταση collapsed, όπου μένει στενή στήλη με τα icons και tooltip με το όνομα. Δεύτερος τρόπος collapse είναι το σημερινό «κρύβεται τελείως». Συντόμευση πληκτρολογίου για εναλλαγή, μνήμη της κατάστασης. Στο κινητό μένει το drawer.
- **Χρώματα:** neutral hover στη λαβή resize του Sidebar. Διαφορετική φωτεινότητα για τους τόνους primary και warning του Meter. Πιο ελαφρύ thumb στο ScrollArea. Μία γλώσσα για το overflow cue (το fade του ScrollArea) σε dialog, drawer, menu, popover και tab list.
- **Pending confirmation:** όλα τα «Decided without the user, pending confirmation» του `kosmos-style` επιβεβαιώνονται ή αλλάζουν σε αυτή τη φάση, και η σημείωση φεύγει.
- Ο κανόνας του blurred header στο site γράφεται στο `kosmos-style` ή γίνεται solid.

### Docs

- **Header tabs:** Docs, Components, Blocks, Templates. Κάθε tab έχει δικό του sidebar:
  - **Docs:** εισαγωγή, installation, foundations, changelog.
  - **Components:** τα groups των components.
  - **Blocks:** οι block categories σε τρεις ενότητες (Application, Marketing, AI), με τον αριθμό εκδοχών δίπλα σε κάθε κατηγορία.
  - **Templates:** χωρίς sidebar.
- **Σελίδα block category:** τίτλος, περιγραφή, και οι εκδοχές μία κάτω από την άλλη, χωρίς στήλη «On this page».
- **Block viewer:** ένας για κάθε εκδοχή, σε όλο το πλάτος του περιεχομένου. Η γραμμή εργαλείων έχει: όνομα, badge Free/Pro, Preview/Code, desktop/tablet/phone, άνοιγμα σε νέα καρτέλα, εντολή install με αντιγραφή. Το preview τρέχει μέσα σε iframe, ώστε τα container queries να απαντούν στο πλάτος που διαλέγει ο επισκέπτης. Η καρτέλα Code δείχνει όλα τα αρχεία του block. Στις Pro εκδοχές είναι κλειδωμένη, με link προς το Pro.
- **Templates:** γκαλερί με μεγάλες κάρτες (screenshot, όνομα, badge, live demo).
- **Σελίδες components:** μένουν όπως είναι. Ο τίτλος παίρνει νέο type role μόνο για το site, 28px σε κινητό και 32px σε desktop.
- **Pills:** μόνο στις κλειστές ομάδες του sidebar, με fade (`duration-fast`) όταν ανοίγει η ομάδα. Το κείμενο για screen readers μένει πάντα.
- Οι σελίδες των σημερινών 8 blocks γίνονται σελίδες κατηγοριών με μία εκδοχή η καθεμία.

### Landing

Ξαναχτίζεται από Kosmos blocks, με αυτή τη σειρά:

1. Hero με τίτλο, μία γραμμή κειμένου, δύο CTAs (Browse components, GitHub) και την εντολή install.
2. Ένα αληθινό dashboard σε καμβά με tabs (π.χ. Overview, Customers, Settings, AI), με live αλλαγή accent, radius και light/dark.
3. Bento από αληθινά components με λεζάντες.
4. Inventory με αριθμούς.
5. Ενότητα για install και agents (shadcn CLI, llms.txt, `.md` σελίδες).
6. Αποδείξεις: stars και ημερομηνία τελευταίου update.
7. Footer.

Κάθε ενότητα έχει ετικέτα με το block από το οποίο είναι φτιαγμένη. Δεν βάζουμε testimonials που δεν υπάρχουν, εκπτώσεις, rotating headlines ή pop-ups.

### Block categories και templates (σειρά χτισίματος)

- **Application:**
  - Πρώτα: Auth (sign up, log in, OTP, forgot password), Settings, Dashboards, Tables με φίλτρα.
  - Μετά τα κενά της αγοράς: audit log, API keys και webhooks, ρόλοι και μέλη, sessions και συσκευές, ρυθμίσεις ειδοποιήσεων, CSV import με αντιστοίχιση στηλών, usage limits και τέλος trial, empty/error/loading states ως σετ.
  - Και τα 8 υπάρχοντα: sidebar, page header, table, detail drawer, command menu, new item dialog, stats overview, board.
- **Marketing:** hero, features, bento, pricing, FAQ, CTA, logos, testimonials, footer, header, changelog, blog, waitlist.
- **AI:**
  - Δωρεάν: prompt composer, assistant message, tool approval.
  - Pro: run timeline, trace waterfall, docked copilot για dashboards, usage και cost cards, eval grid.
- **Templates:** SaaS analytics admin (auth, settings, team, API keys) → AI assistant workspace → project management (board, tasks, calendar) → agent ops console → marketing site στο στυλ του dashboard.
- **Δεν φτιάχνουμε:** Billing block (το καλύπτει ο πάροχος πληρωμών), και CRM template μέχρι να υπάρχει δική του, διαφορετική εμφάνιση.

### Τρόπος δουλειάς

- Για κάθε νέα block category, ο Claude μελετά 4–5 πραγματικά προϊόντα και φτιάχνει μια σελίδα σύγκρισης με screenshots. Ο Θάνος διαλέγει με το μάτι, και ο Claude χτίζει τη δική μας εκδοχή. Παίρνουμε μόνο ιδέες, ποτέ κώδικα, και δεν γράφουμε το όνομα της πηγής σε αρχεία που γίνονται commit (ADR 0004).
- Τις μικρές, standard αποφάσεις τις παίρνει ο Claude και τις αναφέρει. Ερωτήσεις μόνο για σοβαρές αποφάσεις.
- Η έγκριση γίνεται στο approval page: ο Θάνος κοιτάει και λέει τι τον ενοχλεί.
- Τα σχέδια (spec, tickets, handoffs) ζουν στο `docs/work/` και σβήνονται με commit όταν ολοκληρωθούν. Το research με ονόματα προϊόντων μένει στο `.scratch/`, εκτός git.

### Καθάρισμα

- Νεκρός κώδικας: ο κλάδος για table rows στο site search, τα `href="#…"` στα examples του Badge και του Button, το αχρησιμοποίητο prop `tall` του ComponentPreview.
- Το `docs/backlog.md` σβήνεται, γιατί το αντικαθιστά αυτό το spec.
- Τα παλιά audit και redesign αρχεία στο `.scratch/` σβήνονται όταν κλείσουν τα ευρήματά τους.
- Το `build-component` skill γράφει τον νέο demo κόσμο. Το `AGENTS.md` δείχνει πού ζουν τα σχέδια.

### Σειρά υλοποίησης

1. Μικρές διορθώσεις, χρώματα και νεκρός κώδικας, μαζί με τις αλλαγές στο `kosmos-style` και τα ADRs.
2. Sidebar icon mode.
3. Ταυτότητα των 8 blocks (νέος demo κόσμος).
4. Δομή docs και block viewer.
5. Landing.
6. Domain και launch.
7. Ιδιωτικό repo, και Pro εκδοχές ανά κατηγορία, με τη σειρά της παραπάνω λίστας.
8. Templates.
9. Πακετάρισμα (τιμές, άδεια, registry με license key, πληρωμές), μόνο όταν το πει ο Θάνος.

### Για μετά

- Δύο kits με components για agent UI, που σημείωσε ο Θάνος, για ιδέες σε περισσότερα components (π.χ. task rows). Δεν έχουν μελετηθεί ακόμα. Τα κοιτάμε μετά το τρέχον ticket. Τα links είναι στο `.scratch/research/ideas-later.md`.

## Testing Decisions

- Ένα καλό τεστ ελέγχει τι βλέπει και τι εγκαθιστά ο χρήστης, όχι πώς είναι γραμμένος ο κώδικας.
- **Seam για components και blocks:** το review preview κάθε item, φωτογραφημένο σε light και dark, σε 375 και 1280px (`pnpm screenshots`), και ελεγμένο με agent visual review. Το ίδιο ισχύει για το icon mode, το accordion και τα νέα χρώματα.
- **Seam για τη διανομή:** το registry smoke, όπου ένα καθαρό shadcn app εγκαθιστά το item και κάνει build (`pnpm registry:check`, `pnpm registry:smoke`). Καλύπτει και τα aliases του Button: ένα καθαρό app που αντικαθιστά το Button του shadcn με το δικό μας και χρησιμοποιεί το Dialog και το Pagination του shadcn πρέπει να κάνει build.
- **Seam για τα docs:** Playwright πάνω στις σελίδες του site. Η σελίδα μιας block category φωτογραφίζεται στα τρία πλάτη του block viewer. Το sidebar κάθε tab δείχνει μόνο τις δικές του ενότητες.
- **Seam για το Pro:** το ιδιωτικό repo έχει το ίδιο review preview και το ίδιο registry smoke, πάνω στο ιδιωτικό registry.
- **Πάντα:** `pnpm types:check`, `pnpm lint`, `pnpm build` και code review σε κάθε branch πριν από το PR.
- **Προηγούμενα παραδείγματα:** τα scripts screenshots, registry-check και registry-smoke, και τα review previews στο `registry/kosmos/examples/`.

## Out of Scope

- Πληρωμές, λογαριασμοί, license server και τα ποσά των τιμών, μέχρι τη Φάση 3.
- Billing block και CRM template.
- Figma kit.
- Δικό μας CLI ή npm package.
- CI/CD και visual regression testing.
- Φόρμα email ή λίστα αναμονής για το Pro στο launch.
- Animation στο command palette.

## Further Notes

- Η αγορά δείχνει εφάπαξ τιμές στα $199–$299 για όλα και $79–$149 για μόνο blocks. Τα admin dashboards είναι η κατηγορία που αποδεδειγμένα πουλάει.
- Ένας πάροχος components έχασε το μεγαλύτερο μέρος των εσόδων του όταν τα AI εργαλεία αντικατέστησαν τις επισκέψεις στα docs. Γι' αυτό η Φάση 3 πρέπει να εξετάσει πληρωμένη ανανέωση updates μετά τον πρώτο χρόνο, όχι μόνο «lifetime».
- Το research με τα ονόματα των προϊόντων, τις τιμές και τα screenshots είναι στο `.scratch/research/`, εκτός git.
