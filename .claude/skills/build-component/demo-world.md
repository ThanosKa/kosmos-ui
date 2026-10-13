# Demo world: Parallax

Every block's sample data, review preview, demo and docs page uses this world and nothing else. When a block needs a value this file lacks, add it here in the same change, so the next block finds it.

**Parallax** is a fictional product analytics SaaS. A customer adds a **project** for each site or app, Parallax collects its **events**, and the customer pays a **plan**. The blocks show Parallax from the inside: the dashboard its own team uses to run the product, with its users, revenue, events, customer projects and roadmap.

A review preview may stretch a value to test the layout (a label too long for its slot, a count in the thousands, a huge or tiny number), as long as it stays something Parallax would show.

Never use, in sample data or copy: accounts, owners, health, CRM, pipeline, deals, renewals, churn, companies as customers, Acme, Northwind, or the old people (Maya Chen, Jonas Weber, Priya Raman). A person is never a project's "owner"; projects are filtered by plan, platform and status.

## Workspace, domains, dates

- Workspaces (the switcher): **Parallax** on the Scale plan, and **Parallax Staging** on the Free plan.
- Every domain ends in `.example` (reserved, never a real site). Parallax itself is `parallax.example`; mail is `<first name>@parallax.example`.
- "Today" in every sample is **11 October 2026**. Write dates through a fixed `en-US` formatter with `timeZone: 'UTC'`, so server and browser match.
- Money is USD, formatted with `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.

## People: the Parallax team

The signed-in user comes first. Use these four as the user menu, roadmap assignees, activity authors, mentions and "Assigned to" filters.

| Name | Initials | Email | Role |
| --- | --- | --- | --- |
| Lena Park | LP | lena@parallax.example | Product lead (the signed-in user) |
| Tomás Ortega | TO | tomas@parallax.example | Engineering |
| Ama Mensah | AM | ama@parallax.example | Design |
| Kai Nakamura | KN | kai@parallax.example | Growth |

## Plans

| Plan | Price | Badge hue |
| --- | --- | --- |
| Free | $0 | `blue` |
| Pro | from $49 / month | `orange` |
| Scale | from $1,200 / month | `magenta` |

A plan is a category, so it is a tag (Badge hue variant) and keeps its hue everywhere.

## Projects

A project is one customer site or app sending events. Fields, in this order: `id`, `name`, `domain`, `platform` (`web` | `ios` | `android` | `server`), `plan` (`free` | `pro` | `scale`), `status` (`live` | `trial` | `paused`), `users` (monthly active users), `events` (last 30 days), `mrr` (USD; 0 on Free and on a trial), `lastEventAt` (ISO date).

Status colors a dot beside its label: `live` is `success`, `trial` is `muted-foreground`, `paused` is `warning`. Platform shows as text with an icon (lucide `Globe`, `Smartphone` for iOS and Android, `Server`), never as a tag.

A block that needs fewer rows takes the first ones, in this order:

| id | name | domain | platform | plan | status | users | events | mrr | lastEventAt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fernhill | Fernhill Books | fernhill.example | web | scale | live | 48210 | 3912400 | 2400 | 2026-10-11 |
| brightloop | Brightloop Fitness | brightloop.example | ios | scale | live | 31480 | 5204800 | 3600 | 2026-10-11 |
| copperline | Copperline Bank | copperline.example | server | scale | live | 12940 | 8730100 | 4800 | 2026-10-11 |
| saltmarsh | Saltmarsh Coffee | saltmarsh.example | web | pro | live | 6120 | 412300 | 149 | 2026-10-10 |
| driftwood | Driftwood Travel | driftwood.example | android | pro | live | 9870 | 1108600 | 290 | 2026-10-11 |
| hollowoak | Hollow Oak Games | hollowoak.example | android | pro | paused | 2310 | 96200 | 99 | 2026-09-18 |
| cirrus | Cirrus Weather | cirrus.example | ios | pro | live | 22560 | 2391700 | 390 | 2026-10-11 |
| pebblepine | Pebble & Pine | pebblepine.example | web | free | live | 840 | 31200 | 0 | 2026-10-09 |
| marigold | Marigold Recipes | marigold.example | web | pro | trial | 1920 | 74500 | 0 | 2026-10-11 |
| kiln | Kiln Studio | kiln.example | web | free | paused | 120 | 2400 | 0 | 2026-08-30 |
| tidepool | Tidepool Notes | tidepool.example | ios | pro | trial | 3450 | 188100 | 0 | 2026-10-10 |
| ironbark | Ironbark Logistics | ironbark.example | server | scale | live | 4780 | 6342900 | 2900 | 2026-10-11 |

These twelve are every project Parallax has, so totals computed from them match the overview metrics: 8 live, 2 trial, 2 paused; 5 web, 3 iOS, 2 Android, 2 server; 2 free, 6 pro, 4 scale; 144,600 users, 28,495,200 events, $14,628 a month.

## Project detail: Cirrus Weather

The project a block opens by default (the detail drawer) is Cirrus Weather, with the fields of its row above plus:

- Added on March 3, 2025.
- Events per day, September 12 to October 11 (they add up to its 2,391,700): 73100, 73400, 65400, 65700, 66100, 66400, 66700, 75300, 75700, 67700, 68000, 68300, 68600, 69000, 77600, 77900, 69900, 70300, 70600, 113500, 149600, 151800, 112300, 72200, 72500, 72900, 73200, 73500, 82100, 82400. Weekends run higher, and a storm on October 2 doubled the traffic for three days.
- Notes: "Sends events from the iOS app only. Their Android app launches in November, on the same project."
- Activity, oldest first: Kai Nakamura changed the plan to Pro (Sep 2); Tomás Ortega noted "Events doubled during the storm on October 2. Raised their rate limit so nothing was dropped." (Oct 3); Lena Park noted "Asked them for a case study on the mobile SDK." (Oct 9). A note added in a demo is signed by Lena Park.

## Events

Event names are snake_case and render in `font-mono`. Every event Parallax received in the last 30 days, across all projects, most frequent first (they add up to the Events metric):

| Event | Count (30 days) |
| --- | --- |
| `page_viewed` | 17410000 |
| `button_clicked` | 5960000 |
| `screen_viewed` | 4600000 |
| `signed_up` | 389000 |
| `checkout_completed` | 91200 |
| `invite_sent` | 45000 |

Scale the counts for other ranges (7 days ≈ 0.24×, 90 days ≈ 3.1×), keeping the order.

## Overview metrics

The four numbers a Parallax dashboard leads with, for the last 30 days against the 30 before. Each one is the total of the projects above:

| Metric | Value | Change | Format |
| --- | --- | --- | --- |
| Active users | 144600 | +9.6% | number |
| Events | 28495200 | +14.2% | number, compact from a million |
| Monthly revenue | 14628 | +6.8% | currency |
| Live projects | 8 | −11.1% (Hollow Oak Games paused on 18 September) | number |

The other ranges, each against the same span before it:

| Metric | 7 days | 90 days |
| --- | --- | --- |
| Active users | 61240, +3.1% | 312800, +21.4% |
| Events | 6838800, +2.4% | 88335100, +31.8% |
| Monthly revenue | 14628, +1.2% | 14628, +18.9% |
| Live projects | 8, no change | 8, +14.3% (7 in mid-July) |

A chart over a range plots one point per day (7 and 30 days) or per week (90 days), so its points are daily or weekly figures, not the headline: about 29,400 active users and 1,012,000 events a day at the end of the range, and 74,800 users and 7,040,000 events a week. Monthly revenue is $14,628 on the last day of every range, and Live projects steps from 9 to 8 on 18 September.

## Roadmap

The kanban board is Parallax's own roadmap. Columns, in order: **Ideas**, **Planned**, **In progress**, **Shipped**. An item has `id`, `title`, `area`, `votes` (customers who asked for it), `assignee` (a team member, or none in Ideas) and `target` (a quarter, such as `Q4 2026`).

Areas are tags: Insights `amber`, Ingestion `green`, Billing `red`, Platform `blue`.

Each column carries a stage glyph (lucide) colored like a status dot: Ideas `CircleDashed` and Planned `Circle` in `muted-foreground`, In progress `CircleDot` in `warning`, Shipped `CircleCheck` in `success`. Ids are `ideas`, `planned`, `in-progress` and `shipped`; team members go by their lowercase first name without accents (`lena`, `tomas`, `ama`, `kai`).

| Title | Area | Column | Assignee | Votes | Target |
| --- | --- | --- | --- | --- | --- |
| Slack alerts for traffic drops | Platform | Ideas | none | 64 | none |
| Usage-based invoices | Billing | Ideas | none | 27 | none |
| Shareable dashboard links | Insights | Ideas | none | 51 | none |
| Retention cohorts by plan | Insights | Planned | Kai Nakamura | 88 | Q1 2027 |
| SAML single sign-on | Platform | Planned | Tomás Ortega | 73 | Q1 2027 |
| Mobile SDK 3.0 | Ingestion | Planned | Tomás Ortega | 39 | Q4 2026 |
| Funnel comparisons | Insights | In progress | Ama Mensah | 112 | Q4 2026 |
| Server-side batching | Ingestion | In progress | Tomás Ortega | 45 | Q4 2026 |
| EU data region | Ingestion | Shipped | Tomás Ortega | 97 | Q3 2026 |
| Annual billing | Billing | Shipped | Lena Park | 58 | Q3 2026 |

## What each block shows

| Block | Shows |
| --- | --- |
| Stats overview | The overview metrics as tabs over one chart that compares the range with the period before it (7, 30 or 90 days), and the top events. |
| Page header | The Projects page: title "Projects", tabs All, Live, Trial and Paused with counts, search, a filter menu grouped by Plan and Platform, and the primary action "New project" where the app passes `onNew`. |
| Data table | The projects: name with domain, platform, plan, users, events, revenue, status and last event. |
| Detail drawer | One project: plan, platform, status, its events trend, notes and the team's activity on it. |
| Kanban board | The roadmap above. |
| New item dialog | "New roadmap item": title, description, stage (the board's columns), area, assignee and target quarter (`Q4 2026` to `Q3 2027`); the item it creates lands as a card on the kanban board, with 0 votes. |
| App sidebar | The workspace switcher; nav Overview, Projects, Events, Users, Revenue and Roadmap; saved views "Scale plan" and "Trials" (with its count, 2); Help and feedback and Settings at the bottom; Lena Park in the user menu (profile, preferences, log out). It collapses to a column of icons. |
| Auth forms | The way into Parallax itself, not a customer's app: "Log in to Parallax", "Create your Parallax account" (on the Free plan), a 6-digit email code sent to lena@parallax.example, and a password reset. Email placeholders read `name@parallax.example`; the review preview's filled forms use the team's addresses. |
| Command menu | All twelve projects (each with its domain and status dot); actions "New roadmap item", "Invite teammate", "Show roadmap items assigned to…" (a second list of the team, plus "No one") and "Switch workspace…" (a second list of the two workspaces); and Go to the sidebar's pages and Settings. |
| Hero | The top of the Parallax website: title, one line, two actions and the install command (Marketing site below). |
| Bento | The Parallax website's feature grid: four live tiles (Marketing site below). |

## Marketing site

Marketing blocks show the Parallax website, `parallax.example`, which sells the product to the teams that run sites and apps.

- Hero: title "Know what every user does next", one line "Parallax collects events from your web, iOS, Android and server apps and turns them into answers your whole team can read.", actions "Start for free" (primary, to `/signup`) and "Book a demo" (secondary, to `/demo`), and the install command `curl -fsSL https://parallax.example/install.sh | sh`.
- Bento: title "From the first event to the answer", one line "Parallax collects your events, joins them to your users and keeps the numbers your team asks about ready to read." Tiles, in order: Live events (wide; a feed of `signup_completed`, `checkout_started`, `trial_converted` and `page_viewed` from the first projects), Funnels (meters: Viewed pricing 100%, Started a trial 38%, Paid 12%), Every platform (Web, iOS, Android and Server with their SDKs) and Alerts (wide; switches for "Signups drop below 40 a day", "Error events pass 2%" and "Weekly summary").

## Creating things

The Parallax team runs the product; its customers add their own projects. So the one thing a block creates is a roadmap item: the command menu and the landing dashboard offer "New roadmap item", which opens the new item dialog. The page header's "New project" is the primary action of a Projects page in an app that does let people add projects; it shows only when the app passes `onNew`, so the landing dashboard's Projects page has no primary action.
