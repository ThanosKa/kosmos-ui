# Spec: Black and white, presets και τα blocks που λείπουν

Label: ready-for-agent
Status: open
Ημερομηνία: 2026-10-24

## Problem Statement

Ο Θάνος θέλει το Kosmos UI να μοιάζει με τα SaaS dev tools που φτιάχνουν οι χρήστες του, και να έχει όσα χρειάζεται ένα πραγματικό dashboard και ένα πραγματικό landing. Σήμερα:

- Το palette είναι ζεστό κρεμ με πορτοκαλί accent (ADR 0007). Ξεχωρίζει, αλλά δεν μοιάζει με τα black and white dev tools που θέλει να υπηρετεί.
- Το Kosmos δεν έχει δική του ταυτότητα ως προϊόν, ξεχωριστή από το palette των components.
- Ο developer δεν μπορεί να αλλάξει την εμφάνιση και να πάρει τον κώδικα. Τα controls για accent και radius υπάρχουν μόνο μέσα στο dashboard της landing.
- Η landing δεν μοιάζει με SaaS landing: το header δεν είναι block, και λείπουν marquee, pricing, FAQ και CTA.
- Λείπουν components και blocks που έχει κάθε dashboard: breadcrumb, submenus στο Sidebar, stat και chart cards, pagination, φίλτρα πίνακα, form controls, settings.
- Τα status δεν έχουν σύστημα: δεν υπάρχει Alert, και οι κωδικοί (HTTP, methods) δεν έχουν δικό τους pill.

## Solution

- Το default **palette** γίνεται black and white, με αληθινά γκρι, ink focus και mono charts (ADR 0009). Το **style** μένει όπως είναι: layered σκιές αντί για borders, rim στο dark, πυκνότητα, type roles, κίνηση. Αυτό κρατά την ταυτότητα του Kosmos μέσα στο black and white.
- Έξι status hues δίνουν dot για states, tinted pill για κωδικούς και tint σε ένα νέο Alert.
- Ο developer διαλέγει **preset** στη **Presets page**: Default, Warm (το σημερινό palette), Soft, Console, Night. Βλέπει components, dashboard και forms να αλλάζουν live και παίρνει CSS, εντολή registry ή DESIGN.md. Ο ίδιος picker μπαίνει στο dashboard της landing.
- Το Kosmos αποκτά **brand colour**: ένα σκέτο χρώμα, μόνο στο δικό μας site (logo, σημάδια Pro, text selection). Ο Θάνος το διαλέγει με το μάτι.
- Η landing ξαναχτίζεται μόνο από blocks: navbar, hero, marquee με το stack, live dashboard, bento, inventory, pricing, FAQ, CTA, footer.
- Τα components και blocks που λείπουν έρχονται σε τρία κύματα. Κάθε ένα χτίζεται με τη μέθοδο του Kosmos style, ποτέ ως αντίγραφο προϊόντος (ADR 0004).

## User Stories

### Developer που εγκαθιστά το Kosmos

