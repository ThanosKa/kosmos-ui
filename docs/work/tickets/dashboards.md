# Dashboards: Analytics and CRM

Status: open
Date: 2026-10-28

The maintainer picked two dashboards from the prototype on the `prototype/analytics-dashboard` branch (commit `7c7532e`, verdict in the commit after it): **A, Analytics** (traffic, sources, top pages, countries, signup goal, recent signups) and **C, CRM** (pipeline KPIs, open deals with a win-chance ring, next steps, pipeline by stage, quota, activity). Both ship as free blocks for now (category `dashboard`); free or Pro is decided later (ADR 0003), and moving one out is cheap.

The prototype's look: each section is a recessed tray (`bg-muted shadow-inset`) holding its title, description and actions, with the content on a raised card inside it and an optional footer (a full-width button, pagination) on the tray below. Two-line table cells (value over muted context), avatars with a presence dot, ranked rows whose fill is the bar.

## Tickets

1. **Bar list** (`ui/bar-list`): ranked values as rows whose fill is the bar, the label on the bar, the value (and an optional share) at the end; the leader in ink at low strength, the rest muted. Prototype: `BarList` in `components/prototype-analytics/parts.tsx`.
2. **Panel** (`ui/panel`): the tray with a header (title, description, actions), a raised card body and an optional footer. Parts like Chart card's. Add the term to `GLOSSARY.md`. Prototype: `Panel`.
3. **Stat card additions**: an icon tile part and an eyebrow line above the label, and a bar form of the sparkline (thin bars, the latest in ink). A KPI strip is Stat cards on one Panel-like tray. Prototype: `KpiStrip`, `KpiTile`, `SparkBars`.
4. **Dashboard blocks** (`blocks/dashboard-analytics`, `blocks/dashboard-crm`, category `dashboard`), built only from Kosmos components and blocks, with docs pages and changelog entries. The signup goal uses `MeterSegments` for the tick row. Anything else missing found while building them becomes a ticket here.

Delete this file in the PR that finishes ticket 4.
