---
version: 1
slug: "app-routes-operations-tsx"
primary_target: "app/routes/operations.tsx"
related_targets: ["app/components/operations/Operations.tsx","app/crewcover.css"]
---

# Event operations workspace
Mode: Operate. Primary target: app/routes/operations.tsx; related operations components and styles.

## Direction contract
THESIS: An organizer reads staffing coverage by role and time, then reviews a concrete repair before committing it. The schedule is the main object, rather than a dashboard of decorative cards.
OWN-WORLD: Navy working chrome, clear light schedule, green covered positions, amber proposed assignments, coral vacancies. Familiar web controls and compact Inter text. Light working surfaces suit a busy, brightly lit event venue.
STORY: Read coverage; cancel an assignment; see the gap; request an eligible repair; inspect reasons; approve; verify recovery and history.
FIRST VIEWPORT: Event title and date above compact view tabs. A horizontal coverage strip feeds a role-by-time staffing ledger. A narrow repair queue sits alongside, with review as the primary action and an optional real agent panel on the right.
FORM: Broadcast production call-sheet density, candidate 5 of seven grounded forms; seed:32ac82974303ee6b. Other grounded forms considered: transit timetable, conference programme, museum visitor map, cooperative roster, course schedule, venue signage. User's explicit navy/light operations direction and delegated routine decisions govern. Airport wayfinding contributes decisive status hierarchy; Japanese density contributes disciplined alignment; streaming catalogue is declined because focus expansion hides critical staffing data. No foreign navigation or decorative motifs borrowed.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints and references
No invented performance/adoption metrics; all conference data visibly synthetic. Preserve Agent-Native shell and chat behavior. No drag-and-drop dependency. Reduced motion must retain immediate status feedback.
Research: https://21st.dev/community/components (navigation and dashboard categories); https://magicui.design/docs/components/animated-list (status-list motion only); https://60fps.design/ (state-transition references). Mobbin's web index requires login for useful examples; beUI was inaccessible. React Bits blur-text was examined and rejected for operational labels. No external component code copied.