1. Ως developer, θέλω το Kosmos να εγκαθίσταται black and white, ώστε το app μου να μοιάζει με σύγχρονο dev tool χωρίς να αλλάξω χρώματα.
2. Ως developer, θέλω τα γκρι να είναι αληθινά, χωρίς απόχρωση, ώστε να ταιριάζουν με ό,τι άλλο έχει το app μου.
3. Ως developer, θέλω το primary κουμπί να είναι ink σε light και το αντίστροφο σε dark, ώστε η κύρια ενέργεια να φαίνεται χωρίς χρώμα.
4. Ως developer, θέλω το focus να φαίνεται σε κάθε επιφάνεια, light και dark, ώστε όποιος δουλεύει με πληκτρολόγιο να βλέπει πού βρίσκεται.
5. Ως developer, θέλω οι κάρτες να κρατούν τις layered σκιές και το rim στο dark, ώστε το UI μου να έχει βάθος και να μη μοιάζει με κάθε άλλο black and white kit.
6. Ως developer, θέλω τα charts σε mono ramp, ώστε να ταιριάζουν με το black and white και το χρώμα να μένει για ό,τι σημαίνει κάτι.
7. Ως developer, θέλω να δείχνω την κατάσταση ενός πράγματος με dot και λέξη, ώστε το νόημα να μην εξαρτάται μόνο από το χρώμα.
8. Ως developer, θέλω tinted pills για κωδικούς (HTTP status, methods), ώστε ένας κωδικός να διαβάζεται με μια ματιά.
9. Ως developer, θέλω ένα Alert με info, success, warning, destructive και neutral, ώστε να ειδοποιώ τον χρήστη με σταθερό τρόπο.
10. Ως developer, θέλω κάθε tint να έχει κείμενο και link που διαβάζονται πάνω στο fill του, ώστε τα alerts μου να περνούν έλεγχο accessibility.
11. Ως developer, θέλω τα tokens που εγκαθιστώ να μην περιέχουν το brand colour του Kosmos, ώστε το app μου να μη φοράει άλλο brand.
12. Ως developer που ήδη χρησιμοποιεί το ζεστό palette, θέλω να το βρω ως preset Warm, ώστε να το κρατήσω μετά την αλλαγή.

### Developer στη Presets page

13. Ως developer, θέλω να βρίσκω τη Presets page από το nav του site, ώστε να μη χρειάζεται να ψάξω.
14. Ως developer, θέλω να διαλέγω ανάμεσα σε Default, Warm, Soft, Console και Night, ώστε να ξεκινάω από κάτι έτοιμο.
15. Ως developer, θέλω να αλλάζω accent, radius και light/dark, ώστε να φτάσω στην εμφάνιση που θέλω.
16. Ως developer, θέλω να βλέπω components, ένα dashboard και forms να αλλάζουν live, ώστε να κρίνω το preset σε πραγματικό UI.
17. Ως developer, θέλω η αλλαγή να επηρεάζει μόνο το preview και όχι το chrome του site, ώστε να μη χάνομαι μέσα στη σελίδα.
18. Ως developer, θέλω ένα reset, ώστε να γυρνάω στο Default.
19. Ως developer, θέλω το preset να ζει στο URL, ώστε να το μοιράζομαι στέλνοντας ένα link.
20. Ως developer, θέλω ένα κουμπί «Get code» που δίνει το CSS για light και dark, ώστε να το βάλω στο project μου.
21. Ως developer, θέλω την εντολή registry του preset, ώστε να το εγκαταστήσω με το shadcn CLI.
22. Ως developer, θέλω DESIGN.md του preset, ώστε ένας agent να χτίζει οθόνες στο ίδιο στυλ.
23. Ως developer, θέλω το CSS που αντιγράφω να δίνει στο project μου την ίδια εικόνα με το preview, ώστε να εμπιστεύομαι τη σελίδα.
24. Ως developer, θέλω κάθε preset να περνά τους ίδιους ελέγχους contrast με το Default, ώστε να μη χρειάζεται να τους ξανακάνω.
25. Ως developer στο κινητό, θέλω τα controls σε bottom sheet, ώστε να βλέπω το preview ολόκληρο.
26. Ως developer με πληκτρολόγιο, θέλω να αλλάζω preset χωρίς ποντίκι, ώστε η σελίδα να είναι προσβάσιμη.
27. Ως developer, θέλω τα menus, dialogs και toasts του preview να παίρνουν κι αυτά το preset, ώστε το preview να μη λέει ψέματα.

### Επισκέπτης της landing

