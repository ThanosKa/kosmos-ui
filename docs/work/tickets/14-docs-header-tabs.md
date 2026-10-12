# 14: Header tabs με δικό τους sidebar το καθένα

**What to build:** Ο επισκέπτης των docs βλέπει στο header τα tabs Docs, Components και Blocks, και κάθε tab έχει μόνο το δικό του sidebar. Το Docs έχει εισαγωγή, installation, foundations και changelog. Το Components έχει τα groups των components. Το Blocks έχει τα blocks. Το tab Templates προστίθεται με το πρώτο template, όχι τώρα, γιατί το launch δεν έχει «coming soon». Ο τίτλος κάθε σελίδας παίρνει νέο type role μόνο για το site, 28px σε κινητό και 32px σε desktop. Τα count pills φαίνονται μόνο στις κλειστές ομάδες του sidebar, με fade (`duration-fast`) όταν η ομάδα ανοίγει. Το κείμενο για screen readers μένει πάντα.

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] Το ενεργό tab είναι σημειωμένο με `active-foreground` και στο phone menu
- [ ] Ένα Playwright τεστ ελέγχει ότι κάθε tab δείχνει μόνο τις δικές του ενότητες στο sidebar
- [ ] Το site search και τα `.md`/llms.txt routes βρίσκουν τις σελίδες όπως πριν
- [ ] Ο τίτλος σελίδας έχει το νέο type role, γραμμένο στο `kosmos-style`
- [ ] Τα pills κρύβονται στις ανοιχτές ομάδες και το κείμενο για screen readers μένει
