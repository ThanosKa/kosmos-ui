# 09: Icon mode στο Sidebar

**What to build:** Το Sidebar αποκτά icon mode: στο collapse μένει μια στενή στήλη με τα icons, και κάθε icon δείχνει το όνομα σε tooltip. Το σημερινό «κρύβεται τελείως» μένει ως δεύτερος τρόπος collapse, που τον διαλέγει ο developer. Μια συντόμευση πληκτρολογίου κάνει εναλλαγή, και η κατάσταση μένει στη μνήμη για την επόμενη επίσκεψη. Στο κινητό το Sidebar ανοίγει όπως πριν, ως drawer.

**Blocked by:** 07 (αλλάζει το ίδιο ενεργό item του Sidebar)

**Status:** ready-for-agent

- [ ] Το icon mode δείχνει τα icons, το ενεργό item και τα groups χωρίς κείμενο που κόβεται, και tooltip σε hover και keyboard focus
- [ ] Η συντόμευση κάνει εναλλαγή και φαίνεται σε `KbdGroup` στο tooltip του trigger
- [ ] Η κατάσταση επιβιώνει σε reload χωρίς flash της λάθος κατάστασης
- [ ] Κάτω από το breakpoint του drawer τίποτα δεν αλλάζει
- [ ] Το resize με πληκτρολόγιο και με σύρσιμο συνεχίζει να δουλεύει και στους δύο τρόπους collapse
- [ ] Review preview, docs (νέο prop και παράδειγμα) και changelog, με τον κύκλο `build-component`