28. Ως επισκέπτης, θέλω ένα navbar που μένει στο πάνω μέρος και ανοίγει σε sheet στο κινητό, ώστε να βρίσκω docs, components και GitHub από παντού.
29. Ως επισκέπτης, θέλω ένα hero που λέει τι είναι το Kosmos με μία γραμμή και την εντολή install, ώστε να καταλάβω αμέσως.
30. Ως επισκέπτης, θέλω ένα marquee με το stack (Base UI, Tailwind CSS, React, Next.js, shadcn CLI), ώστε να ξέρω αν ταιριάζει με το project μου.
31. Ως επισκέπτης, θέλω ένα live dashboard με τον ίδιο preset picker, ώστε να δω τα presets χωρίς να φύγω από τη landing.
32. Ως επισκέπτης, θέλω bento και inventory, ώστε να δω τι περιέχει το Kosmos και πόσο.
33. Ως επισκέπτης, θέλω pricing με Free και Pro, ώστε να ξέρω τι πληρώνω και τι όχι.
34. Ως επισκέπτης, θέλω ένα FAQ, ώστε να βρίσκω απαντήσεις χωρίς να ρωτήσω.
35. Ως επισκέπτης, θέλω ένα CTA στο τέλος, ώστε να ξέρω το επόμενο βήμα.
36. Ως επισκέπτης, θέλω κάθε section της landing να είναι block που μπορώ να εγκαταστήσω, ώστε η landing να είναι και demo.
37. Ως επισκέπτης, θέλω να αναγνωρίζω το Kosmos από το brand colour στο logo και στα σημάδια Pro, ώστε να το θυμάμαι.
38. Ως επισκέπτης με reduced motion, θέλω το marquee να μένει ακίνητο, ώστε να μη με ενοχλεί.
39. Ως επισκέπτης, θέλω η landing να μην έχει testimonials που δεν υπάρχουν, ώστε να εμπιστεύομαι ό,τι λέει.

### Developer που χτίζει marketing site

40. Ως developer, θέλω navbar, logo marquee, feature section, pricing, FAQ, CTA και testimonials blocks, ώστε να στήσω landing γρήγορα.
41. Ως developer, θέλω ένα announcement pill, ώστε να δείχνω μια νέα έκδοση πάνω από το hero.
42. Ως developer, θέλω code tabs για εντολές install με copy, ώστε ο χρήστης μου να αντιγράφει την εντολή του package manager του.
43. Ως developer, θέλω το pricing να αλλάζει μηνιαία και ετήσια χρέωση, ώστε να δείχνω και τις δύο τιμές.

### Developer που χτίζει dashboard

44. Ως developer, θέλω breadcrumb που συμπτύσσεται όταν δεν χωράει, ώστε ο χρήστης μου να ξέρει πού βρίσκεται.
45. Ως developer, θέλω submenus στο Sidebar, ώστε να οργανώνω πολλές σελίδες.
46. Ως developer, θέλω workspace switcher στο Sidebar, ώστε ο χρήστης μου να αλλάζει ομάδα ή project.
47. Ως developer, θέλω user menu στο Sidebar, ώστε ο χρήστης να βρίσκει λογαριασμό και αποσύνδεση.
48. Ως developer, θέλω τα submenus και τον switcher να δουλεύουν και στο icon mode, ώστε το collapse να μη χαλάει την πλοήγηση.
49. Ως developer, θέλω stat card με delta που διαβάζεται χωρίς χρώμα, ώστε τα KPIs να είναι σαφή.
50. Ως developer, θέλω chart card με loading, empty και error, ώστε κάθε chart να έχει σωστή κατάσταση.
51. Ως developer, θέλω pagination με σελίδες ή «Load more», ώστε να χωρίζω μεγάλες λίστες.
52. Ως developer, θέλω faceted filters στον πίνακα, ώστε ο χρήστης να φιλτράρει με counts.
53. Ως developer, θέλω μπάρα για bulk actions όταν διαλέγονται γραμμές, ώστε ο χρήστης να δρα σε πολλές μαζί.
54. Ως developer, θέλω menu στις κεφαλίδες για ταξινόμηση και απόκρυψη στηλών, ώστε ο πίνακας να προσαρμόζεται.

### Developer που χτίζει forms και settings

55. Ως developer, θέλω input group με prefix και suffix, ώστε να βάζω μονάδες, εικονίδια και κουμπιά στα πεδία.
56. Ως developer, θέλω copy field και secret field, ώστε να δείχνω API keys με ασφάλεια.
57. Ως developer, θέλω combobox για μία ή πολλές τιμές, ώστε να διαλέγει ο χρήστης από μεγάλες λίστες.
58. Ως developer, θέλω tags input, ώστε να δέχομαι πολλά emails σε μια πρόσκληση.
59. Ως developer, θέλω radio group και radio cards, ώστε να δίνω μία επιλογή από λίγες.
60. Ως developer, θέλω number input με stepper, ώστε να αλλάζουν οι αριθμοί χωρίς πληκτρολόγηση.
61. Ως developer, θέλω calendar και date picker με range και presets, ώστε να διαλέγει ο χρήστης περιόδους.
62. Ως developer, θέλω settings section με Save που ενεργοποιείται μόνο όταν κάτι αλλάξει, ώστε ο χρήστης να μην αποθηκεύει τίποτα κατά λάθος.
63. Ως developer, θέλω settings page με πλοήγηση ενοτήτων και danger zone με επιβεβαίωση, ώστε να στήνω ρυθμίσεις γρήγορα.
64. Ως developer, θέλω members και invites block, ώστε να διαχειρίζομαι ομάδες με ρόλους.

### Ο Θάνος (maintainer)

65. Ως maintainer, θέλω να διαλέγω το brand colour ανάμεσα σε 4 υποψήφια πάνω σε πραγματικά σημεία, ώστε να αποφασίζω με το μάτι.
66. Ως maintainer, θέλω να εγκρίνω τα νέα baselines πριν από κάθε άλλο review, ώστε να μην εγκρίνω τίποτα στο παλιό palette.
67. Ως maintainer, θέλω τα blocks να χτίζονται παράλληλα, ώστε να βγαίνουν γρήγορα.
68. Ως maintainer, θέλω κάθε νέο κομμάτι να ακολουθεί τη μέθοδο του Kosmos style, ώστε το Kosmos να έχει δική του ταυτότητα.
69. Ως maintainer, θέλω τα Pro κομμάτια να μένουν στο ιδιωτικό repo, ώστε το δημόσιο να μένει MIT (ADR 0003).

## Implementation Decisions

### Palette και style

- Το default palette έχει αληθινά γκρι (chroma 0) σε light και dark. Μόνο τα status και το destructive έχουν χρώμα.
- Primary: ink σε light, το αντίστροφο σε dark. Focus: ink με μειωμένο alpha και κενό στο χρώμα της σελίδας, τουλάχιστον 3:1 σε κάθε επιφάνεια. Το focus παίρνει το accent μόνο όταν ένα preset έχει accent.
- Το style δεν αλλάζει: layered σκιές, rim στο dark, density, type roles και κίνηση μένουν όπως ορίζει το `kosmos-style`.
- Charts: mono ramp σε πέντε series (ink και μετά γκρι βήματα), με διαχωριστικό στα stacked charts.
- Οι τιμές του ADR 0007 κρατιούνται αυτούσιες ως preset Warm.
- Τα ονόματα των tokens μένουν τα shadcn ονόματα, ώστε τα apps να αλλάζουν τα πάντα από το ίδιο σημείο.

### Status tints

- Έξι hues: gray, blue, green, teal, orange, red. Κάθε hue έχει tokens για fill, border, κείμενο, link και dot, και τέσσερις από αυτούς (green, blue, orange, red) έχουν και solid. Τιμές και κανόνες από το issue #34. Το gray παίρνει τα βήματα του Radix gray.
- States: dot με λέξη, μέσα από το Status. Κωδικοί: tinted pill χωρίς border, μέσα από νέα variants του Badge.
- Νέο Alert component με tones info (blue), success (green), warning (orange), destructive (red) και neutral. Τα callouts των docs το χρησιμοποιούν.
- Το Radix MIT notice μπαίνει δίπλα στα tokens και ταξιδεύει με το registry item.
- Από το #34 δεν μπαίνουν το μωβ brand και ο κανόνας του app surface.

### Το module των presets

- Ένα preset είναι δεδομένα: όνομα, τιμές palette για light και dark, προαιρετικό accent, radius. Ένα preset δεν αλλάζει ποτέ font, density ή σκιές.
- Ένα module, με ένα μικρό interface: η λίστα των presets, το CSS ενός preset (light και dark) και το DESIGN.md ενός preset. Η Presets page, το dashboard της landing και η εντολή registry χρησιμοποιούν όλα αυτό το module, ώστε το preview και ο κώδικας που αντιγράφεται να βγαίνουν από την ίδια πηγή.
- Το preset εφαρμόζεται στο document root, ώστε να το παίρνουν και τα portals.
- Τα accent swatches της landing και τα tokens `active-foreground` και `meter-primary` περνούν στο accent του preset. Τα components που τα χρησιμοποιούν μεταφέρονται σε αυτό στο ίδιο ticket, και μετά τα παλιά σβήνονται.
- Πρώτη έκδοση: Default (χωρίς accent), Warm, Soft, Console, Night. Τα τρία τελευταία παίρνουν από τα designs του issue #33 μόνο palette και radius.
- Το DESIGN.md περιγράφει palette, radius, κανόνα focus και do/don't, χωρίς ονόματα προϊόντων.

### Presets page και preset picker

- Η Presets page είναι δημόσια σελίδα του site, στο nav. Αριστερά τα controls (preset, accent, radius, light/dark, reset), δεξιά ένα preview με tabs Components, Dashboard, Forms, από το περιεχόμενο της Gallery.
- Το preset ζει στο URL. Ένα κουμπί «Get code» ανοίγει dialog με CSS, εντολή registry και DESIGN.md.
- Το preset εφαρμόζεται μόνο στο preview, όχι στο chrome του site.
- Ο preset picker είναι ένα component, και το ίδιο μπαίνει στο dashboard της landing στη θέση των σημερινών controls για accent και radius. Η αλλαγή φτάνει στο iframe όπως σήμερα.

### Brand colour

- Ένα σκέτο χρώμα, όχι gradient, μόνο σε logo, σημάδια Pro (badge, CTA) και text selection του site.
- Ζει μόνο στο site, ποτέ στο registry.
- Ο Θάνος το διαλέγει από 4 υποψήφια (ένα ροζ, ένα πορτοκαλί και δύο ακόμα) σε μια σελίδα σύγκρισης εκτός git. Δεν παίρνουμε το brand κανενός άλλου προϊόντος.

### Landing

- Σειρά: navbar, hero, marquee με το stack, live dashboard, bento, inventory, pricing (Free και Pro), FAQ, CTA, footer.
- Κάθε section είναι block του registry, με ετικέτα που το ονομάζει. Το header του site γίνεται το navbar block.
- Το testimonials block φτιάχνεται, αλλά δεν μπαίνει στη landing μέχρι να υπάρχουν αληθινά testimonials.

### Κύματα components και blocks

- **Κύμα 1:** navbar, logo marquee, feature section, pricing, FAQ, CTA, testimonials, announcement pill, code tabs, breadcrumb, Sidebar submenus, workspace switcher, user menu, stat card, chart card, pagination, και faceted filters, bulk-action bar και column menu στο data table.
- **Κύμα 2:** input group με copy και secret field, combobox, tags input, radio group και radio cards, number input, calendar και date picker, settings section, settings page, members και invites.
- **Κύμα 3** (tickets αργότερα): resource list με item primitives, activity feed, integrations grid, onboarding checklist, empty variants, notifications popover, KPI tabs, ranked bar list, heatmap, JSON viewer, key-value list, changelog.
- **Pro**, στο ιδιωτικό repo: log viewer, diff view, inbox, mobile tab bar, analytics funnels και retention, πλήρης σελίδα pricing με σύγκριση. Κάθε block category κρατά μία free εκδοχή (ADR 0003).

### Τρόπος δουλειάς

- Κάθε component και block περνά τον κύκλο `build-component` και ξεκινά από την ερώτηση «πώς θα το έχτιζε το Kosmos style;».
- Τα tickets τρέχουν παράλληλα όπου δεν αγγίζουν τα ίδια αρχεία. Τα blocks χτίζονται από τώρα, αλλά τα screenshots του review περιμένουν το black and white palette.
- Το research με ονόματα προϊόντων μένει εκτός git (ADR 0004). Κανένα tracked αρχείο δεν ονομάζει προϊόν ως πηγή του στυλ.

## Testing Decisions

- **Τι είναι καλό test:** ελέγχει ό,τι βλέπει ο χρήστης (το CSS και το DESIGN.md που παίρνει, το contrast που πετυχαίνει), όχι το πώς είναι γραμμένο το module. Ένα test δεν σπάει όταν αλλάζει η εσωτερική δομή, μόνο όταν αλλάζει το αποτέλεσμα.
- **Ένα κύριο seam: το module των presets**, με pure tests χωρίς browser:
  - κάθε preset, σε light και dark: κείμενο 4.5:1 σε κάθε επιφάνεια, focus και chart marks 3:1
  - κάθε status tint: κείμενο και link 4.5:1 πάνω στο fill τους, και solid 4.5:1 με το λευκό κείμενό του
  - το Default δεν έχει chroma εκτός από status και destructive
  - το Warm δίνει ακριβώς τις τιμές του ADR 0007
  - το CSS που βγάζει ένα preset ξαναδιαβάζεται και δίνει τις ίδιες τιμές
  - το DESIGN.md περιέχει κάθε τιμή του preset
- **Ο έλεγχος του registry** επιβεβαιώνει ότι κανένα registry item δεν περιέχει το brand colour και ότι το Radix notice συνοδεύει τα tints.
- **Η εμφάνιση** ελέγχεται με τα screenshots και τα baselines που ήδη υπάρχουν, μέσα στον κύκλο `build-component`. Δεν γράφουμε tests ανά component.
- **Prior art:** τα pure tests με `node:test` (το test των νέων items του changelog) και τα scripts ελέγχου του registry και των docs.

## Out of Scope

- Font, density και σκιές ανά preset.
- Flat κάρτες: το style κρατά τις layered σκιές (ADR 0009).
- Billing block: το καλύπτει ο πάροχος πληρωμών.
- Τα υπόλοιπα designs του issue #33 (purple, mint, ledger, signal και το design που αντιγράφει μια εξωτερική αναφορά) ως presets.
- Το μωβ brand και ο κανόνας του app surface του issue #34.
- Testimonials στη landing πριν υπάρξουν αληθινά.
- Το κύμα 3 μέχρι να κλείσουν τα κύματα 1 και 2.
- Τα Pro κομμάτια σε αυτό το repo.

## Further Notes

- Αυτό το spec αντικαθιστά την ενότητα «Landing» του `spec.md`. Τα υπόλοιπα του `spec.md` (Pro, templates, πακετάρισμα) μένουν ανοιχτά εκεί.
- Το ADR 0009, η σήμανση του ADR 0007 ως superseded και οι όροι Preset, Accent, Brand colour και Presets page στο glossary μπαίνουν στο PR του πρώτου ticket.
- Τα issues #33 και #34 κλείνουν όταν μπουν τα presets και τα status tints.
- Τα tickets ζουν στο `docs/work/tickets/`, ένα αρχείο το καθένα, και σβήνονται στο PR που τα κλείνει. Όταν κλείσουν όλα, σβήνεται και το spec.
